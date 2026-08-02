import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Wallet, Clock, CheckCircle2, IndianRupee } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import RejectReasonModal from '../../components/admin/RejectReasonModal'
import { adminApi } from '../../services/api'

function statusTone(status) {
  if (status === 'approved' || status === 'paid') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'pending') return 'warning'
  return 'neutral'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminWithdrawals() {
  const queryClient = useQueryClient()
  const [rejectItem, setRejectItem] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: adminApi.getWithdrawals,
  })

  const withdrawals = data?.requests || []

  const stats = useMemo(() => {
    const pending = withdrawals.filter((w) => w.status === 'pending')
    const pendingAmt = pending.reduce((s, w) => s + (w.amount || 0), 0)
    const approved = withdrawals.filter((w) => w.status === 'approved' || w.status === 'paid').length
    return [
      { label: 'Requests', value: withdrawals.length, icon: Wallet },
      { label: 'Pending', value: pending.length, icon: Clock },
      { label: 'Pending amount', value: `₹${(pendingAmt / 100).toLocaleString('en-IN')}`, icon: IndianRupee },
      { label: 'Approved', value: approved, icon: CheckCircle2 },
    ]
  }, [withdrawals])

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

  const PendingActions = ({ w }) =>
    w.status === 'pending' ? (
      <div className="flex flex-wrap gap-2">
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
    ) : null

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Finance" title="Withdrawals" description="Review mentor payout requests" />

      <AdminStatStrip items={stats} />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="border-b border-white/[0.08] px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-ink">Payout requests</p>
          <p className="text-xs text-muted">Approve or reject mentor withdrawals</p>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <p className="px-4 py-10 text-center text-muted">Loading withdrawals...</p>
          ) : withdrawals.length === 0 ? (
            <p className="px-4 py-10 text-center text-muted">No withdrawals</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {withdrawals.map((w) => (
                <div key={w._id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{w.expert?.name || '—'}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        ₹{(w.amount / 100).toLocaleString('en-IN')}
                      </p>
                      <p className="mt-1 text-xs text-muted">{formatDate(w.createdAt)}</p>
                    </div>
                    <AdminStatusBadge tone={statusTone(w.status)}>{w.status}</AdminStatusBadge>
                  </div>
                  <PendingActions w={w} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#242727]">
              <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3 font-semibold">Mentor</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">Loading withdrawals...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No withdrawals</td></tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w._id} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{w.expert?.name || '—'}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      ₹{(w.amount / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge tone={statusTone(w.status)}>{w.status}</AdminStatusBadge>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatDate(w.createdAt)}</td>
                    <td className="px-5 py-4">
                      <PendingActions w={w} />
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
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectItem._id, reason })}
        loading={rejectMutation.isPending}
      />
    </div>
  )
}
