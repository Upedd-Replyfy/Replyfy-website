import Payment from '../models/Payment.js'
import Question from '../models/Question.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { getRazorpay } from '../config/razorpay.js'
import { incrementCouponUsage } from './couponService.js'
import { createNotification, notifyAdmins } from './notificationService.js'
import { logAudit } from './auditService.js'
import { logger } from '../utils/logger.js'
import { withPaymentTransaction } from '../utils/paymentTxn.js'

/**
 * Fetch payment from Razorpay and assert it matches our DB order.
 * @returns {Promise<object|null>} Razorpay payment entity, or null in allowed skip cases
 */
export async function fetchAndAssertRazorpayPayment({
  razorpayPaymentId,
  expectedOrderId,
  expectedAmountPaise,
  expectedCurrency = 'INR',
}) {
  const razorpay = getRazorpay()
  if (!razorpay) return null

  const rpPayment = await razorpay.payments.fetch(razorpayPaymentId)
  if (!rpPayment) {
    throw new ApiError(400, 'Unable to fetch payment from Razorpay')
  }

  if (rpPayment.status !== 'captured') {
    throw new ApiError(400, `Payment not captured (status: ${rpPayment.status})`)
  }

  if (rpPayment.order_id !== expectedOrderId) {
    throw new ApiError(400, 'Razorpay order mismatch')
  }

  if (Number(rpPayment.amount) !== Number(expectedAmountPaise)) {
    throw new ApiError(400, 'Razorpay amount mismatch')
  }

  if (String(rpPayment.currency).toUpperCase() !== String(expectedCurrency).toUpperCase()) {
    throw new ApiError(400, 'Razorpay currency mismatch')
  }

  return rpPayment
}

async function runSideEffects({ payment, question, user, source, ip }) {
  if (payment.sideEffectsCompleted) return

  await createNotification({
    userId: user._id,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Your payment of ₹${question.amount / 100} was successful. Question is pending admin review.`,
    link: `/dashboard/questions/${question._id}`,
    email: user.email,
  })

  await createNotification({
    userId: user._id,
    type: 'question_submitted',
    title: 'Question Submitted',
    message: 'Your question has been submitted and is awaiting admin review.',
    link: `/dashboard/questions/${question._id}`,
    email: user.email,
  })

  const admins = await User.find({ role: 'admin', isActive: true })
  await notifyAdmins({
    type: 'question_submitted',
    title: 'New Question for Review',
    message: `New question "${question.title}" requires admin review.`,
    link: `/admin/questions/${question._id}`,
    admins,
  })

  await logAudit({
    action: 'payment_verified',
    entityType: 'Payment',
    entityId: payment._id,
    performedBy: user._id,
    metadata: { questionId: question._id, source },
    ip,
  })

  await Payment.updateOne({ _id: payment._id }, { $set: { sideEffectsCompleted: true } })
}

/**
 * Atomically mark a payment paid and move the question to admin review.
 * Safe to call from client verify or webhook (idempotent).
 */
export async function finalizeSuccessfulPayment({
  paymentDoc,
  razorpayPaymentId,
  razorpaySignature = '',
  source = 'client_verify',
  ip,
}) {
  const paymentId = paymentDoc._id

  const result = await withPaymentTransaction(async (session) => {
    const opts = session ? { session } : undefined

    const claimed = await Payment.findOneAndUpdate(
      { _id: paymentId, status: 'created' },
      {
        $set: {
          status: 'paid',
          razorpayPaymentId: razorpayPaymentId || paymentDoc.razorpayPaymentId,
          razorpaySignature: razorpaySignature || paymentDoc.razorpaySignature || '',
          verifiedVia: source,
          paidAt: new Date(),
        },
      },
      { new: true, ...opts }
    )

    if (!claimed) {
      const existing = await Payment.findById(paymentId).session(session || null)
      return { alreadyProcessed: true, payment: existing }
    }

    const question = await Question.findById(claimed.question).session(session || null)
    if (!question) {
      throw new ApiError(404, 'Question not found')
    }

    if (question.status === 'pending_payment') {
      question.status = 'pending_admin_review'
      question.payment = claimed._id
      question.amount = claimed.amount
      await question.save(opts)
    } else if (!question.payment) {
      question.payment = claimed._id
      await question.save(opts)
    }

    if (claimed.couponCode && !claimed.couponUsageCounted) {
      await incrementCouponUsage(claimed.couponCode, session)
      claimed.couponUsageCounted = true
      await claimed.save(opts)
    }

    const user = await User.findById(claimed.user).session(session || null)
    if (!user) throw new ApiError(404, 'User not found')

    return {
      alreadyProcessed: false,
      payment: claimed,
      question,
      user,
    }
  })

  if (result.alreadyProcessed) {
    logger.info('payment_already_finalized', {
      paymentId: String(paymentId),
      source,
    })
    const question = await Question.findById(result.payment?.question)
    return {
      alreadyProcessed: true,
      payment: result.payment,
      question,
    }
  }

  try {
    await runSideEffects({
      payment: result.payment,
      question: result.question,
      user: result.user,
      source,
      ip,
    })
  } catch (err) {
    // Core payment state is committed; log side-effect failures for retry/ops.
    logger.error('payment_side_effects_failed', {
      paymentId: String(result.payment._id),
      source,
      error: err.message,
    })
  }

  logger.info('payment_success', {
    paymentId: String(result.payment._id),
    questionId: String(result.question._id),
    amount: result.payment.amount,
    source,
  })

  return {
    alreadyProcessed: false,
    payment: result.payment,
    question: result.question,
  }
}

export async function markPaymentFailed({ paymentDoc, reason = 'payment_failed', source = 'webhook' }) {
  if (!paymentDoc || paymentDoc.status === 'paid') {
    return { ignored: true, payment: paymentDoc }
  }

  if (paymentDoc.status === 'failed') {
    return { ignored: true, payment: paymentDoc }
  }

  const updated = await Payment.findOneAndUpdate(
    { _id: paymentDoc._id, status: 'created' },
    {
      $set: {
        status: 'failed',
        verifiedVia: source,
        metadata: {
          ...(paymentDoc.metadata || {}),
          failureReason: reason,
        },
      },
    },
    { new: true }
  )

  logger.info('payment_failure', {
    paymentId: String(paymentDoc._id),
    orderId: paymentDoc.razorpayOrderId,
    source,
    reason,
  })

  return { ignored: !updated, payment: updated || paymentDoc }
}
