import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check, UserPlus, X, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AssignExpertModal from '../../components/admin/AssignExpertModal'
import RejectReasonModal from '../../components/admin/RejectReasonModal'
import { adminApi } from '../../services/api'

const tabs = [
  { id: 'pending', label: 'Pending Review' },
  { id: 'all', label: 'All Questions' },
]

function StatusBadge({ status }) {
  const styles = {
    pending_admin_review: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    assigned: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    in_progress: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  }
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${styles[status] || 'bg-white/[0.06] text-muted border-white/[0.08]'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function AdminQuestions() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('pending')
  const [expanded, setExpanded] = useState(null)
  const [assignQuestion, setAssignQuestion] = useState(null)
  const [rejectQuestion, setRejectQuestion] = useState(null)

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-questions'],
    queryFn: adminApi.getPendingQuestions,
  })

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => adminApi.getQuestions({ limit: 50 }),
    enabled: tab === 'all',
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveQuestion(id),
    onSuccess: () => {
      toast.success('Question approved & expert assigned')
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectQuestion(id, reason),
    onSuccess: () => {
      toast.success('Question rejected')
      setRejectQuestion(null)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  }

  const questions = tab === 'pending' ? pendingData?.questions || [] : allData?.questions || []
  const isLoading = tab === 'pending' ? pendingLoading : allLoading

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Questions"
        description="Review, approve, reject, and assign experts"
      />

      <div className="flex gap-2 border-b border-white/[0.08] pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white/[0.08] text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
            {t.id === 'pending' && pendingData?.questions?.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-300">
                {pendingData.questions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="admin-panel h-28 animate-pulse rounded-[20px] bg-[#111111]" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#111111] py-16 text-center text-muted">
          No questions in this view
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isOpen = expanded === q._id
            const canReview = q.status === 'pending_admin_review'
            return (
              <div key={q._id} className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111111]">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{q.title}</p>
                      <StatusBadge status={q.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {q.user?.name} · {q.category?.name} · {q.expertType?.name || '—'} · {q.plan} · ₹{q.amount / 100}
                    </p>
                    {q.assignedExpert && (
                      <p className="mt-1 text-xs text-sky-400">Assigned: {q.assignedExpert?.name || 'Expert'}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : q._id)}
                      className="flex items-center gap-1 rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-muted hover:text-ink"
                    >
                      <Eye size={14} /> {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {canReview && (
                      <>
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(q._id)}
                          disabled={approveMutation.isPending}
                          className="admin-btn-success flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold"
                        >
                          <Check size={14} /> Auto Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignQuestion(q)}
                          className="admin-btn-gradient flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold"
                        >
                          <UserPlus size={14} /> Pick Expert
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectQuestion(q)}
                          className="admin-btn-danger flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                    {!canReview && q.status === 'assigned' && (
                      <button
                        type="button"
                        onClick={() => setAssignQuestion({ ...q, _reassign: true })}
                        className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium hover:bg-white/[0.04]"
                      >
                        Reassign Expert
                      </button>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-white/[0.08] bg-white/[0.02] px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm text-muted">{q.description}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AssignExpertModal
        open={!!assignQuestion}
        onClose={() => setAssignQuestion(null)}
        question={assignQuestion}
        mode={assignQuestion?._reassign ? 'assign' : 'approve'}
      />

      <RejectReasonModal
        open={!!rejectQuestion}
        onClose={() => setRejectQuestion(null)}
        title="Reject Question"
        loading={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectQuestion._id, reason })}
      />
    </div>
  )
}
