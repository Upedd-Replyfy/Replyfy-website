import mongoose from 'mongoose'

const expertTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

expertTypeSchema.index({ category: 1, slug: 1 }, { unique: true })
expertTypeSchema.index({ category: 1, isActive: 1, sortOrder: 1 })

export default mongoose.model('ExpertType', expertTypeSchema)
