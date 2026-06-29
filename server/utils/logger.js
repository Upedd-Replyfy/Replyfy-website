import { env } from '../config/env.js'

const isDev = env.nodeEnv === 'development'

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString()
  if (isDev) {
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
  }
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(meta && { meta }),
  })
}

export const logger = {
  info(message, meta) {
    console.log(formatMessage('info', message, meta))
  },
  warn(message, meta) {
    console.warn(formatMessage('warn', message, meta))
  },
  error(message, meta) {
    const payload = meta instanceof Error
      ? { ...meta, stack: meta.stack, message: meta.message }
      : meta
    console.error(formatMessage('error', message, payload))
  },
  debug(message, meta) {
    if (isDev) {
      console.debug(formatMessage('debug', message, meta))
    }
  },
}
