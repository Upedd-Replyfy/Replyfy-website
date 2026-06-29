import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAccessToken(userId, role) {
  return jwt.sign({ id: userId, role }, env.jwtSecret, { expiresIn: env.jwtExpire })
}

export function signRefreshToken(userId) {
  return jwt.sign({ id: userId }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpire })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret)
}
