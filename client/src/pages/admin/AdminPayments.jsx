import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, IndianRupee, CheckCircle2, Clock } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { adminApi } from '../../services/api'

function statusTone(status) {
  if (status === 'captured' || status === 'paid' || status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'pending' || status === 'created') return 'warning'
  return 'info'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminApi.getPayments,
  })

  const payments = data?.payments || []

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + (p.amount || 0), 0)
    const captured = payments.filter((p) => ['captured', 'paid', 'success'].includes(p.status)).length
    const pending = payments.filter((p) => ['pending', 'created'].includes(p.status)).length
    return [
      { label: 'Transactions', value: payments.length, icon: CreditCard },
      { label: 'Volume', value: `₹${(total / 100).toLocaleString('en-IN')}`, icon: IndianRupee },
      { label: 'Successful', value: captured, icon: CheckCircle2 },
      { label: 'Pending', value: pending, icon: Clock },
    ]
  }, [payments])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance"
        title="Payments"
        description="All platform transactions"
      />

      <AdminStatStrip items={stats} />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="border-b border-white/[0.08] px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-ink">Transaction history</p>
          <p className="text-xs text-muted">Newest payments first</p>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <p className="px-4 py-10 text-center text-muted">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="px-4 py-10 text-center text-muted">No payments yet</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {payments.map((p) => (
                <div key={p._id} className="space-y-2 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.user?.name || '—'}</p>
                      <p className="truncate text-xs text-muted">{p.user?.email}</p>
                    </div>
                    <AdminStatusBadge tone={statusTone(p.status)}>{p.status}</AdminStatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="capitalize">{p.plan?.replace('_', ' ') || '—'}</span>
                    <span className="font-semibold text-ink">₹{(p.amount / 100).toLocaleString('en-IN')}</span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#242727]">
              <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No payments yet</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{p.user?.name || '—'}</p>
                      <p className="truncate text-xs text-muted">{p.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 capitalize text-muted">{p.plan?.replace('_', ' ') || '—'}</td>
                    <td className="px-5 py-4 font-semibold text-ink">₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge tone={statusTone(p.status)}>{p.status}</AdminStatusBadge>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatDate(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
