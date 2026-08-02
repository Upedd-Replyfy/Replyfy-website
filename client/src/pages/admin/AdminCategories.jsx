import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { adminApi } from '../../services/api'

const emptyForm = {
  name: '',
  description: '',
  placeholder: '',
  suggestions: '',
  sortOrder: 0,
}

const fieldClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/10'

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-light">{hint}</span> : null}
    </label>
  )
}

function CategoryRow({ cat, isNew, onEdit, onToggle, togglePending }) {
  return (
    <li
      className={`flex flex-col gap-4 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        isNew ? 'bg-sky-500/10 ring-1 ring-inset ring-sky-500/25' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-violet-500/15 text-sky-600">
          <FolderTree size={18} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-ink">{cat.name}</p>
            <AdminStatusBadge tone={cat.isActive ? 'success' : 'neutral'}>
              {cat.isActive ? 'Active' : 'Disabled'}
            </AdminStatusBadge>
            {isNew && <AdminStatusBadge tone="info">Just created</AdminStatusBadge>}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {cat.description || 'No description'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-light">
            <span className="inline-flex items-center gap-1">
              <Hash size={11} /> {cat.slug}
            </span>
            <span className="inline-flex items-center gap-1">
              <Lightbulb size={11} /> {(cat.suggestions || []).length} suggestions
            </span>
            <span>Order {cat.sortOrder ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:pl-4">
        <button
          type="button"
          onClick={() => onEdit(cat)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-sky-500/30 hover:bg-sky-500/5"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          type="button"
          onClick={onToggle}
          disabled={togglePending}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            cat.isActive
              ? 'border-border text-muted hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600'
              : 'border-emerald-500/25 text-emerald-600 hover:bg-emerald-500/10'
          }`}
        >
          <Power size={13} /> {cat.isActive ? 'Disable' : 'Enable'}
        </button>
      </div>
    </li>
  )
}

function CategoryGroup({ title, count, tone, items, highlightId, onEdit, onToggle, togglePending }) {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-surface/60 px-5 py-2.5">
        <AdminStatusBadge tone={tone}>{title}</AdminStatusBadge>
        <span className="text-[11px] font-medium text-muted-light">{count}</span>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {items.map((cat) => (
          <CategoryRow
            key={cat._id}
            cat={cat}
            isNew={highlightId === cat._id}
            onEdit={onEdit}
            onToggle={() => onToggle(cat)}
            togglePending={togglePending}
          />
        ))}
      </ul>
    </div>
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
  const [statusFilter, setStatusFilter] = useState('all') // all | active | disabled
  const [highlightId, setHighlightId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  })

  const categories = data?.categories || []

  const activeCount = useMemo(() => categories.filter((c) => c.isActive).length, [categories])
  const disabledCount = categories.length - activeCount

  const { filtered, activeGroup, disabledGroup } = useMemo(() => {
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
    // Active always on top
    return {
      filtered: [...active, ...disabled],
      activeGroup: active,
      disabledGroup: disabled,
    }
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
          <button
            type="button"
            onClick={openCreate}
            className="admin-btn-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Plus size={16} /> New Category
          </button>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                className="w-full rounded-xl border border-white/[0.08] bg-[#272927] py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-xl bg-surface p-1">
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
                    ? 'bg-card text-ink shadow-sm ring-1 ring-border'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    statusFilter === tab.id ? 'bg-sky-500/15 text-sky-600' : 'bg-black/5 text-muted-light'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
              <FolderTree size={24} />
            </span>
            <p className="mt-4 text-base font-semibold text-ink">
              {categories.length === 0 ? 'No categories yet' : 'No matches'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {categories.length === 0
                ? 'Create your first category to structure mentor questions.'
                : 'Try a different search or status filter.'}
            </p>
            {categories.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="admin-btn-gradient mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                <Plus size={16} /> Create category
              </button>
            )}
          </div>
        ) : (
          <div>
            {statusFilter === 'all' ? (
              <>
                {activeGroup.length > 0 && (
                  <CategoryGroup
                    title="Active"
                    count={activeGroup.length}
                    tone="success"
                    items={activeGroup}
                    highlightId={highlightId}
                    onEdit={openEdit}
                    onToggle={(cat) => toggleMutation.mutate(cat)}
                    togglePending={toggleMutation.isPending}
                  />
                )}
                {disabledGroup.length > 0 && (
                  <CategoryGroup
                    title="Disabled"
                    count={disabledGroup.length}
                    tone="neutral"
                    items={disabledGroup}
                    highlightId={highlightId}
                    onEdit={openEdit}
                    onToggle={(cat) => toggleMutation.mutate(cat)}
                    togglePending={toggleMutation.isPending}
                  />
                )}
              </>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {filtered.map((cat) => (
                  <CategoryRow
                    key={cat._id}
                    cat={cat}
                    isNew={highlightId === cat._id}
                    onEdit={openEdit}
                    onToggle={() => toggleMutation.mutate(cat)}
                    togglePending={toggleMutation.isPending}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

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
              className={`${fieldClass} resize-y`}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-4 max-sm:flex-col-reverse">
            <button type="button" onClick={closeModal} className="admin-btn-secondary max-sm:w-full">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending || !form.name.trim()}
              className="admin-btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 max-sm:w-full"
            >
              {saveMutation.isPending
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Create category'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
