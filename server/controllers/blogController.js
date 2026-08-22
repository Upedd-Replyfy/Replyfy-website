import Blog, { BLOG_CARD_STYLES } from '../models/Blog.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { slugify } from '../utils/slug.js'

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return value === true || value === 'true' || value === 1 || value === '1'
}

function buildExcerpt(content, excerpt) {
  const trimmed = String(excerpt || '').trim()
  if (trimmed) return trimmed
  const plain = String(content || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return ''
  return plain.length > 180 ? `${plain.slice(0, 177)}...` : plain
}

async function uniqueSlug(title, explicit, excludeId) {
  const base = slugify(explicit || title)
  if (!base) throw new ApiError(400, 'A blog title is required')
  let slug = base
  let n = 2
  while (true) {
    const existing = await Blog.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
    if (!existing) return slug
    slug = `${base}-${n}`
    n += 1
  }
}

function formatBlogPublic(doc) {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    author: doc.author,
    excerpt: doc.excerpt,
    coverImage: doc.coverImage,
    cardStyle: doc.cardStyle,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

async function uploadCoverImage(file) {
  const { uploadBufferToCloudinary } = await import('../config/cloudinary.js')
  const uploaded = await uploadBufferToCloudinary(file.buffer, 'replyfy/blogs', file.originalname)
  return { url: uploaded.url, publicId: uploaded.publicId }
}

function parseCardStyle(value) {
  const style = String(value || 'default').trim()
  if (!BLOG_CARD_STYLES.includes(style)) {
    throw new ApiError(400, `Invalid card style. Use: ${BLOG_CARD_STYLES.join(', ')}`)
  }
  return style
}

export const listPublicBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .sort({ sortOrder: 1, publishedAt: -1, createdAt: -1 })
    .select('title slug author excerpt coverImage cardStyle publishedAt createdAt updatedAt')
  res.json({ success: true, blogs })
})

export const getPublicBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
  if (!blog) throw new ApiError(404, 'Blog post not found')
  res.json({
    success: true,
    blog: {
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      author: blog.author,
      content: blog.content,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      cardStyle: blog.cardStyle,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    },
  })
})

export const listAdminBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ sortOrder: 1, createdAt: -1 })
  res.json({ success: true, blogs })
})

export const createBlog = asyncHandler(async (req, res) => {
  const { title, author, content, excerpt, cardStyle, sortOrder } = req.body
  if (!title?.trim()) throw new ApiError(400, 'Title is required')
  if (!author?.trim()) throw new ApiError(400, 'Author is required')
  if (!content?.trim()) throw new ApiError(400, 'Content is required')

  const slug = await uniqueSlug(title, req.body.slug)
  const isPublished = toBool(req.body.isPublished, false)
  let coverImage = ''
  let coverImagePublicId = ''

  if (req.file) {
    const uploaded = await uploadCoverImage(req.file)
    coverImage = uploaded.url
    coverImagePublicId = uploaded.publicId
  }

  const blog = await Blog.create({
    title: title.trim(),
    slug,
    author: author.trim(),
    content: content.trim(),
    excerpt: buildExcerpt(content, excerpt),
    coverImage,
    coverImagePublicId,
    cardStyle: parseCardStyle(cardStyle),
    isPublished,
    publishedAt: isPublished ? new Date() : undefined,
    sortOrder: Number(sortOrder) || 0,
    createdBy: req.user._id,
  })

  res.status(201).json({ success: true, blog })
})

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) throw new ApiError(404, 'Blog post not found')

  const { title, author, content, excerpt, cardStyle, sortOrder } = req.body
  if (title !== undefined) blog.title = String(title).trim()
  if (author !== undefined) blog.author = String(author).trim()
  if (content !== undefined) blog.content = String(content).trim()
  if (excerpt !== undefined || content !== undefined) {
    blog.excerpt = buildExcerpt(blog.content, excerpt !== undefined ? excerpt : blog.excerpt)
  }
  if (cardStyle !== undefined) blog.cardStyle = parseCardStyle(cardStyle)
  if (sortOrder !== undefined) blog.sortOrder = Number(sortOrder) || 0

  if (req.body.slug !== undefined && req.body.slug !== blog.slug) {
    blog.slug = await uniqueSlug(blog.title, req.body.slug, blog._id)
  } else if (title !== undefined && title.trim() !== blog.title) {
    blog.slug = await uniqueSlug(blog.title, undefined, blog._id)
  }

  if (req.body.isPublished !== undefined) {
    const nextPublished = toBool(req.body.isPublished, blog.isPublished)
    if (nextPublished && !blog.isPublished) blog.publishedAt = new Date()
    blog.isPublished = nextPublished
  }

  if (req.file) {
    const uploaded = await uploadCoverImage(req.file)
    blog.coverImage = uploaded.url
    blog.coverImagePublicId = uploaded.publicId
  }

  await blog.save()
  res.json({ success: true, blog })
})

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id)
  if (!blog) throw new ApiError(404, 'Blog post not found')
  res.json({ success: true, message: 'Blog post deleted' })
})
