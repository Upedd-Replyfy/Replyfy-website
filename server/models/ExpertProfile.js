import mongoose from 'mongoose'

const expertProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    expertType: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpertType', required: true },
    /** Additional categories this mentor covers (includes primary when set) */
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    /** Additional mentor types this mentor covers (includes primary when set) */
    expertTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExpertType' }],
    experience: { type: String, default: '' },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    skills: [{ type: String }],
    education: [
      {
        school: { type: String, default: '' },
        degree: { type: String, default: '' },
        field: { type: String, default: '' },
        year: { type: String, default: '' },
      },
    ],
    certificates: [
      {
        title: { type: String, default: '' },
        issuer: { type: String, default: '' },
        year: { type: String, default: '' },
      },
    ],
    achievements: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        year: { type: String, default: '' },
      },
    ],
    profileVisibility: {
      bio: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      certificates: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
    },
    hourlyPrice: { type: Number, default: 0 },
    questionPrice: { type: Number, default: 99900 },
    completedAnswers: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    responseTime: { type: Number, default: 48 },
    availability: {
      type: String,
      enum: ['available', 'unavailable', 'busy'],
      default: 'available',
    },
    videoCallAvailable: { type: Boolean, default: false },
    profilePhoto: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    activeAssignments: { type: Number, default: 0 },
    /** Soft capacity for auto-match preference; admins can still assign above this. */
    maxAssignments: { type: Number, default: 50 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

expertProfileSchema.index({ category: 1, expertType: 1, availability: 1, status: 1 })
// MongoDB cannot compound-index two array fields together ("parallel arrays")
expertProfileSchema.index({ categories: 1, availability: 1, status: 1 })
expertProfileSchema.index({ expertTypes: 1, availability: 1, status: 1 })
expertProfileSchema.index({ averageRating: -1, completedAnswers: -1 })

export default mongoose.model('ExpertProfile', expertProfileSchema)
