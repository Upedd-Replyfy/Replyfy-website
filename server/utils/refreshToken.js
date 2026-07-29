import crypto from 'crypto'
import { env } from '../config/env.js'

/** HMAC-SHA256 digest of a refresh token for at-rest storage. */
export function hashRefreshToken(token) {
  return crypto.createHmac('sha256', env.jwtRefreshSecret).update(token).digest('hex')
}

function isStoredHash(stored) {
  return typeof stored === 'string' && /^[a-f0-9]{64}$/i.test(stored)
}

/**
 * Compare a presented refresh token to the DB value.
 * Supports legacy plaintext values and upgrades callers to re-hash on match.
 */
export function matchesRefreshToken(stored, presented) {
  if (!stored || !presented) return false
  if (isStoredHash(stored)) {
    const expected = Buffer.from(stored, 'hex')
    const actual = Buffer.from(hashRefreshToken(presented), 'hex')
    if (expected.length !== actual.length) return false
    return crypto.timingSafeEqual(expected, actual)
  }
  return stored === presented
}

export function shouldRehashRefreshToken(stored) {
  return Boolean(stored) && !isStoredHash(stored)
}
