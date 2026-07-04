const STORAGE_KEY = 'replyfy-saved-answers'

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function getSavedQuestionIds() {
  return readIds()
}

export function isQuestionSaved(id) {
  return readIds().includes(id)
}

export function toggleSavedQuestion(id) {
  const ids = readIds()
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
  writeIds(next)
  return next.includes(id)
}
