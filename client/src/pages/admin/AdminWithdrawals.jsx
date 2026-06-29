import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import RejectReasonModal from '../../components/admin/RejectReasonModal'
import { adminApi } from '../../services/api'

export default function AdminWithdrawals() {
  const queryClient = useQueryClient()
  const [rejectItem, setRejectItem] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: adminApi.getWithdrawals,
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveWithdrawal(id),
    onSuccess: () => {
      toast.success('Withdrawal approved')
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectWithdrawal(id, reason),
    onSuccess: () => {
      toast.success('Withdrawal rejected')
      setRejectItem(null)
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const withdrawals = data?.requests || []

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Payouts" title="Withdrawals" description="Review expert payout requests" />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111111]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#141414]">
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3">Expert</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No withdrawals</td></tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w._id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-ink">{w.expert?.name || '—'}</td>
                    <td className="px-5 py-4 font-medium text-ink">₹{w.amount / 100}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-amber-300">
                        {w.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(w.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approveMutation.mutate(w._id)}
                            className="admin-btn-success rounded-lg px-3 py-1.5 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectItem(w)}
                            className="admin-btn-danger rounded-lg px-3 py-1.5 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RejectReasonModal
        open={!!rejectItem}
        onClose={() => setRejectItem(null)}
        title="Reject Withdrawal"
        loading={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectItem._id, reason })}
      />
    </div>
  )
}
