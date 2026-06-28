import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DashboardShell, StatusBadge } from '../../components/layouts/DashboardShell'
import { adminApi } from '../../services/api'

export default function AdminQuestions() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-questions'],
    queryFn: adminApi.getPendingQuestions,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveQuestion(id),
    onSuccess: () => {
      toast.success('Question approved & expert assigned')
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectQuestion(id, reason),
    onSuccess: () => {
      toast.success('Question rejected')
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    },
  })

  const nav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/questions', label: 'Questions' },
    { to: '/admin/answers', label: 'Answers' },
    { to: '/admin/experts', label: 'Experts' },
    { to: '/admin/users', label: 'Users' },
  ]

  return (
    <DashboardShell title="Questions" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Question Review</h1>
      <p className="text-sm text-muted">Approve or reject submitted questions</p>

      {isLoading ? (
        <div className="mt-6 space-y-3">{[1, 2].map((i) => <div key={i} className="luxury-card h-32 animate-pulse bg-surface" />)}</div>
      ) : (
        <div className="mt-6 space-y-4">
          {(data?.questions || []).map((q) => (
            <div key={q._id} className="luxury-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{q.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{q.description}</p>
                  <p className="mt-2 text-xs text-muted-light">
                    {q.user?.name} · {q.category?.name} · {q.plan} plan · ₹{q.amount / 100}
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => approveMutation.mutate(q._id)}
                  disabled={approveMutation.isPending}
                  className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Approve & Assign
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt('Rejection reason:')
                    if (reason) rejectMutation.mutate({ id: q._id, reason })
                  }}
                  className="btn-secondary rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!data?.questions?.length && (
            <div className="luxury-card py-12 text-center text-muted">No pending questions</div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
