import mongoose from 'mongoose'

export const BLOG_CARD_STYLES = ['default', 'featured', 'compact', 'minimal']

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    author: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    coverImagePublicId: { type: String, default: '' },
    cardStyle: {
      type: String,
      enum: BLOG_CARD_STYLES,
      default: 'default',
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

blogSchema.index({ isPublished: 1, sortOrder: 1, publishedAt: -1 })

export default mongoose.model('Blog', blogSchema)
