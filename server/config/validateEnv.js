import { env } from './env.js'
import { logger } from '../utils/logger.js'

const requiredInProduction = ['mongoUri', 'jwtSecret', 'jwtRefreshSecret']

export function validateEnv() {
  const missing = requiredInProduction.filter((key) => !env[key])

  const razorpayConfigured = Boolean(env.razorpay.keyId && env.razorpay.keySecret)
  if (env.nodeEnv === 'production' && !razorpayConfigured && !env.allowDevPayments) {
    missing.push('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET')
  }

  if (
    env.nodeEnv === 'production' &&
    razorpayConfigured &&
    !env.razorpay.webhookSecret
  ) {
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
