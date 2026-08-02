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
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => parseIdList(item))
      .filter(Boolean)
  }
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
    // Single ObjectId or comma-separated ids
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return [trimmed]
  }
  return [String(value)]
}

/** Prefer the richest non-empty id list among FormData / JSON / legacy fields. */
export function resolveIdList(...candidates) {
  let best = []
  for (const candidate of candidates) {
    const parsed = parseIdList(candidate)
    if (parsed.length > best.length) best = parsed
  }
  // Dedupe, keep order
  const seen = new Set()
  return best.filter((id) => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

/**
 * Merge explicit category ids with categories implied by selected mentor types.
 * Dedupes while preserving order (explicit categories first).
 */
export function mergeCategoryIdsWithTypes(categoryIds, types) {
  const merged = []
  const seen = new Set()
  for (const id of categoryIds.map(String).filter(Boolean)) {
    if (!seen.has(id)) {
      seen.add(id)
      merged.push(id)
    }
  }
  for (const t of types || []) {
    const catId = String(t.category?._id || t.category || '')
    if (catId && !seen.has(catId)) {
      seen.add(catId)
      merged.push(catId)
    }
  }
  return merged
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
