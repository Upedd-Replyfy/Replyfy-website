import Razorpay from 'razorpay'
import crypto from 'crypto'
import { env } from './env.js'
import { timingSafeEqualHex, verifyWebhookSignature } from '../utils/paymentTxn.js'

let razorpay = null

/** Dev checkout without Razorpay keys — never in production unless explicitly allowed. */
export function allowDevPayments() {
  if (env.razorpay.keyId && env.razorpay.keySecret) return false
  if (env.allowDevPayments) return true
  return env.nodeEnv !== 'production'
}

export function getRazorpay() {
  if (!razorpay && env.razorpay.keyId && env.razorpay.keySecret) {
    razorpay = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    })
  }
  return razorpay
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature || !env.razorpay.keySecret) return false

  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(body)
    .digest('hex')

  return timingSafeEqualHex(expected, signature)
}

export { verifyWebhookSignature }

export async function fetchRazorpayPayment(paymentId) {
  const client = getRazorpay()
  if (!client) return null
  return client.payments.fetch(paymentId)
}
