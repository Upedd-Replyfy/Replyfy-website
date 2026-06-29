import mongoose from 'mongoose'

const expertProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    expertType: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpertType', required: true },
    experience: { type: String, default: '' },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    skills: [{ type: String }],
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
    profilePhoto: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    activeAssignments: { type: Number, default: 0 },
    maxAssignments: { type: Number, default: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

expertProfileSchema.index({ category: 1, expertType: 1, availability: 1, status: 1 })
expertProfileSchema.index({ averageRating: -1, completedAnswers: -1 })

export default mongoose.model('ExpertProfile', expertProfileSchema)
