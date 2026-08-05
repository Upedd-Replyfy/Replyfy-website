/** Normalize education / certificate / achievement list fields from JSON or arrays. */

function asObjectList(value) {
  if (value == null || value === '') return null
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

function cleanString(v) {
  return String(v ?? '').trim()
}

export function parseEducation(value) {
  const list = asObjectList(value)
  if (list == null) return undefined
  return list
    .map((item) => ({
      school: cleanString(item?.school),
      degree: cleanString(item?.degree),
      field: cleanString(item?.field),
      year: cleanString(item?.year),
    }))
    .filter((item) => item.school || item.degree || item.field)
}

export function parseCertificates(value) {
  const list = asObjectList(value)
  if (list == null) return undefined
  return list
    .map((item) => ({
      title: cleanString(item?.title),
      issuer: cleanString(item?.issuer),
      year: cleanString(item?.year),
    }))
    .filter((item) => item.title)
}

export function parseAchievements(value) {
  const list = asObjectList(value)
  if (list == null) return undefined
  return list
    .map((item) => ({
      title: cleanString(item?.title),
      description: cleanString(item?.description),
      year: cleanString(item?.year),
    }))
    .filter((item) => item.title)
}

export function applyProfileDetails(profile, body = {}) {
  const education = parseEducation(body.education ?? body.educationJson)
  const certificates = parseCertificates(body.certificates ?? body.certificatesJson)
  const achievements = parseAchievements(body.achievements ?? body.achievementsJson)
  if (education !== undefined) profile.education = education
  if (certificates !== undefined) profile.certificates = certificates
  if (achievements !== undefined) profile.achievements = achievements
}
