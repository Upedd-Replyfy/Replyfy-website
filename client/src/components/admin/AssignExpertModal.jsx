import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  BadgeCheck,
  Filter,
  Search,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import AdminModal from './AdminModal'
import { adminApi } from '../../services/api'

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All availability' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'offline', label: 'Offline' },
]

function availabilityStyles(value) {
  if (value === 'available') return 'bg-emerald-500/15 text-emerald-400'
  if (value === 'busy') return 'bg-amber-500/15 text-amber-300'
  return 'bg-white/10 text-muted'
}

function expertCategoryIds(e) {
  const ids = [e.category, ...(e.categories || [])]
    .map((c) => String(c?._id || c || ''))
    .filter(Boolean)
  return [...new Set(ids)]
}

function expertTypeIds(e) {
  const ids = [e.expertType, ...(e.expertTypes || [])]
    .map((t) => String(t?._id || t || ''))
    .filter(Boolean)
  return [...new Set(ids)]
}

function expertCategoryLabels(e) {
  const names = [e.category, ...(e.categories || [])]
    .map((c) => c?.name)
    .filter(Boolean)
  return [...new Set(names)]
}

function expertTypeLabels(e) {
  const names = [e.expertType, ...(e.expertTypes || [])]
    .map((t) => t?.name)
    .filter(Boolean)
  return [...new Set(names)]
}

function matchesQuestionProfile(e, questionCategoryId, questionTypeId) {
  return (
    expertCategoryIds(e).includes(String(questionCategoryId || '')) &&
    expertTypeIds(e).includes(String(questionTypeId || ''))
  )
}

export default function AssignExpertModal({ open, onClose, question, mode = 'approve' }) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={mode === 'approve' ? 'Approve & Assign Mentor' : 'Assign Mentor'}
      description={question?.title}
      size="xl"
    >
      {open && question ? (
        <AssignExpertForm
          key={question._id}
          question={question}
          mode={mode}
          onClose={onClose}
        />
      ) : null}
    </AdminModal>
  )
}

function AssignExpertForm({ question, mode, onClose }) {
  const queryClient = useQueryClient()
  const [selectedExpertId, setSelectedExpertId] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [matchQuestionOnly, setMatchQuestionOnly] = useState(false)

  const questionCategoryId = question?.category?._id || question?.category
  const questionTypeId = question?.expertType?._id || question?.expertType

  const { data, isLoading } = useQuery({
    queryKey: ['admin-experts'],
    queryFn: adminApi.getExperts,
  })

  const allExperts = useMemo(() => {
    return (data?.experts || []).filter(
      (e) => e.status === 'active' && e.user?.isActive !== false && e.user?._id
    )
  }, [data?.experts])

  const categoryOptions = useMemo(() => {
    const map = new Map()
    allExperts.forEach((e) => {
      ;[e.category, ...(e.categories || [])].forEach((c) => {
        const id = c?._id || c
        const name = c?.name
        if (id && name) map.set(String(id), name)
      })
    })
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [allExperts])

  const typeOptions = useMemo(() => {
    const map = new Map()
    allExperts.forEach((e) => {
      const catIds = expertCategoryIds(e)
      if (categoryFilter !== 'all' && !catIds.includes(categoryFilter)) return
      ;[e.expertType, ...(e.expertTypes || [])].forEach((t) => {
        const id = t?._id || t
        const name = t?.name
        if (id && name) map.set(String(id), name)
      })
    })
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [allExperts, categoryFilter])

  const filteredExperts = useMemo(() => {
    const q = search.trim().toLowerCase()

    return allExperts
      .filter((e) => {
        const catIds = expertCategoryIds(e)
        const typeIds = expertTypeIds(e)
        const matchesQuestion = matchesQuestionProfile(e, questionCategoryId, questionTypeId)

        if (matchQuestionOnly && !matchesQuestion) return false
        if (categoryFilter !== 'all' && !catIds.includes(categoryFilter)) return false
        if (typeFilter !== 'all' && !typeIds.includes(typeFilter)) return false
        if (availabilityFilter !== 'all' && e.availability !== availabilityFilter) return false

        if (!q) return true
        const haystack = [
          e.user?.name,
          e.user?.email,
          ...expertCategoryLabels(e),
          ...expertTypeLabels(e),
          ...(e.skills || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => {
        const aMatch = matchesQuestionProfile(a, questionCategoryId, questionTypeId)
        const bMatch = matchesQuestionProfile(b, questionCategoryId, questionTypeId)
        if (aMatch !== bMatch) return aMatch ? -1 : 1
        if ((b.averageRating || 0) !== (a.averageRating || 0)) {
          return (b.averageRating || 0) - (a.averageRating || 0)
        }
        return (a.activeAssignments || 0) - (b.activeAssignments || 0)
      })
  }, [
    allExperts,
    search,
    categoryFilter,
    typeFilter,
    availabilityFilter,
    matchQuestionOnly,
    questionCategoryId,
    questionTypeId,
  ])

  const selectedExpert = filteredExperts.find((e) => e.user?._id === selectedExpertId)
    || allExperts.find((e) => e.user?._id === selectedExpertId)

  const approveMutation = useMutation({
    mutationFn: (expertId) => adminApi.approveQuestion(question._id, expertId),
    onSuccess: () => {
      toast.success('Question approved and mentor assigned')
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const assignMutation = useMutation({
    mutationFn: (expertId) => adminApi.assignExpert(question._id, expertId),
    onSuccess: () => {
      toast.success('Mentor assigned')
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'approve') {
      approveMutation.mutate(selectedExpertId || undefined)
    } else if (!selectedExpertId) {
      toast.error('Select a mentor')
    } else {
      assignMutation.mutate(selectedExpertId)
    }
  }

  const pending = approveMutation.isPending || assignMutation.isPending
  const questionCategoryName = question?.category?.name || 'Any'
  const questionTypeName = question?.expertType?.name || 'Any'

  return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              <Users size={12} />
              Question needs
            </span>
            <span className="rounded-full bg-sky-500/15 px-2.5 py-1 font-medium text-sky-300">
              {questionCategoryName}
            </span>
            <span className="rounded-full bg-violet-500/15 px-2.5 py-1 font-medium text-violet-300">
              {questionTypeName}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">
            {mode === 'approve' && question?.plan === 'basic'
              ? 'Pick any registered mentor, or leave unselected to auto-assign the best available match.'
              : 'Search and filter across all registered mentors — not limited to this category or type.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, skill, category..."
              className="admin-search w-full rounded-xl !pl-10"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-white/5 hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
              Category
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setTypeFilter('all')
                }}
                className="admin-search rounded-xl text-sm font-normal normal-case tracking-normal"
              >
                <option value="all">All categories</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
              Mentor type
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="admin-search rounded-xl text-sm font-normal normal-case tracking-normal"
              >
                <option value="all">All types</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
              Availability
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="admin-search rounded-xl text-sm font-normal normal-case tracking-normal"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setMatchQuestionOnly((v) => !v)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  matchQuestionOnly
                    ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                    : 'border-white/10 bg-white/[0.03] text-muted hover:bg-white/[0.06] hover:text-ink'
                }`}
              >
                <Filter size={14} />
                Match question only
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <p>
            Showing <span className="font-semibold text-ink">{filteredExperts.length}</span> of{' '}
            {allExperts.length} mentors
          </p>
          {selectedExpert ? (
            <p className="truncate text-sky-300">
              Selected: <span className="font-semibold">{selectedExpert.user?.name}</span>
            </p>
          ) : (
            <p>{mode === 'approve' && question?.plan === 'basic' ? 'Auto-assign if none selected' : 'No mentor selected'}</p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center">
            <UserCheck size={28} className="mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No mentors found</p>
            <p className="mt-1 text-xs text-muted">Try clearing search or filters to see all registered mentors.</p>
          </div>
        ) : (
          <div className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1">
            {filteredExperts.map((e) => {
              const userId = e.user?._id
              const selected = selectedExpertId === userId
              const matchesQuestion = matchesQuestionProfile(e, questionCategoryId, questionTypeId)
              const catLabel = expertCategoryLabels(e).join(', ') || 'Uncategorized'
              const typeLabel = expertTypeLabels(e).join(', ') || '—'

              return (
                <button
                  key={e._id}
                  type="button"
                  onClick={() => setSelectedExpertId(userId)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                    selected
                      ? 'border-sky-500/50 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-500/20 text-violet-300">
                    {e.user?.avatar ? (
                      <img src={e.user.avatar} alt="" className="h-11 w-11 object-cover" />
                    ) : (
                      <UserCheck size={18} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-ink">{e.user?.name}</p>
                      {e.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <BadgeCheck size={11} />
                          Verified
                        </span>
                      ) : null}
                      {matchesQuestion ? (
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                          Best match
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">{e.user?.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted">
                        {catLabel}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted">
                        {typeLabel}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 capitalize ${availabilityStyles(e.availability)}`}>
                        {e.availability || 'unknown'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-muted">
                        <Star size={10} className="text-amber-400" />
                        {e.averageRating || 0}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted">
                        {e.activeAssignments || 0}/{e.maxAssignments || 0} active
                      </span>
                    </div>
                  </div>

                  <span
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-sky-400 bg-sky-500 text-white' : 'border-white/20'
                    }`}
                    aria-hidden
                  >
                    {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="admin-btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || (mode !== 'approve' && !selectedExpertId)}
            className="admin-btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {pending ? 'Processing...' : mode === 'approve' ? 'Approve & Assign' : 'Assign Mentor'}
          </button>
        </div>
      </form>
  )
}
