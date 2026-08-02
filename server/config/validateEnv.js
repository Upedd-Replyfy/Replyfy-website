import { env } from './env.js'
import { logger } from '../utils/logger.js'

const requiredInProduction = ['mongoUri', 'jwtSecret', 'jwtRefreshSecret']

export function validateEnv() {
  const missing = requiredInProduction.filter((key) => !env[key])

  const razorpayConfigured = Boolean(env.razorpay.keyId && env.razorpay.keySecret)
  if (!razorpayConfigured) {
    logger.warn(
      'Razorpay keys not set — payments disabled until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured' +
        (env.allowDevPayments ? ' (ALLOW_DEV_PAYMENTS=true: unpaid checkout enabled)' : '')
    )
  } else if (env.nodeEnv === 'production' && !env.razorpay.webhookSecret) {
    logger.warn(
      'RAZORPAY_WEBHOOK_SECRET is not set — webhooks will be rejected until configured'
    )
  }

  if (missing.length === 0) return

  const message = `Missing required environment variables: ${missing.join(', ')}`

  if (env.nodeEnv === 'production') {
    logger.error(message)
    process.exit(1)
  }

  logger.warn(`${message} (allowed in development)`)
}
