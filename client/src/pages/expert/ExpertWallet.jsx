import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Coins, TrendingUp, Wallet } from 'lucide-react'
import ExpertStatCard from '../../components/expert/ExpertStatCard'
import ExpertPageHeader from '../../components/expert/ExpertPageHeader'
import ExpertPanel from '../../components/expert/ExpertPanel'
import { expertApi } from '../../services/api'
import { formatPointsFixed } from '../../utils/currency'

const bankFields = [
  { key: 'accountName', label: 'Account name' },
  { key: 'accountNumber', label: 'Account number' },
  { key: 'ifsc', label: 'IFSC code' },
  { key: 'bankName', label: 'Bank name' },
]

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-ink placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-sky-500/30'

export default function ExpertWallet() {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  })

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
      toast.success('Redemption request submitted')
      setAmount('')
      queryClient.invalidateQueries({ queryKey: ['expert-wallet'] })
      queryClient.invalidateQueries({ queryKey: ['expert-dashboard'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const wallet = data?.wallet
  const transactions = data?.transactions || []

  return (
    <div className="space-y-8">
      <ExpertPageHeader
        title="Points Wallet"
        description="Track your points balance, redeem earnings, and review transaction history."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ExpertStatCard label="Available Points" value={formatPointsFixed(wallet?.balance)} icon={Wallet} accent="emerald" loading={isLoading} />
        <ExpertStatCard label="Total Points Earned" value={formatPointsFixed(wallet?.totalEarned)} icon={TrendingUp} accent="sky" loading={isLoading} />
        <ExpertStatCard label="Points Redeemed" value={formatPointsFixed(wallet?.totalWithdrawn)} icon={Coins} accent="violet" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpertPanel title="Redeem Points" subtitle="Redemptions are processed after admin approval">
          <div className="grid gap-4 sm:grid-cols-2">
            {bankFields.map(({ key, label }) => (
              <input
                key={key}
                value={bankDetails[key]}
                onChange={(e) => setBankDetails((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={label}
                className={inputClass}
              />
            ))}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Points to redeem"
              className={`${inputClass} sm:col-span-2`}
            />
          </div>
          <button
            type="button"
            onClick={() => withdrawMutation.mutate()}
            disabled={withdrawMutation.isPending || !amount || !bankDetails.accountNumber}
            className="mt-5 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-fg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {withdrawMutation.isPending ? 'Submitting…' : 'Submit redemption request'}
          </button>
        </ExpertPanel>

        <ExpertPanel title="Recent Transactions" subtitle="Latest point credits and redemptions">
          {transactions.length ? (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 transition-colors hover:bg-card"
                >
                  <span className="truncate pr-4 text-sm text-muted">{t.description}</span>
                  <span className={`shrink-0 text-base font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-muted'}`}>
                    {t.type === 'credit' ? '+' : '-'}
                    {formatPointsFixed(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-base text-muted">No transactions yet</p>
          )}
        </ExpertPanel>
      </div>
    </div>
  )
}
