import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  IndianRupee,
  Coins,
  Pencil,
  Plus,
  Power,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import { adminApi } from '../../services/api'

const emptyForm = {
  name: '',
  slug: '',
  tagline: '',
  price: '',
  mentorPoints: '',
  features: '',
  sortOrder: 0,
  requiresExpertSelection: false,
  popular: false,
}

const fieldClass =
  'w-full h-9 rounded-xl border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:outline-none focus:ring-4 focus:ring-[#5B4CFF]/10'

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

function PlanCard({ plan, index, isNew, onEdit, onToggle, onDelete, togglePending }) {
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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-card">
          <IndianRupee size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">{plan.name}</h3>
            <AdminStatusBadge tone={plan.isActive ? 'success' : 'neutral'}>
              {plan.isActive ? 'Active' : 'Disabled'}
            </AdminStatusBadge>
            {plan.popular ? <AdminStatusBadge tone="info">Popular</AdminStatusBadge> : null}
            {isNew ? <AdminStatusBadge tone="info">Just created</AdminStatusBadge> : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{plan.tagline || 'No tagline'}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-light">
            <span>₹{plan.price}</span>
            <span className="inline-flex items-center gap-0.5">
              <Coins size={10} /> {plan.mentorPoints} pts / answer
            </span>
            {plan.requiresExpertSelection ? (
              <span className="inline-flex items-center gap-0.5">
                <UserCheck size={10} /> User picks mentor
              </span>
            ) : (
              <span>Auto-assign mentor</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AdminButton
            variant="secondary"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Edit plan"
            title="Edit"
            onClick={() => onEdit(plan)}
          >
            <Pencil size={13} />
          </AdminButton>
          <AdminButton
            variant="danger"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Delete plan"
            title="Delete"
            onClick={() => onDelete(plan)}
          >
            <Trash2 size={13} />
          </AdminButton>
          <button
            type="button"
            onClick={onToggle}
            disabled={togglePending}
            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition disabled:opacity-50 ${
              plan.isActive
                ? 'border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
            }`}
            title={plan.isActive ? 'Disable' : 'Enable'}
          >
            <Power size={12} />
            <span className="hidden sm:inline">{plan.isActive ? 'Disable' : 'Enable'}</span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function sortByOrder(a, b) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
}

export default function AdminPricing() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [highlightId, setHighlightId] = useState(null)
  const [planToDelete, setPlanToDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: adminApi.getPlans,
  })

  const plans = data?.plans || []
  const activeCount = useMemo(() => plans.filter((p) => p.isActive).length, [plans])
  const disabledCount = plans.length - activeCount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = plans
    if (q) {
      list = list.filter((plan) =>
        [plan.name, plan.slug, plan.tagline]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (statusFilter === 'active') list = list.filter((p) => p.isActive)
    if (statusFilter === 'disabled') list = list.filter((p) => !p.isActive)

    const active = list.filter((p) => p.isActive).sort(sortByOrder)
    const disabled = list.filter((p) => !p.isActive).sort(sortByOrder)
    return [...active, ...disabled]
  }, [plans, query, statusFilter])

  const stats = useMemo(() => {
    const points = plans.reduce((n, p) => n + (p.mentorPoints || 0), 0)
    return [
      { label: 'Plans', value: plans.length, icon: IndianRupee },
      { label: 'Active', value: activeCount, icon: Sparkles },
      { label: 'Points across plans', value: points, icon: Coins },
    ]
  }, [plans, activeCount])

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

  const openEdit = (plan) => {
    setEditingId(plan._id)
    setForm({
      name: plan.name,
      slug: plan.slug,
      tagline: plan.tagline || '',
      price: plan.price,
      mentorPoints: plan.mentorPoints,
      features: (plan.features || []).join('\n'),
      sortOrder: plan.sortOrder || 0,
      requiresExpertSelection: Boolean(plan.requiresExpertSelection),
      popular: Boolean(plan.popular),
    })
    setModalOpen(true)
  }

  const invalidatePlans = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
    queryClient.invalidateQueries({ queryKey: ['plans'] })
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        price: Number(form.price),
        mentorPoints: Number(form.mentorPoints),
        features: form.features,
        sortOrder: Number(form.sortOrder) || 0,
        requiresExpertSelection: form.requiresExpertSelection,
        popular: form.popular,
      }
      if (!editingId && form.slug.trim()) payload.slug = form.slug.trim().toLowerCase()
      return editingId ? adminApi.updatePlan(editingId, payload) : adminApi.createPlan(payload)
    },
    onSuccess: (res) => {
      const created = !editingId
      const id = res?.plan?._id
      toast.success(created ? 'Plan created' : 'Plan updated')
      closeModal()
      invalidatePlans()
      if (created && id) {
        setHighlightId(id)
        window.setTimeout(() => setHighlightId(null), 2400)
      }
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: async (plan) => adminApi.updatePlan(plan._id, { isActive: !plan.isActive }),
    onSuccess: (_res, plan) => {
      toast.success(plan.isActive ? 'Plan disabled' : 'Plan enabled')
      invalidatePlans()
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (plan) => adminApi.deletePlan(plan._id),
    onSuccess: (_res, plan) => {
      toast.success(`${plan.name} deleted`)
      setPlanToDelete(null)
      invalidatePlans()
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Pricing"
        description="Create and customise plans, then set how many points a mentor earns for every approved answer"
        actions={
          <AdminButton icon={Plus} onClick={openCreate}>
            New Plan
          </AdminButton>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="rounded-[16px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-violet-500/8 to-transparent px-4 py-3.5 text-sm text-muted">
        Mentors receive the plan&apos;s point value when you approve their answer. Changing a plan does not retroactively
        change points on questions already created.
      </div>

      <div className="premium-filter space-y-2.5 rounded-[16px] px-3.5 py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Price plans</p>
            <p className="text-xs text-muted">
              {filtered.length} of {plans.length} shown · active first
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
              placeholder="Search plans..."
              className="h-9 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All', count: plans.length },
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="premium-surface h-[68px] animate-pulse rounded-[14px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
            <IndianRupee size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            {plans.length === 0 ? 'No plans yet' : 'No matches'}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted">
            {plans.length === 0
              ? 'Create your first price plan and set the mentor points awarded for each approved answer.'
              : 'Try a different search or status filter.'}
          </p>
          {plans.length === 0 && (
            <AdminButton icon={Plus} className="mt-5" onClick={openCreate}>
              Create plan
            </AdminButton>
          )}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((plan, index) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              index={index}
              isNew={highlightId === plan._id}
              onEdit={openEdit}
              onDelete={setPlanToDelete}
              onToggle={() => toggleMutation.mutate(plan)}
              togglePending={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit plan' : 'Create plan'}
        description="Price, features, and the mentor points awarded when an answer is approved"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim()) return toast.error('Name is required')
            if (!(Number(form.price) > 0)) return toast.error('Enter a valid price')
            if (Number(form.mentorPoints) < 0 || form.mentorPoints === '') {
              return toast.error('Enter mentor points of 0 or more')
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
                placeholder="e.g. Choose Mentor"
                className={fieldClass}
              />
            </Field>
            <Field
              label="Slug"
              hint={editingId ? 'Locked after create so existing questions stay linked' : 'Optional. Auto-generated from the name.'}
            >
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="choose-mentor"
                disabled={Boolean(editingId)}
                className={`${fieldClass} disabled:opacity-60`}
              />
            </Field>
          </div>

          <Field label="Tagline">
            <input
              value={form.tagline}
              onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              placeholder="Short line shown on the plan card"
              className={fieldClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₹) *" hint="Amount users pay">
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="199"
                className={fieldClass}
              />
            </Field>
            <Field label="Mentor points *" hint="Credited on answer approval">
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.mentorPoints}
                onChange={(e) => setForm((p) => ({ ...p, mentorPoints: e.target.value }))}
                placeholder="80"
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

          <Field label="Features" hint="One feature per line">
            <textarea
              rows={4}
              value={form.features}
              onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
              placeholder={'You select your preferred mentor\nGuaranteed email reply'}
              className={`${fieldClass} h-auto resize-y py-2.5`}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              checked={form.requiresExpertSelection}
              onChange={(requiresExpertSelection) => setForm((p) => ({ ...p, requiresExpertSelection }))}
              label="User picks a mentor"
              hint="If off, we auto-assign a mentor after you approve the question"
            />
            <ToggleRow
              checked={form.popular}
              onChange={(popular) => setForm((p) => ({ ...p, popular }))}
              label="Mark as popular"
              hint="Highlights this plan on the pricing cards"
            />
          </div>

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
              {editingId ? 'Save changes' : 'Create plan'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      <ConfirmActionModal
        open={Boolean(planToDelete)}
        onClose={() => !deleteMutation.isPending && setPlanToDelete(null)}
        title={planToDelete ? `Delete ${planToDelete.name}?` : 'Delete plan'}
        description="This plan will be removed from Pricing and will no longer be offered to users. Past questions keep their original plan label."
        confirmLabel="Delete plan"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => planToDelete && deleteMutation.mutate(planToDelete)}
      />
    </div>
  )
}
