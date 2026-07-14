import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import RejectReasonModal from '../../components/admin/RejectReasonModal'
import { adminApi } from '../../services/api'

export default function AdminAnswers() {
  const queryClient = useQueryClient()
  const [rejectAnswer, setRejectAnswer] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-answers'],
    queryFn: adminApi.getPendingAnswers,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveAnswer(id),
    onSuccess: () => {
      toast.success('Answer approved & delivered to user')
      queryClient.invalidateQueries({ queryKey: ['admin-pending-answers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectAnswer(id, reason),
    onSuccess: () => {
      toast.success('Revision requested')
      setRejectAnswer(null)
      queryClient.invalidateQueries({ queryKey: ['admin-pending-answers'] })
    },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Moderation" title="Answer Review" description="Approve mentor answers or request revisions" />

      {isLoading ? (
        <div className="admin-panel h-32 animate-pulse rounded-[20px] bg-[#202323]" />
      ) : (
        <div className="space-y-4">
          {(data?.answers || []).map((a) => (
            <div key={a._id} className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-6">
              <p className="font-semibold text-ink">{a.question?.title}</p>
              <p className="mt-1 text-xs text-muted">By {a.expert?.name}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{a.content}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => approveMutation.mutate(a._id)} className="admin-btn-gradient rounded-xl px-4 py-2 text-xs font-semibold">
                  Approve & Deliver
                </button>
                <button type="button" onClick={() => setRejectAnswer(a)} className="admin-btn-danger rounded-xl px-4 py-2 text-xs font-semibold">
                  Request Revision
                </button>
              </div>
            </div>
          ))}
          {!data?.answers?.length && (
            <div className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] py-12 text-center text-muted">
              No pending answers
            </div>
          )}
        </div>
      )}

      <RejectReasonModal
        open={!!rejectAnswer}
        onClose={() => setRejectAnswer(null)}
        title="Request Revision"
        label="Revision notes for mentor"
        loading={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectAnswer._id, reason })}
      />
    </div>
  )
}
