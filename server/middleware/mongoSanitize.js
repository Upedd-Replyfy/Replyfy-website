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

/**
 * Mutate an object in place when possible (Express 5 query is a getter object).
 * Falls back to replacement when the property is writable.
 */
function sanitizeInPlace(target) {
  if (!target || typeof target !== 'object') return
  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key]
      continue
    }
    const val = target[key]
    if (val && typeof val === 'object') {
      if (Array.isArray(val)) {
        target[key] = val.map((item) =>
          item && typeof item === 'object' ? sanitizeValue(item) : item
        )
      } else {
        sanitizeInPlace(val)
      }
    }
  }
}

export function mongoSanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body)
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params)
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query)
  }
  next()
}
