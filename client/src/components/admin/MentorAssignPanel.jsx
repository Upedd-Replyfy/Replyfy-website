import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { BadgeCheck, Search, Star, UserCheck, Wifi } from 'lucide-react'
import AdminAvatar from './ui/AdminAvatar'
import AdminBadge from './ui/AdminBadge'
import AdminButton from './ui/AdminButton'
import { adminApi } from '../../services/api'

function categoryLabels(e) {
  return [...new Set([e.category, ...(e.categories || [])].map((c) => c?.name).filter(Boolean))]
}

function typeLabels(e) {
  return [...new Set([e.expertType, ...(e.expertTypes || [])].map((t) => t?.name).filter(Boolean))]
}

function availabilityTone(value) {
  if (value === 'available') return 'success'
  if (value === 'busy') return 'warning'
  return 'neutral'
}

/**
 * Inline searchable mentor picker — same approve/assign APIs as AssignExpertModal.
 */
export default function MentorAssignPanel({ question, mode = 'approve', onAssigned }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedExpertId, setSelectedExpertId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-experts'],
    queryFn: adminApi.getExperts,
  })

  const experts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data?.experts || [])
      .filter((e) => e.status === 'active' && e.user?.isActive !== false && e.user?._id)
      .filter((e) => {
        if (!q) return true
        const hay = [e.user?.name, e.user?.email, ...categoryLabels(e), ...typeLabels(e), ...(e.skills || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
  }, [data?.experts, search])

  const selected = experts.find((e) => e.user?._id === selectedExpertId)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  }

  const approveMutation = useMutation({
    mutationFn: (expertId) => adminApi.approveQuestion(question._id, expertId),
    onSuccess: () => {
      toast.success('Question approved and mentor assigned')
      invalidate()
      onAssigned?.()
    },
    onError: (err) => toast.error(err.message),
  })

  const assignMutation = useMutation({
    mutationFn: (expertId) => adminApi.assignExpert(question._id, expertId),
    onSuccess: () => {
      toast.success('Mentor assigned')
      invalidate()
      onAssigned?.()
    },
    onError: (err) => toast.error(err.message),
  })

  const pending = approveMutation.isPending || assignMutation.isPending

  const submit = () => {
    if (mode === 'approve') {
      approveMutation.mutate(selectedExpertId || undefined)
      return
    }
    if (!selectedExpertId) {
      toast.error('Select a mentor')
      return
    }
    assignMutation.mutate(selectedExpertId)
  }

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mentors by name, email, skill..."
          className="h-10 w-full rounded-xl border border-border bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
      </label>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : experts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <UserCheck className="mx-auto text-slate-300" size={22} />
          <p className="mt-2 text-xs font-semibold text-slate-600">No mentors found</p>
        </div>
      ) : (
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
          {experts.map((e) => {
            const id = e.user?._id
            const active = selectedExpertId === id
            const cats = categoryLabels(e).slice(0, 2).join(', ') || '—'
            const online = e.availability === 'available'
            return (
              <button
                key={e._id}
                type="button"
                onClick={() => setSelectedExpertId(id)}
                className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                  active
                    ? 'border-indigo-300 bg-indigo-50/70 ring-1 ring-indigo-200'
                    : 'border-border bg-white hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <AdminAvatar name={e.user?.name} src={e.user?.avatar} size="sm" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      online ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-xs font-bold text-slate-900">{e.user?.name}</p>
                    {e.isVerified && (
                      <BadgeCheck size={12} className="shrink-0 text-indigo-500" />
                    )}
                  </div>
                  <p className="truncate text-[11px] text-slate-400">{cats}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {e.averageRating || 0}
                    </span>
                    {e.experience && (
                      <span className="text-[10px] text-slate-400">{e.experience}</span>
                    )}
                    <AdminBadge tone={availabilityTone(e.availability)} className="!px-1.5 !py-0 !text-[9px] capitalize">
                      {e.availability || 'unknown'}
                    </AdminBadge>
                    {online && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                        <Wifi size={10} /> Online
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    active
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-slate-300 bg-white'
                  }`}
                  aria-hidden
                >
                  {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
          <AdminAvatar name={selected.user?.name} src={selected.user?.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Selected mentor</p>
            <p className="truncate text-sm font-bold text-slate-900">{selected.user?.name}</p>
          </div>
        </div>
      )}

      {(mode !== 'approve' || selected) && (
        <AdminButton
          className="w-full"
          variant="primary"
          icon={UserCheck}
          loading={pending}
          disabled={!selectedExpertId}
          onClick={submit}
        >
          {mode === 'approve' ? 'Assign selected mentor' : 'Assign mentor'}
        </AdminButton>
      )}

      {mode === 'approve' && !selected && (
        <p className="text-center text-[11px] text-slate-400">
          Select a mentor above, or use <span className="font-semibold text-slate-600">Auto assign</span> below.
        </p>
      )}
    </div>
  )
}
