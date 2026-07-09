import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/api'

export default function AdminPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminApi.getPayments,
  })

  const payments = data?.payments || []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gradient-accent">Billing</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted">All platform transactions</p>
      </div>

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#242727]">
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No payments yet</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-ink">{p.user?.name || '—'}</td>
                    <td className="px-5 py-4 capitalize text-muted">{p.plan?.replace('_', ' ')}</td>
                    <td className="px-5 py-4 font-medium text-ink">₹{p.amount / 100}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-emerald-300">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
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
