import { userApi } from '../services/api'
import { PLANS } from '../constants'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load payment checkout')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load payment checkout'))
    document.body.appendChild(script)
  })
}

/**
 * Create/verify payment for an existing question in pending_payment status.
 * @returns {Promise<{ questionId: string, amount: number }>}
 */
export async function payForQuestion(question, { couponCode, planName } = {}) {
  const questionId = question?._id || question
  if (!questionId) throw new Error('Question not found')

  const order = await userApi.createPaymentOrder(questionId, couponCode)

  if (order.devMode) {
    await userApi.verifyPayment({
      razorpayOrderId: order.orderId,
      razorpayPaymentId: 'dev_payment',
      razorpaySignature: 'dev_sig',
      questionId,
    })
    return { questionId, amount: order.amount, mode: 'dev' }
  }

  if (!order?.key || !order?.orderId) {
    throw new Error('Payment order was not created correctly. Please try again.')
  }

  await loadRazorpayScript()

  const label =
    planName ||
    PLANS[question?.plan]?.name ||
    'Question'

  return new Promise((resolve, reject) => {
    try {
      const rzp = new window.Razorpay({
        key: order.key,
        amount: Number(order.amount),
        currency: order.currency || 'INR',
        name: 'Replyfy',
        description: `${label} Plan Question`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await userApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              questionId,
            })
            resolve({ questionId, amount: order.amount, mode: 'razorpay' })
          } catch (err) {
            reject(err)
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
        theme: { color: '#171818' },
      })
      rzp.on('payment.failed', (response) => {
        reject(new Error(response?.error?.description || 'Payment failed'))
      })
      rzp.open()
    } catch (err) {
      reject(new Error(err?.message || 'Unable to open payment checkout'))
    }
  })
}
