/**
 * Mongo query fragment: mentor matches a question category + type
 * via primary fields or multi-select arrays.
 */
export function expertMatchesCategoryType(categoryId, expertTypeId) {
  return {
    $and: [
      {
        $or: [{ category: categoryId }, { categories: categoryId }],
      },
      {
        $or: [{ expertType: expertTypeId }, { expertTypes: expertTypeId }],
      },
    ],
  }
}

/** Parse id list from JSON string, comma string, array, or single id. */
export function parseIdList(value) {
  if (value == null || value === '') return []
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
      } catch {
        return []
      }
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return [String(value)]
}

export function profileCoversCategoryType(profile, categoryId, expertTypeId) {
  const catIds = new Set(
    [profile.category, ...(profile.categories || [])]
      .map((c) => String(c?._id || c || ''))
      .filter(Boolean)
  )
  const typeIds = new Set(
    [profile.expertType, ...(profile.expertTypes || [])]
      .map((t) => String(t?._id || t || ''))
      .filter(Boolean)
  )
  return catIds.has(String(categoryId)) && typeIds.has(String(expertTypeId))
}
