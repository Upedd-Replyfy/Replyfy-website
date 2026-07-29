/**
 * Clamp page/limit query params to safe bounds.
 */
export function clampPagination(query = {}, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit)
  )
  return { page, limit, skip: (page - 1) * limit }
}
