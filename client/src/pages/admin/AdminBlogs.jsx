import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  BookOpen,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import ProfilePhotoPicker from '../../components/admin/ProfilePhotoPicker'
import BlogCard, { BLOG_CARD_STYLES } from '../../components/blog/BlogCard'
import { adminApi } from '../../services/api'

const emptyForm = {
  title: '',
  author: '',
  content: '',
  excerpt: '',
  cardStyle: 'default',
  sortOrder: 0,
  isPublished: false,
}

const fieldClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:outline-none focus:ring-4 focus:ring-[#5B4CFF]/10'

const inputClass = `${fieldClass} h-9`

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-light">{hint}</span> : null}
    </label>
  )
}

function ToggleRow({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/70 px-3.5 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-[#5B4CFF]"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] text-muted-light">{hint}</span> : null}
      </span>
    </label>
  )
}

function buildFormData(form, coverFile) {
  const fd = new FormData()
  fd.append('title', form.title.trim())
  fd.append('author', form.author.trim())
  fd.append('content', form.content.trim())
  fd.append('excerpt', form.excerpt.trim())
  fd.append('cardStyle', form.cardStyle)
  fd.append('sortOrder', String(form.sortOrder || 0))
  fd.append('isPublished', form.isPublished ? 'true' : 'false')
  if (coverFile) fd.append('coverImage', coverFile)
  return fd
}

function BlogRow({ blog, index, isNew, onEdit, onToggle, onDelete, togglePending }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -2 }}
      className={`premium-surface group relative rounded-[14px] px-3 py-2.5 transition hover:border-[#5B4CFF]/50 ${
        isNew ? 'ring-1 ring-[#5B4CFF]/40 bg-[#5B4CFF]/5' : ''
      }`}
    >
      <div className="relative z-[1] flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink text-card">
          {blog.coverImage ? (
            <img src={blog.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <BookOpen size={18} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">{blog.title}</h3>
            <AdminStatusBadge tone={blog.isPublished ? 'success' : 'neutral'}>
              {blog.isPublished ? 'Published' : 'Draft'}
            </AdminStatusBadge>
            <AdminStatusBadge tone="info">{blog.cardStyle || 'default'}</AdminStatusBadge>
            {isNew ? <AdminStatusBadge tone="info">Just created</AdminStatusBadge> : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
            <UserRound size={10} className="mr-1 inline" />
            {blog.author}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-light">
            <span>/{blog.slug}</span>
            <span>Order {blog.sortOrder ?? 0}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AdminButton
            variant="secondary"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Edit blog"
            title="Edit"
            onClick={() => onEdit(blog)}
          >
            <Pencil size={13} />
          </AdminButton>
          <button
            type="button"
            onClick={onToggle}
            disabled={togglePending}
            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition disabled:opacity-50 ${
              blog.isPublished
                ? 'border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
            }`}
            title={blog.isPublished ? 'Unpublish' : 'Publish'}
          >
            <Power size={12} />
            <span className="hidden sm:inline">{blog.isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
          <AdminButton
            variant="danger"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Delete blog"
            title="Delete"
            onClick={() => onDelete(blog)}
          >
            <Trash2 size={13} />
          </AdminButton>
        </div>
      </div>
    </motion.article>
  )
}

export default function AdminBlogs() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [coverFile, setCoverFile] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [recentId, setRecentId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => adminApi.getBlogs(),
  })

  const blogs = data?.blogs || []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return blogs
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q)
    )
  }, [blogs, search])

  const stats = useMemo(
    () => [
      { label: 'Total posts', value: blogs.length },
      { label: 'Published', value: blogs.filter((b) => b.isPublished).length },
      { label: 'Drafts', value: blogs.filter((b) => !b.isPublished).length },
    ],
    [blogs]
  )

  const createMutation = useMutation({
    mutationFn: (payload) => adminApi.createBlog(payload),
    onSuccess: (res) => {
      toast.success('Blog post created')
      setRecentId(res.blog?._id)
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
      closeModal()
    },
    onError: (err) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateBlog(id, payload),
    onSuccess: () => {
      toast.success('Blog post updated')
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
      closeModal()
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isPublished }) => {
      const fd = new FormData()
      fd.append('isPublished', isPublished ? 'true' : 'false')
      return adminApi.updateBlog(id, fd)
    },
    onSuccess: () => {
      toast.success('Publish status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteBlog(id),
    onSuccess: () => {
      toast.success('Blog post deleted')
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setCoverFile(null)
    setModalOpen(true)
  }

  const openEdit = (blog) => {
    setEditing(blog)
    setForm({
      title: blog.title || '',
      author: blog.author || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      cardStyle: blog.cardStyle || 'default',
      sortOrder: blog.sortOrder ?? 0,
      isPublished: Boolean(blog.isPublished),
    })
    setCoverFile(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setCoverFile(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.author.trim() || !form.content.trim()) {
      toast.error('Title, author, and content are required')
      return
    }
    const payload = buildFormData(form, coverFile)
    if (editing) updateMutation.mutate({ id: editing._id, payload })
    else createMutation.mutate(payload)
  }

  const previewPost = {
    title: form.title || 'Blog title preview',
    author: form.author || 'Author name',
    excerpt: form.excerpt || 'Short excerpt preview for the card layout.',
    coverImage: coverFile ? URL.createObjectURL(coverFile) : editing?.coverImage || '',
    cardStyle: form.cardStyle,
    slug: editing?.slug || 'preview',
    publishedAt: new Date().toISOString(),
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Blog"
        description="Create and manage blog posts shown on the public blog page."
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Add blog
          </AdminButton>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or slug..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[14px] bg-surface" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
          <BookOpen className="mx-auto text-muted" size={32} />
          <p className="mt-3 text-sm font-medium text-ink">No blog posts yet</p>
          <p className="mt-1 text-xs text-muted">Add your first article to show it on /blog.</p>
          <AdminButton className="mt-4" onClick={openCreate}>
            <Plus size={16} /> Add blog
          </AdminButton>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((blog, index) => (
            <BlogRow
              key={blog._id}
              blog={blog}
              index={index}
              isNew={blog._id === recentId}
              onEdit={openEdit}
              onToggle={() =>
                toggleMutation.mutate({ id: blog._id, isPublished: !blog.isPublished })
              }
              onDelete={setDeleteTarget}
              togglePending={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit blog post' : 'Add blog post'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Title" hint="Shown as the headline on the blog page and post detail.">
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. How to choose the right mentor"
                  required
                />
              </Field>

              <Field label="Author" hint="Displayed under the title on cards and post pages.">
                <input
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  className={inputClass}
                  placeholder="Author name"
                  required
                />
              </Field>

              <Field label="Content" hint="Main article body. Use blank lines between paragraphs.">
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className={`${fieldClass} min-h-[180px] resize-y`}
                  placeholder="Write your blog content here..."
                  required
                />
              </Field>

              <Field label="Excerpt (optional)" hint="Short summary for cards. Auto-generated if left empty.">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className={`${fieldClass} min-h-[72px] resize-y`}
                  placeholder="One or two sentence summary"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sort order" hint="Lower numbers appear first.">
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </Field>
              </div>

              <ToggleRow
                checked={form.isPublished}
                onChange={(checked) => setForm((f) => ({ ...f, isPublished: checked }))}
                label="Publish immediately"
                hint="Published posts appear on the public /blog page."
              />
            </div>

            <div className="space-y-4">
              <ProfilePhotoPicker
                label="Cover image"
                value={coverFile}
                onChange={setCoverFile}
              />
              {editing?.coverImage && !coverFile ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <img src={editing.coverImage} alt="" className="max-h-40 w-full object-cover" />
                  <p className="px-3 py-2 text-[11px] text-muted-light">Current cover image</p>
                </div>
              ) : null}

              <Field label="Card shape & style" hint="Controls how this post appears on the blog grid.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {BLOG_CARD_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, cardStyle: style.id }))}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        form.cardStyle === style.id
                          ? 'border-[#5B4CFF] bg-[#5B4CFF]/10 ring-2 ring-[#5B4CFF]/20'
                          : 'border-border bg-surface hover:border-[#5B4CFF]/30'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-ink">{style.label}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-light">{style.hint}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Card preview">
                <div className="rounded-2xl border border-border bg-[#F8FAFC] p-3">
                  <div
                    className={`pointer-events-none ${
                      form.cardStyle === 'featured' ? 'max-w-2xl' : 'max-w-sm'
                    }`}
                  >
                    <BlogCard post={previewPost} />
                  </div>
                </div>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <AdminButton type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create blog'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      <ConfirmActionModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete blog post?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
