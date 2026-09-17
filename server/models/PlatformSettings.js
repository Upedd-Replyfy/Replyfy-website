import mongoose from 'mongoose'

export const DEFAULT_MENTOR_PROFILE_VISIBILITY = {
  bio: true,
  experience: true,
  skills: true,
  education: true,
  certificates: true,
  achievements: true,
  reviews: true,
}

const visibilityFields = {
  bio: { type: Boolean, default: true },
  experience: { type: Boolean, default: true },
  skills: { type: Boolean, default: true },
  education: { type: Boolean, default: true },
  certificates: { type: Boolean, default: true },
  achievements: { type: Boolean, default: true },
  reviews: { type: Boolean, default: true },
}

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'platform' },
    mentorProfileVisibility: visibilityFields,
    mentorTypesEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema)

let settingsCache = { at: 0, doc: null }
const CACHE_MS = 60_000

export function invalidatePlatformSettingsCache() {
  settingsCache = { at: 0, doc: null }
}

export async function getPlatformSettingsDoc() {
  const now = Date.now()
  if (settingsCache.doc && now - settingsCache.at < CACHE_MS) {
    return settingsCache.doc
  }

  let doc = await PlatformSettings.findOne({ key: 'platform' }).lean()
  if (!doc) {
    doc = await PlatformSettings.findOneAndUpdate(
      { key: 'platform' },
      {
        $setOnInsert: {
          key: 'platform',
          mentorProfileVisibility: DEFAULT_MENTOR_PROFILE_VISIBILITY,
          mentorTypesEnabled: true,
        },
      },
      { new: true, upsert: true }
    ).lean()
  }

  settingsCache = { at: now, doc }
  return doc
}

export async function getMentorProfileVisibilitySettings() {
  const settings = await getPlatformSettingsDoc()
  return { ...DEFAULT_MENTOR_PROFILE_VISIBILITY, ...settings.mentorProfileVisibility }
}

export async function isMentorTypesEnabled() {
  const settings = await getPlatformSettingsDoc()
  return settings.mentorTypesEnabled !== false
}

export default PlatformSettings
