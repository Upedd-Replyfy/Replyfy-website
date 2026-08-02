import Question from '../models/Question.js'
import Payment from '../models/Payment.js'
import Category from '../models/Category.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { getPlanAmount, planRequiresExpertSelection } from '../constants/pricing.js'
import { env } from '../config/env.js'
import { getRazorpay, verifyPaymentSignature, allowDevPayments } from '../config/razorpay.js'
import { uploadFiles } from '../utils/uploadFiles.js'
import { validateCoupon } from '../services/couponService.js'
import { clampPagination } from '../utils/pagination.js'
import { logger } from '../utils/logger.js'
import {
  fetchAndAssertRazorpayPayment,
  finalizeSuccessfulPayment,
} from '../services/paymentCompletionService.js'

export const initiateQuestion = asyncHandler(async (req, res) => {
  const { title, description, category, expertType, priority, plan, selectedExpert } = req.body

  const cat = await Category.findById(category)
  if (!cat || !cat.isActive) throw new ApiError(400, 'Invalid category')

  const ExpertType = (await import('../models/ExpertType.js')).default
  const type = await ExpertType.findById(expertType)
  if (!type || !type.isActive || type.category.toString() !== category.toString()) {
    throw new ApiError(400, 'Invalid mentor type for this category')
  }

  if (planRequiresExpertSelection(plan) && !selectedExpert) {
    throw new ApiError(400, 'This plan requires mentor selection')
  }

  if (planRequiresExpertSelection(plan) && selectedExpert) {
    const ExpertProfile = (await import('../models/ExpertProfile.js')).default
    const { expertMatchesCategoryType } = await import('../utils/expertMatch.js')
    const profile = await ExpertProfile.findOne({
      user: selectedExpert,
      ...expertMatchesCategoryType(category, expertType),
      availability: 'available',
      status: 'active',
    })
    if (!profile) throw new ApiError(400, 'Selected mentor is not available for this category and type')
  }

  const amount = getPlanAmount(plan)
  const attachments = await uploadFiles(req.files, 'replyfy/questions')

  const question = await Question.create({
    user: req.user._id,
    title,
    description,
    category,
    expertType,
    priority: priority || 'standard',
    plan,
    selectedExpert: planRequiresExpertSelection(plan) ? selectedExpert : undefined,
    attachments,
    status: 'pending_payment',
    amount,
  })

  res.status(201).json({ success: true, question })
})

export const validateCouponCode = asyncHandler(async (req, res) => {
  const { code, plan } = req.body
  if (!plan) throw new ApiError(400, 'Plan is required')

  const result = await validateCoupon({ code, plan })
  res.json({ success: true, coupon: result })
})

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { questionId, couponCode } = req.body
  const question = await Question.findOne({ _id: questionId, user: req.user._id })
  if (!question) throw new ApiError(404, 'Question not found')
  if (question.status !== 'pending_payment') {
    throw new ApiError(400, 'Question is not pending payment')
  }

  const alreadyPaid = await Payment.findOne({ question: question._id, status: 'paid' })
  if (alreadyPaid) throw new ApiError(400, 'Question already paid')

  // Always price from the plan table so coupons cannot stack on a reduced amount.
  const planAmount = getPlanAmount(question.plan)
  let payableAmount = planAmount
  let discountAmount = 0
  let appliedCouponCode = ''

  if (couponCode) {
    const coupon = await validateCoupon({
      code: couponCode,
      plan: question.plan,
      amountPaise: planAmount,
    })
    payableAmount = coupon.finalAmount
    discountAmount = coupon.discountAmount
    appliedCouponCode = coupon.code

    question.originalAmount = planAmount
    question.discountAmount = discountAmount
    question.couponCode = appliedCouponCode
    question.amount = payableAmount
    await question.save()
  } else {
    // Reset any previous unused coupon draft so abandoned discounts do not stick.
    question.originalAmount = planAmount
    question.discountAmount = 0
    question.couponCode = ''
    question.amount = planAmount
    await question.save()
    payableAmount = planAmount
  }

  // Supersede prior unpaid orders for this question.
  await Payment.updateMany(
    { question: question._id, user: req.user._id, status: 'created' },
    { $set: { status: 'failed' } }
  )

  const razorpay = getRazorpay()
  if (!razorpay) {
    if (!allowDevPayments()) {
      throw new ApiError(503, 'Payment gateway is not configured')
    }
    const payment = await Payment.create({
      user: req.user._id,
      question: question._id,
      plan: question.plan,
      amount: payableAmount,
      originalAmount: planAmount,
      discountAmount,
      couponCode: appliedCouponCode,
      razorpayOrderId: `dev_order_${question._id}_${Date.now()}`,
      status: 'created',
    })
    logger.info('payment_order_created', {
      paymentId: String(payment._id),
      questionId: String(question._id),
      orderId: payment.razorpayOrderId,
      amount: payableAmount,
      mode: 'dev',
    })
    return res.json({
      success: true,
      devMode: true,
      orderId: payment.razorpayOrderId,
      amount: payableAmount,
      discountAmount,
      currency: 'INR',
      key: 'dev',
      paymentId: payment._id,
    })
  }

  const order = await razorpay.orders.create({
    amount: payableAmount,
    currency: 'INR',
    receipt: `q_${question._id}`.slice(0, 40),
    notes: { questionId: question._id.toString(), userId: req.user._id.toString() },
  })

  const payment = await Payment.create({
    user: req.user._id,
    question: question._id,
    plan: question.plan,
    amount: payableAmount,
    originalAmount: planAmount,
    discountAmount,
    couponCode: appliedCouponCode,
    razorpayOrderId: order.id,
    status: 'created',
  })

  logger.info('payment_order_created', {
    paymentId: String(payment._id),
    questionId: String(question._id),
    orderId: order.id,
    amount: payableAmount,
  })

  res.json({
    success: true,
    orderId: order.id,
    amount: payableAmount,
    discountAmount,
    currency: 'INR',
    key: env.razorpay.keyId,
    paymentId: payment._id,
  })
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, questionId } = req.body

  if (!razorpayOrderId) throw new ApiError(400, 'Order ID is required')

  const payment = await Payment.findOne({ razorpayOrderId, user: req.user._id })
  if (!payment) throw new ApiError(404, 'Payment not found')

  logger.info('payment_verify_attempt', {
    paymentId: String(payment._id),
    orderId: razorpayOrderId,
    status: payment.status,
  })

  // Idempotent: already verified (client or webhook) — same response shape.
  if (payment.status === 'paid') {
    const question = await Question.findOne({ _id: payment.question, user: req.user._id })
    return res.json({
      success: true,
      message: 'Payment already verified',
      question,
      payment,
    })
  }

  if (payment.status !== 'created') {
    throw new ApiError(400, 'Payment cannot be verified')
  }

  // Bind verify to the question that created the order (prevents questionId swap).
  if (questionId && payment.question.toString() !== questionId.toString()) {
    throw new ApiError(400, 'Payment does not match this question')
  }

  const razorpay = getRazorpay()
  if (razorpay) {
    if (!razorpayPaymentId || !razorpaySignature) {
      throw new ApiError(400, 'Payment signature required')
    }
    const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!valid) {
      logger.warn('payment_signature_failure', {
        paymentId: String(payment._id),
        orderId: razorpayOrderId,
      })
      throw new ApiError(400, 'Invalid payment signature')
    }

    // Server-side source of truth after HMAC.
    await fetchAndAssertRazorpayPayment({
      razorpayPaymentId,
      expectedOrderId: payment.razorpayOrderId,
      expectedAmountPaise: payment.amount,
      expectedCurrency: payment.currency || 'INR',
    })
  } else if (!allowDevPayments()) {
    throw new ApiError(503, 'Payment gateway is not configured')
  }

  const question = await Question.findOne({ _id: payment.question, user: req.user._id })
  if (!question) throw new ApiError(404, 'Question not found')
  if (question.status !== 'pending_payment' && question.status !== 'pending_admin_review') {
    throw new ApiError(400, 'Question is not pending payment')
  }

  const result = await finalizeSuccessfulPayment({
    paymentDoc: payment,
    razorpayPaymentId: razorpayPaymentId || `dev_payment_${Date.now()}`,
    razorpaySignature: razorpaySignature || 'dev_sig',
    source: razorpay ? 'client_verify' : 'dev',
    ip: req.ip,
  })

  res.json({
    success: true,
    message: result.alreadyProcessed ? 'Payment already verified' : 'Payment verified',
    question: result.question,
    payment: result.payment,
  })
})

export const getMyQuestions = asyncHandler(async (req, res) => {
  const { status } = req.query
  const { page, limit, skip } = clampPagination(req.query)
  const query = { user: req.user._id }
  if (status) query.status = String(status)

  const [questions, total] = await Promise.all([
    Question.find(query)
      .populate('category', 'name slug')
      .populate('expertType', 'name slug')
      .populate('assignedExpert', 'name avatar')
      .populate('selectedExpert', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Question.countDocuments(query),
  ])

  res.json({
    success: true,
    questions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 },
  })
})

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, user: req.user._id })
    .populate('category')
    .populate('assignedExpert', 'name avatar')
    .populate('selectedExpert', 'name avatar')
    .populate('payment')

  if (!question) throw new ApiError(404, 'Question not found')

  let answer = null
  if (question.status === 'completed') {
    const Answer = (await import('../models/Answer.js')).default
    answer = await Answer.findOne({ question: question._id, status: 'approved' })
  }

  res.json({ success: true, question, answer })
})

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('question', 'title status')
    .sort({ createdAt: -1 })
  res.json({ success: true, payments })
})
