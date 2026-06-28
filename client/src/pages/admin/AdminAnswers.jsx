import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DashboardShell, StatusBadge } from '../../components/layouts/DashboardShell'
import { adminApi } from '../../services/api'

export default function AdminAnswers() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-answers'],
    queryFn: adminApi.getPendingAnswers,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveAnswer(id),
    onSuccess: () => {
      toast.success('Answer approved & delivered to user')
      queryClient.invalidateQueries({ queryKey: ['admin-pending-answers'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectAnswer(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending-answers'] }),
  })

  const nav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/questions', label: 'Questions' },
    { to: '/admin/answers', label: 'Answers' },
    { to: '/admin/experts', label: 'Experts' },
    { to: '/admin/users', label: 'Users' },
  ]

  return (
    <DashboardShell title="Answers" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Answer Review</h1>

      {isLoading ? (
        <div className="mt-6 luxury-card h-32 animate-pulse bg-surface" />
      ) : (
        <div className="mt-6 space-y-4">
          {(data?.answers || []).map((a) => (
            <div key={a._id} className="luxury-card p-6">
              <p className="font-semibold text-ink">{a.question?.title}</p>
              <p className="mt-1 text-xs text-muted">By {a.expert?.name}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{a.content}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => approveMutation.mutate(a._id)}
                  className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Approve & Deliver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt('Revision notes:')
                    if (reason) rejectMutation.mutate({ id: a._id, reason })
                  }}
                  className="btn-secondary rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Request Revision
                </button>
              </div>
            </div>
          ))}
          {!data?.answers?.length && (
            <div className="luxury-card py-12 text-center text-muted">No pending answers</div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
