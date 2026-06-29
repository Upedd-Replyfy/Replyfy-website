import { env } from './env.js'
import { logger } from '../utils/logger.js'

const requiredInProduction = ['mongoUri', 'jwtSecret', 'jwtRefreshSecret']

export function validateEnv() {
  const missing = requiredInProduction.filter((key) => !env[key])

  if (missing.length === 0) return

  const message = `Missing required environment variables: ${missing.join(', ')}`

  if (env.nodeEnv === 'production') {
    logger.error(message)
    process.exit(1)
  }

  logger.warn(`${message} (allowed in development)`)
}
