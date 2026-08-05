import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Tags, Pencil, Power, Plus, Search, FolderTree, Layers, Eye, EyeOff } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import { adminApi } from '../../services/api'

const emptyForm = { name: '', description: '', category: '', sortOrder: 0 }

const fieldClass =
  'h-9 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:outline-none focus:ring-4 focus:ring-[#5B4CFF]/10'

const selectClass =
  'h-9 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10'

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-light">{hint}</span> : null}
    </label>
  )
}

function ExpertTypeCard({ type, index, onEdit, onDisable, disablePending }) {
  const categoryName = type.category?.name || 'Uncategorized'
  const isActive = type.isActive !== false

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -2 }}
      className="premium-surface group relative rounded-[14px] px-3 py-2.5 transition hover:border-[#5B4CFF]/50"
    >
      <div className="relative z-[1] flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B4CFF]/15 to-[#7C6CFF]/15 text-[#7C6CFF]">
          <Tags size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">{type.name}</h3>
            <AdminStatusBadge tone="violet">{categoryName}</AdminStatusBadge>
            {!isActive ? (
              <AdminStatusBadge tone="neutral">Disabled</AdminStatusBadge>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
            {type.description || 'No description'}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-light">
            {type.slug} · Order {type.sortOrder ?? 0}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AdminButton
            variant="secondary"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Edit mentor type"
            title="Edit"
            onClick={() => onEdit(type)}
          >
            <Pencil size={13} />
          </AdminButton>
          {isActive ? (
            <button
              type="button"
              onClick={() => onDisable(type._id)}
              disabled={disablePending}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 text-[11px] font-semibold text-rose-400 transition hover:bg-rose-500/15 disabled:opacity-50"
              title="Disable"
            >
              <Power size={12} />
              <span className="hidden sm:inline">Disable</span>
            </button>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

export default function AdminExpertTypes() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showDisabled, setShowDisabled] = useState(false)

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  })
  const { data, isLoading } = useQuery({
    queryKey: ['admin-expert-types'],
    queryFn: () => adminApi.getExpertTypes(),
  })

  const categories = categoriesData?.categories || []
  const types = data?.expertTypes || []

  const { activeTypes, disabledTypes, visibleTypes } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = types.filter((type) => {
      if (categoryFilter) {
        const catId = String(type.category?._id || type.category || '')
        if (catId !== String(categoryFilter)) return false
      }
      if (!q) return true
      const hay = [type.name, type.slug, type.description, type.category?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })

    const sortByOrder = (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)

    const active = matched.filter((t) => t.isActive !== false).sort(sortByOrder)
    const disabled = matched.filter((t) => t.isActive === false).sort(sortByOrder)

    return {
      activeTypes: active,
      disabledTypes: disabled,
      visibleTypes: showDisabled ? [...active, ...disabled] : active,
    }
  }, [types, query, categoryFilter, showDisabled])

  const stats = useMemo(() => {
    const active = types.filter((t) => t.isActive !== false).length
    const linkedCategories = new Set(
      types.map((t) => String(t.category?._id || t.category || '')).filter(Boolean)
    ).size
    return [
      { label: 'Mentor types', value: types.length, icon: Tags },
      { label: 'Categories linked', value: linkedCategories, icon: FolderTree },
      { label: 'Active', value: active, icon: Layers },
    ]
  }, [types])

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (type) => {
    setEditing(type._id)
    setForm({
      name: type.name,
      description: type.description || '',
      category: type.category?._id || type.category || '',
      sortOrder: type.sortOrder || 0,
    })
    setModalOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
      return editing ? adminApi.updateExpertType(editing, payload) : adminApi.createExpertType(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Mentor type updated' : 'Mentor type created')
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['admin-expert-types'] })
      queryClient.invalidateQueries({ queryKey: ['expert-types'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const disableMutation = useMutation({
    mutationFn: (id) => adminApi.deleteExpertType(id),
    onSuccess: () => {
      toast.success('Mentor type disabled')
      queryClient.invalidateQueries({ queryKey: ['admin-expert-types'] })
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Mentor Types"
        description="Define mentor roles within each category"
        actions={
          <AdminButton icon={Plus} onClick={openCreate}>
            New Mentor Type
          </AdminButton>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="premium-filter flex flex-col gap-2.5 rounded-[16px] px-3.5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Mentor type directory</p>
          <p className="text-xs text-muted">
            {visibleTypes.length} shown
            {disabledTypes.length > 0 && !showDisabled
              ? ` · ${disabledTypes.length} disabled hidden`
              : ''}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:max-w-2xl">
          <label className="relative block flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="h-9 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
            />
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${selectClass} sm:max-w-[180px]`}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {disabledTypes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDisabled((v) => !v)}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-muted transition hover:border-[#5B4CFF]/30 hover:text-[#7C6CFF]"
            >
              {showDisabled ? <EyeOff size={14} /> : <Eye size={14} />}
              {showDisabled ? 'Hide disabled' : `Show disabled (${disabledTypes.length})`}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="premium-surface h-[68px] animate-pulse rounded-[14px]" />
          ))}
        </div>
      ) : visibleTypes.length === 0 ? (
        <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
            <Tags size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            {types.length === 0
              ? 'No mentor types yet'
              : activeTypes.length === 0 && disabledTypes.length > 0
                ? 'No active mentor types'
                : 'No matches'}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted">
            {types.length === 0
              ? 'Create your first mentor type and link it to a category.'
              : activeTypes.length === 0 && disabledTypes.length > 0
                ? 'All matching types are disabled. Show them with the button above.'
                : 'Try another search or category filter.'}
          </p>
          {types.length === 0 && (
            <AdminButton icon={Plus} className="mt-5" onClick={openCreate}>
              Create mentor type
            </AdminButton>
          )}
          {activeTypes.length === 0 && disabledTypes.length > 0 && !showDisabled && (
            <button
              type="button"
              onClick={() => setShowDisabled(true)}
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-[#5B4CFF]/30"
            >
              <Eye size={15} />
              Show disabled ({disabledTypes.length})
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {activeTypes.map((type, index) => (
              <ExpertTypeCard
                key={type._id}
                type={type}
                index={index}
                onEdit={openEdit}
                onDisable={(id) => disableMutation.mutate(id)}
                disablePending={disableMutation.isPending}
              />
            ))}
          </div>

          {showDisabled && disabledTypes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Disabled
                </p>
                <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted-light">
                  {disabledTypes.length}
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {disabledTypes.map((type, index) => (
                  <ExpertTypeCard
                    key={type._id}
                    type={type}
                    index={index}
                    onEdit={openEdit}
                    onDisable={(id) => disableMutation.mutate(id)}
                    disablePending={disableMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit mentor type' : 'Create mentor type'}
        description="Link a role to a category"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim()) {
              toast.error('Name is required')
              return
            }
            if (!form.category) {
              toast.error('Category is required')
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
                placeholder="e.g. Founder"
                className={fieldClass}
              />
            </Field>
            <Field label="Category *">
              <select
                required
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className={selectClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Sort order" hint="Lower numbers appear first">
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
              className={fieldClass}
            />
          </Field>

          <Field label="Description">
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short summary of this mentor role"
              className={fieldClass}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-4 max-sm:flex-col-reverse">
            <AdminButton variant="secondary" type="button" onClick={closeModal} className="max-sm:w-full">
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              loading={saveMutation.isPending}
              disabled={!form.name.trim() || !form.category}
              className="max-sm:w-full"
            >
              {editing ? 'Update mentor type' : 'Create mentor type'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
