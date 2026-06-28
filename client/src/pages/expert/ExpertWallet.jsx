import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DashboardShell, StatCard } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

export default function ExpertWallet() {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifsc: '', bankName: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['expert-wallet'],
    queryFn: expertApi.getWallet,
  })

  const withdrawMutation = useMutation({
    mutationFn: () =>
      expertApi.withdraw({
        amount: Math.round(parseFloat(amount) * 100),
        bankDetails,
      }),
    onSuccess: () => {
      toast.success('Withdrawal request submitted')
      setAmount('')
      queryClient.invalidateQueries({ queryKey: ['expert-wallet'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const nav = [
    { to: '/expert', label: 'Dashboard' },
    { to: '/expert/questions', label: 'Questions' },
    { to: '/expert/wallet', label: 'Wallet' },
  ]

  const wallet = data?.wallet

  return (
    <DashboardShell title="Wallet" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Wallet & Earnings</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="luxury-card h-24 animate-pulse bg-surface" />)
        ) : (
          <>
            <StatCard label="Balance" value={`₹${((wallet?.balance ?? 0) / 100).toFixed(2)}`} />
            <StatCard label="Total Earned" value={`₹${((wallet?.totalEarned ?? 0) / 100).toFixed(2)}`} />
            <StatCard label="Withdrawn" value={`₹${((wallet?.totalWithdrawn ?? 0) / 100).toFixed(2)}`} />
          </>
        )}
      </div>

      <div className="luxury-card mt-8 p-6">
        <h2 className="font-semibold text-ink">Request Withdrawal</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(bankDetails).map(([key, val]) => (
            <input
              key={key}
              value={val}
              onChange={(e) => setBankDetails((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={key.replace(/([A-Z])/g, ' $1')}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none"
            />
          ))}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => withdrawMutation.mutate()}
          disabled={withdrawMutation.isPending}
          className="btn-primary mt-4 rounded-xl px-5 py-2 text-sm font-semibold"
        >
          Request Withdrawal
        </button>
      </div>

      <div className="luxury-card mt-6 p-6">
        <h2 className="font-semibold text-ink">Recent Transactions</h2>
        <div className="mt-4 space-y-2">
          {(data?.transactions || []).map((t) => (
            <div key={t._id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="text-muted">{t.description}</span>
              <span className={t.type === 'credit' ? 'text-ink font-medium' : 'text-muted'}>
                {t.type === 'credit' ? '+' : '-'}₹{(t.amount / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
