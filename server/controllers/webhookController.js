import Payment from '../models/Payment.js'
import WebhookEvent from '../models/WebhookEvent.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { verifyWebhookSignature } from '../config/razorpay.js'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'
import {
  finalizeSuccessfulPayment,
  markPaymentFailed,
} from '../services/paymentCompletionService.js'

function getPaymentEntity(payload) {
  return payload?.payload?.payment?.entity || null
}

function buildEventId(req, event, paymentEntity) {
  const headerId = req.headers['x-razorpay-event-id']
  if (headerId) return String(headerId)
  const paymentId = paymentEntity?.id || 'unknown'
  const createdAt = req.body?.created_at || Date.now()
  return `${event}:${paymentId}:${createdAt}`
}

/**
 * POST /api/webhooks/razorpay
 * Requires raw body buffer on req (mounted with express.raw).
 */
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  if (!env.razorpay.webhookSecret) {
    logger.error('webhook_secret_missing')
    throw new ApiError(503, 'Webhook secret not configured')
  }

  const signature = req.headers['x-razorpay-signature']
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))

  if (!verifyWebhookSignature(rawBody, signature)) {
    logger.warn('webhook_signature_failure')
    throw new ApiError(400, 'Invalid webhook signature')
  }

  let payload
  try {
    payload = JSON.parse(rawBody.toString('utf8'))
  } catch {
    throw new ApiError(400, 'Invalid webhook payload')
  }

  const event = payload.event
  const paymentEntity = getPaymentEntity(payload)
  const eventId = buildEventId(req, event, paymentEntity)

  logger.info('webhook_received', {
    event,
    eventId,
    orderId: paymentEntity?.order_id || null,
    paymentId: paymentEntity?.id || null,
  })

  try {
    await WebhookEvent.create({
      eventId,
      event,
      razorpayPaymentId: paymentEntity?.id || '',
      razorpayOrderId: paymentEntity?.order_id || '',
      status: 'processed',
    })
  } catch (err) {
    if (err?.code === 11000) {
      logger.info('webhook_duplicate', { eventId, event })
      return res.json({ success: true, duplicate: true })
    }
    throw err
  }

  if (!paymentEntity?.order_id) {
    await WebhookEvent.updateOne({ eventId }, { $set: { status: 'ignored', notes: 'missing_payment_entity' } })
    return res.json({ success: true, ignored: true })
  }

  const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id })
  if (!payment) {
    await WebhookEvent.updateOne(
      { eventId },
      { $set: { status: 'ignored', notes: 'payment_not_found' } }
    )
    logger.warn('webhook_payment_not_found', {
      eventId,
      orderId: paymentEntity.order_id,
    })
    return res.json({ success: true, ignored: true })
  }

  await WebhookEvent.updateOne({ eventId }, { $set: { payment: payment._id } })

  if (event === 'payment.captured') {
    if (Number(paymentEntity.amount) !== Number(payment.amount)) {
      logger.warn('webhook_amount_mismatch', {
        eventId,
        expected: payment.amount,
        received: paymentEntity.amount,
      })
      await WebhookEvent.updateOne({ eventId }, { $set: { status: 'failed', notes: 'amount_mismatch' } })
      return res.status(400).json({ success: false, message: 'Amount mismatch' })
    }

    if (String(paymentEntity.currency || '').toUpperCase() !== 'INR') {
      await WebhookEvent.updateOne({ eventId }, { $set: { status: 'failed', notes: 'currency_mismatch' } })
      return res.status(400).json({ success: false, message: 'Currency mismatch' })
    }

    const result = await finalizeSuccessfulPayment({
      paymentDoc: payment,
      razorpayPaymentId: paymentEntity.id,
      razorpaySignature: '',
      source: 'webhook',
      ip: req.ip,
    })

    return res.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
    })
  }

  if (event === 'payment.failed') {
    await markPaymentFailed({
      paymentDoc: payment,
      reason: paymentEntity.error_description || paymentEntity.error_code || 'payment_failed',
      source: 'webhook',
    })
    return res.json({ success: true })
  }

  await WebhookEvent.updateOne({ eventId }, { $set: { status: 'ignored', notes: 'unhandled_event' } })
  return res.json({ success: true, ignored: true })
})
