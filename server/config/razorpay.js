import Razorpay from 'razorpay'
import crypto from 'crypto'
import { env } from './env.js'

let razorpay = null

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
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(body)
    .digest('hex')
  return expected === signature
}
