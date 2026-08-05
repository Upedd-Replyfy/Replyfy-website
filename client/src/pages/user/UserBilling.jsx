import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Receipt,
  Sparkles,
  Wallet,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { PLANS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'

function formatAmount(paise) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN')}`
}

const PAYMENT_TONE = {
  paid: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
  captured: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
  created: 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
  pending: 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
  failed: 'bg-rose-500/15 text-rose-400 ring-rose-500/25',
  refunded: 'bg-sky-500/15 text-sky-400 ring-sky-500/25',
}

function PaymentCard({ payment, index }) {
  const status = String(payment.status || '').toLowerCase()
  const tone = PAYMENT_TONE[status] || 'bg-surface text-muted ring-border'
  const planName = PLANS[payment.plan]?.name || payment.plan
  const title = payment.question?.title || `${planName || 'Question'} payment`

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.25) }}
      whileHover={{ y: -4 }}
      className="premium-surface relative flex h-full flex-col rounded-[16px] p-4 transition hover:border-[#5B4CFF]/50"
    >
      <div className="relative z-[1] flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-[#7C6CFF]">
            <Receipt size={18} />
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${tone}`}>
            {payment.status || 'unknown'}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight text-ink">
          {title}
        </h3>

        <p className="mt-2 text-[12px] text-muted">
          {planName ? `${planName} plan` : 'Plan'}
          {payment.createdAt ? ` · ${formatDistanceToNow(payment.createdAt)}` : ''}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-light">
              Amount
            </p>
            <p className="mt-0.5 text-xl font-semibold text-ink">
              {formatAmount(payment.amount)}
            </p>
          </div>
          {payment.question?._id ? (
            <Link
              to={`/dashboard/questions/${payment.question._id}`}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#a5a0ff] hover:underline"
            >
              View question
              <ArrowRight size={13} />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

export default function UserBilling() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-payments'],
    queryFn: () => userApi.getPayments(),
  })

  const payments = data?.payments || []

  const stats = useMemo(() => {
    const paid = payments.filter((p) =>
      ['paid', 'captured'].includes(String(p.status || '').toLowerCase())
    )
    const totalSpent = paid.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    return { total: payments.length, paid: paid.length, totalSpent }
  }, [payments])

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 lg:py-10"
      >
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a5a0ff]">
              <Sparkles size={12} />
              Payments
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-[36px] sm:leading-[1.15]">
              Billing
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Your payment history and receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <CreditCard size={13} className="text-[#7C6CFF]" />
              {stats.total} Payments
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              {stats.paid} Paid
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-xs font-semibold text-[#a5a0ff]">
              <Wallet size={13} />
              {formatAmount(stats.totalSpent)} spent
            </span>
          </div>
        </header>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="premium-surface h-[180px] animate-pulse rounded-[16px]" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center rounded-[24px] border border-dashed border-border bg-card px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
                <Receipt size={24} />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-ink">No payments yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Your transactions will appear here after you ask a question.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              {payments.map((payment, index) => (
                <PaymentCard key={payment._id} payment={payment} index={index} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
