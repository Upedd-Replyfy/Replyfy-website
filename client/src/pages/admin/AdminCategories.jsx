import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FolderTree,
  Pencil,
  Power,
  Plus,
  Search,
  Lightbulb,
  Hash,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import { adminApi } from '../../services/api'

const emptyForm = {
  name: '',
  description: '',
  placeholder: '',
  suggestions: '',
  sortOrder: 0,
}

const fieldClass =
  'w-full h-9 rounded-xl border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:outline-none focus:ring-4 focus:ring-[#5B4CFF]/10'

const selectClass =
  'h-9 rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10'

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-light">{hint}</span> : null}
    </label>
  )
}

function CategoryCard({ cat, index, isNew, onEdit, onToggle, togglePending }) {
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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B4CFF]/15 to-[#7C6CFF]/15 text-[#7C6CFF]">
          <FolderTree size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">{cat.name}</h3>
            <AdminStatusBadge tone={cat.isActive ? 'success' : 'neutral'}>
              {cat.isActive ? 'Active' : 'Disabled'}
            </AdminStatusBadge>
            {isNew ? (
              <AdminStatusBadge tone="info">Just created</AdminStatusBadge>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
            {cat.description || 'No description'}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-light">
            <span className="inline-flex items-center gap-0.5">
              <Hash size={10} /> {cat.slug}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Lightbulb size={10} /> {(cat.suggestions || []).length} suggestions
            </span>
            <span>Order {cat.sortOrder ?? 0}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AdminButton
            variant="secondary"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Edit category"
            title="Edit"
            onClick={() => onEdit(cat)}
          >
            <Pencil size={13} />
          </AdminButton>
          <button
            type="button"
            onClick={onToggle}
            disabled={togglePending}
            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition disabled:opacity-50 ${
              cat.isActive
                ? 'border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
            }`}
            title={cat.isActive ? 'Disable' : 'Enable'}
          >
            <Power size={12} />
            <span className="hidden sm:inline">{cat.isActive ? 'Disable' : 'Enable'}</span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function sortByOrder(a, b) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
}

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [highlightId, setHighlightId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  })

  const categories = data?.categories || []

  const activeCount = useMemo(() => categories.filter((c) => c.isActive).length, [categories])
  const disabledCount = categories.length - activeCount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = categories
    if (q) {
      list = list.filter((cat) =>
        [cat.name, cat.slug, cat.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (statusFilter === 'active') list = list.filter((c) => c.isActive)
    if (statusFilter === 'disabled') list = list.filter((c) => !c.isActive)

    const active = list.filter((c) => c.isActive).sort(sortByOrder)
    const disabled = list.filter((c) => !c.isActive).sort(sortByOrder)
    return [...active, ...disabled]
  }, [categories, query, statusFilter])

  const stats = useMemo(() => {
    const suggestions = categories.reduce((n, c) => n + (c.suggestions?.length || 0), 0)
    return [
      { label: 'Categories', value: categories.length, icon: FolderTree },
      { label: 'Active', value: activeCount, icon: Power },
      { label: 'Suggestions', value: suggestions, icon: Lightbulb },
    ]
  }, [categories, activeCount])

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditingId(cat._id)
    setForm({
      name: cat.name,
      description: cat.description || '',
      placeholder: cat.placeholder || '',
      suggestions: (cat.suggestions || []).join('\n'),
      sortOrder: cat.sortOrder || 0,
    })
    setModalOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        suggestions: form.suggestions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        sortOrder: Number(form.sortOrder) || 0,
      }
      return editingId
        ? adminApi.updateCategory(editingId, payload)
        : adminApi.createCategory(payload)
    },
    onSuccess: (res) => {
      const created = !editingId
      const id = res?.category?._id
      toast.success(created ? 'Category created' : 'Category updated')
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      if (created && id) {
        setHighlightId(id)
        window.setTimeout(() => setHighlightId(null), 2400)
      }
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: async (cat) => {
      if (cat.isActive) return adminApi.deleteCategory(cat._id)
      return adminApi.updateCategory(cat._id, { isActive: true })
    },
    onSuccess: (_res, cat) => {
      toast.success(cat.isActive ? 'Category disabled' : 'Category enabled')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Organize questions with clear topics, placeholders, and suggestions"
        actions={
          <AdminButton icon={Plus} onClick={openCreate}>
            New Category
          </AdminButton>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="premium-filter space-y-2.5 rounded-[16px] px-3.5 py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Category directory</p>
            <p className="text-xs text-muted">
              {filtered.length} of {categories.length} shown · active first
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="h-9 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All', count: categories.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'disabled', label: 'Disabled', count: disabledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 text-[#a5a0ff]'
                  : 'border border-transparent text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  statusFilter === tab.id
                    ? 'bg-[#5B4CFF]/20 text-[#a5a0ff]'
                    : 'bg-surface text-muted-light'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="premium-surface h-[68px] animate-pulse rounded-[14px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
            <FolderTree size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            {categories.length === 0 ? 'No categories yet' : 'No matches'}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted">
            {categories.length === 0
              ? 'Create your first category to structure mentor questions.'
              : 'Try a different search or status filter.'}
          </p>
          {categories.length === 0 && (
            <AdminButton icon={Plus} className="mt-5" onClick={openCreate}>
              Create category
            </AdminButton>
          )}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cat, index) => (
            <CategoryCard
              key={cat._id}
              cat={cat}
              index={index}
              isNew={highlightId === cat._id}
              onEdit={openEdit}
              onToggle={() => toggleMutation.mutate(cat)}
              togglePending={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit category' : 'Create category'}
        description="Name, prompts, and ordering for the ask flow"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim()) {
              toast.error('Name is required')
              return
            }
            saveMutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Startup"
                className={fieldClass}
              />
            </Field>
            <Field label="Sort order" hint="Lower numbers appear first">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short summary shown to users"
              className={fieldClass}
            />
          </Field>

          <Field label="Question placeholder" hint="Hint text inside the question box">
            <input
              value={form.placeholder}
              onChange={(e) => setForm((p) => ({ ...p, placeholder: e.target.value }))}
              placeholder="What should users type here?"
              className={fieldClass}
            />
          </Field>

          <Field label="Suggestions" hint="One suggestion per line">
            <textarea
              rows={4}
              value={form.suggestions}
              onChange={(e) => setForm((p) => ({ ...p, suggestions: e.target.value }))}
              placeholder={'How do I validate my idea?\nWhat should I pitch first?'}
              className={`${fieldClass} h-auto resize-y py-2.5`}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-4 max-sm:flex-col-reverse">
            <AdminButton variant="secondary" type="button" onClick={closeModal} className="max-sm:w-full">
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              loading={saveMutation.isPending}
              disabled={!form.name.trim()}
              className="max-sm:w-full"
            >
              {editingId ? 'Save changes' : 'Create category'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
