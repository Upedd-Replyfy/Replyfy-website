import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check, X, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import RejectReasonModal from './RejectReasonModal'
import AssignExpertModal from './AssignExpertModal'
import { adminApi } from '../../services/api'

function StatusBadge({ status }) {
  return (
    <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-amber-300">
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function PendingReviewTable({ questions = [], loading }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [assignQuestion, setAssignQuestion] = useState(null)
  const [rejectQuestion, setRejectQuestion] = useState(null)

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveQuestion(id),
    onSuccess: () => {
      toast.success('Approved')
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectQuestion(id, reason),
    onSuccess: () => {
      toast.success('Rejected')
      setRejectQuestion(null)
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  const filtered = questions.filter((q) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      q.title?.toLowerCase().includes(term) ||
      q.user?.name?.toLowerCase().includes(term) ||
      q.category?.name?.toLowerCase().includes(term)
    )
  })

  return (
    <>
      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111111]">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">Pending Review</h3>
            <p className="mt-0.5 text-xs text-muted">Approve, assign, or reject</p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#090909] px-3 py-2 text-sm sm:w-48"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#141414] text-xs uppercase tracking-wider text-muted-light">
              <tr>
                <th className="px-5 py-3">Question</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">No pending questions</td></tr>
              ) : (
                filtered.slice(0, 5).map((q) => (
                  <tr key={q._id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="max-w-[180px] truncate px-5 py-3 font-medium text-ink">{q.title}</td>
                    <td className="px-5 py-3 text-muted">{q.category?.name}</td>
                    <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => approveMutation.mutate(q._id)} className="admin-btn-success rounded-lg p-1.5" title="Auto assign"><Check size={14} /></button>
                        <button type="button" onClick={() => setAssignQuestion(q)} className="admin-btn-gradient rounded-lg p-1.5 text-black" title="Pick expert"><Eye size={14} /></button>
                        <button type="button" onClick={() => setRejectQuestion(q)} className="admin-btn-danger rounded-lg p-1.5" title="Reject"><X size={14} /></button>
                        <Link to="/admin/questions" className="rounded-lg border border-white/[0.08] p-1.5 text-muted hover:text-ink"><Eye size={14} /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignExpertModal open={!!assignQuestion} onClose={() => setAssignQuestion(null)} question={assignQuestion} mode="approve" />
      <RejectReasonModal
        open={!!rejectQuestion}
        onClose={() => setRejectQuestion(null)}
        title="Reject Question"
        loading={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectQuestion._id, reason })}
      />
    </>
  )
}
