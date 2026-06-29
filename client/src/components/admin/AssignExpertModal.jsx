import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Star, UserCheck } from 'lucide-react'
import AdminModal from './AdminModal'
import { adminApi } from '../../services/api'

export default function AssignExpertModal({ open, onClose, question, mode = 'approve' }) {
  const queryClient = useQueryClient()
  const [selectedExpertId, setSelectedExpertId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-experts'],
    queryFn: adminApi.getExperts,
    enabled: open,
  })

  const experts = useMemo(() => {
    if (!question || !data?.experts) return []
    const catId = question.category?._id || question.category
    const typeId = question.expertType?._id || question.expertType
    return data.experts.filter(
      (e) =>
        e.status === 'active' &&
        e.availability === 'available' &&
        (e.category?._id || e.category)?.toString() === catId?.toString() &&
        (e.expertType?._id || e.expertType)?.toString() === typeId?.toString()
    )
  }, [data?.experts, question])

  const approveMutation = useMutation({
    mutationFn: (expertId) => adminApi.approveQuestion(question._id, expertId),
    onSuccess: () => {
      toast.success('Question approved and expert assigned')
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setSelectedExpertId('')
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const assignMutation = useMutation({
    mutationFn: (expertId) => adminApi.assignExpert(question._id, expertId),
    onSuccess: () => {
      toast.success('Expert assigned')
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setSelectedExpertId('')
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'approve') {
      approveMutation.mutate(selectedExpertId || undefined)
    } else if (!selectedExpertId) {
      toast.error('Select an expert')
    } else {
      assignMutation.mutate(selectedExpertId)
    }
  }

  const pending = approveMutation.isPending || assignMutation.isPending

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={mode === 'approve' ? 'Approve & Assign Expert' : 'Assign Expert'}
      description={question?.title}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-muted">
          {question?.plan === 'basic' && mode === 'approve'
            ? 'Leave unselected to auto-pick the best available expert, or choose manually.'
            : 'Select an expert for this category and type.'}
        </p>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
        ) : experts.length === 0 ? (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            No available experts match this category and type.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {experts.map((e) => {
              const userId = e.user?._id
              const selected = selectedExpertId === userId
              return (
                <button
                  key={e._id}
                  type="button"
                  onClick={() => setSelectedExpertId(userId)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    selected
                      ? 'border-sky-500/40 bg-sky-500/10'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                    {e.user?.avatar ? (
                      <img src={e.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <UserCheck size={18} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{e.user?.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Star size={10} className="text-amber-400" />
                      {e.averageRating || 0} · {e.activeAssignments}/{e.maxAssignments} active
                    </p>
                  </div>
                  {e.isVerified && (
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Verified
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="admin-btn-gradient rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {pending ? 'Processing...' : mode === 'approve' ? 'Approve & Assign' : 'Assign Expert'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
