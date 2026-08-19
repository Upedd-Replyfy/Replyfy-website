import mongoose from 'mongoose'

const planSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    pricePaise: { type: Number, required: true, min: 100 },
    mentorPointsPaise: { type: Number, default: 0, min: 0 },
    features: [{ type: String, trim: true }],
    requiresExpertSelection: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

planSchema.index({ isActive: 1, sortOrder: 1 })

export default mongoose.model('Plan', planSchema)
