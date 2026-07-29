import crypto from 'crypto'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

/**
 * Run work inside a MongoDB transaction when the deployment supports it
 * (replica set / Atlas). Falls back to non-transactional execution for
 * local standalone Mongo so development keeps working.
 */
export async function withPaymentTransaction(work) {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      result = await work(session)
    })
    return result
  } catch (err) {
    const message = String(err?.message || '')
    const isTxnUnsupported =
      err?.code === 20 ||
      message.includes('Transaction numbers are only allowed') ||
      message.includes('replica set')

    if (!isTxnUnsupported) throw err

    logger.warn('payment_transaction_fallback', {
      reason: 'MongoDB transactions unavailable; running without session',
    })
    return work(null)
  } finally {
    session.endSession()
  }
}

export function timingSafeEqualHex(a, b) {
  try {
    const left = Buffer.from(String(a), 'utf8')
    const right = Buffer.from(String(b), 'utf8')
    if (left.length !== right.length) return false
    return crypto.timingSafeEqual(left, right)
  } catch {
    return false
  }
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = env.razorpay.webhookSecret
  if (!secret || !signature || !rawBody) return false

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeEqualHex(expected, signature)
}
