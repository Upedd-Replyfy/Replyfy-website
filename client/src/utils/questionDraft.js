const STORAGE_KEY = 'replyfy:questionDraft'

export function saveQuestionDraft({ query, categoryName, expertTypeName }) {
  const trimmed = typeof query === 'string' ? query.trim() : ''
  if (!trimmed) {
    clearQuestionDraft()
    return
  }

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query: query.trimEnd(),
        categoryName: categoryName || null,
        expertTypeName: expertTypeName || null,
        savedAt: Date.now(),
      })
    )
  } catch {
    // sessionStorage may be unavailable (private mode quotas, etc.)
  }
}

export function loadQuestionDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.query !== 'string' || !parsed.query.trim()) return null
    return parsed
  } catch {
    return null
  }
}

export function clearQuestionDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function namesMatch(a, b) {
  if (!a || !b) return false
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
}
