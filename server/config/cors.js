import { env } from './env.js'

const defaultProductionOrigins = [
  'https://replyfy.org',
  'https://www.replyfy.org',
  'http://localhost:5173',
  'http://localhost:3000',
]

const configuredOrigins = Array.from(
  new Set([
    ...defaultProductionOrigins,
    ...(process.env.CLIENT_URL || '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
  ])
)

function isLocalhostOrigin(origin) {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  } catch {
    return false
  }
}

export function corsOrigin(origin, callback) {
  // Non-browser clients (Postman, server-to-server)
  if (!origin) {
    callback(null, true)
    return
  }

  if (env.nodeEnv === 'development' && isLocalhostOrigin(origin)) {
    callback(null, true)
    return
  }

  if (configuredOrigins.includes(origin)) {
    callback(null, true)
    return
  }

  callback(null, false)
}

export { configuredOrigins, isLocalhostOrigin }
