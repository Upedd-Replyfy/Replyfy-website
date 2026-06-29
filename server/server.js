import app from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { validateEnv } from './config/validateEnv.js'
import { logger } from './utils/logger.js'

validateEnv()

let server

async function start() {
  await connectDB()

  server = app.listen(env.port, () => {
    logger.info(`Server started on http://localhost:${env.port}`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${env.port} is already in use — stop the other process and restart.`)
    } else {
      logger.error('Server error', err)
    }
    process.exit(1)
  })
}

function shutdown(signal) {
  if (!server) {
    process.exit(0)
    return
  }

  logger.info(`${signal} received — closing server`)
  if (typeof server.closeAllConnections === 'function') {
    server.closeAllConnections()
  }
  server.close(() => {
    process.exit(0)
  })

  setTimeout(() => process.exit(0), 1500).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start().catch((err) => {
  logger.error('Failed to start server', err)
  process.exit(1)
})
