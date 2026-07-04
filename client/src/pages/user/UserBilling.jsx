import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { PLANS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'

function formatAmount(paise) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN')}`
}

export default function UserBilling() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-payments'],
    queryFn: () => userApi.getPayments(),
  })

  const payments = data?.payments || []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink">Billing</h1>
          <p className="mt-1 text-sm text-muted">Your payment history and receipts.</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card h-20 animate-pulse bg-surface" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="luxury-card py-16 text-center">
            <p className="text-muted">No payments yet.</p>
            <p className="mt-1 text-sm text-muted-light">Your transactions will appear here after you ask a question.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment._id} className="luxury-card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-ink">
                    {payment.question?.title || PLANS[payment.plan]?.name || 'Question payment'}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {PLANS[payment.plan]?.name || payment.plan} plan · {formatDistanceToNow(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-ink">{formatAmount(payment.amount)}</p>
                  <p className="mt-1 text-xs capitalize text-muted">{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
