import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }

  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0]
    message = `${field} already exists`
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  if (env.nodeEnv === 'development') {
    logger.error(err.message, err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  })
}

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`))
}
