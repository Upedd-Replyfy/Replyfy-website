/**
 * Strip MongoDB operator keys ($gt, $where, etc.) from request data.
 * express-mongo-sanitize breaks on Express 5 (req.query is read-only).
 */
function sanitizeValue(value) {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(sanitizeValue)

  const clean = {}
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) continue
    clean[key] = sanitizeValue(val)
  }
  return clean
}

export function mongoSanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body)
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params)
  }
  next()
}
