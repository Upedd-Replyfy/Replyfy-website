import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const isDev = env.nodeEnv === 'development'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

/** Brute-force protection for login & register only (not profile/refresh). */
export const loginRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 15,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})
