export const EMPTY_EDUCATION = { school: '', degree: '', field: '', year: '' }
export const EMPTY_CERTIFICATE = { title: '', issuer: '', year: '' }
export const EMPTY_ACHIEVEMENT = { title: '', description: '', year: '' }

export function cleanDetailList(items, requiredKeys) {
  return (items || []).filter((item) =>
    requiredKeys.some((key) => String(item?.[key] || '').trim())
  )
}

export function idListFromRefs(multi, primary) {
  const ids = []
  const seen = new Set()
  for (const item of [...(Array.isArray(multi) ? multi : []), primary]) {
    const id = String(item?._id || item || '')
    if (!id || id === 'undefined' || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}
