import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Receipt,
  RefreshCcw,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { PLANS, QUESTION_STATUS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'

function formatAmount(paise) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN')}`
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig = {
  paid: {
    icon: CheckCircle2,
    label: 'Paid',
    color: 'text-emerald-600',
    logo: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  captured: {
    icon: CheckCircle2,
    label: 'Paid',
    color: 'text-emerald-600',
    logo: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  created: {
    icon: Loader2,
    label: 'Pending',
    color: 'text-amber-600',
    logo: 'border-amber-200 bg-amber-50 text-amber-600',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  pending: {
    icon: Loader2,
    label: 'Pending',
    color: 'text-amber-600',
    logo: 'border-amber-200 bg-amber-50 text-amber-600',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-rose-600',
    logo: 'border-rose-200 bg-rose-50 text-rose-600',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  refunded: {
    icon: RefreshCcw,
    label: 'Refunded',
    color: 'text-sky-600',
    logo: 'border-sky-200 bg-sky-50 text-sky-600',
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
  },
}

function getStatus(payment) {
  const key = String(payment?.status || '').toLowerCase()
  return (
    statusConfig[key] || {
      icon: Receipt,
      label: payment?.status || 'Unknown',
      color: 'text-muted',
      logo: 'border-border bg-surface text-muted',
      badge: 'border-border bg-surface text-muted',
    }
  )
}

function DetailRow({ label, value, mono = false }) {
  if (value == null || value === '') return null
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="shrink-0 text-[12px] text-muted">{label}</span>
      <span
        className={`min-w-0 break-all text-right text-[12px] font-medium text-ink ${
          mono ? 'font-mono text-[11px]' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function PaymentDetailModal({ payment, open, onClose }) {
  if (!payment) return null

  const status = getStatus(payment)
  const StatusIcon = status.icon
  const planName = PLANS[payment.plan]?.name || payment.plan
  const title = payment.question?.title || `${planName || 'Question'} payment`
  const original = payment.originalAmount ?? payment.amount
  const discount = payment.discountAmount || 0
  const failureReason = payment.metadata?.failureReason
  const isPending = ['created', 'pending'].includes(String(payment.status || '').toLowerCase())
  const questionStatus = payment.question?.status
    ? QUESTION_STATUS[payment.question.status] ||
      String(payment.question.status).replace(/_/g, ' ')
    : null

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Close payment details"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Billing and transaction details"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] border border-border bg-card shadow-2xl sm:max-h-[90vh] sm:rounded-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.badge}`}
                  >
                    <StatusIcon size={12} className={isPending ? 'animate-spin' : ''} />
                    {status.label}
                  </span>
                  {planName ? (
                    <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                      {planName}
                    </span>
                  ) : null}
                </div>
                <h2 className="truncate text-lg font-semibold tracking-tight text-ink">
                  {title}
                </h2>
                <p className="mt-0.5 text-sm text-muted">Billing & transaction details</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-ink"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                  Amount charged
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {formatAmount(payment.amount)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {payment.currency || 'INR'}
                  {payment.paidAt ? ` · Paid ${formatDateTime(payment.paidAt)}` : ''}
                </p>
              </div>

              <section className="rounded-xl border border-border bg-card px-4 py-1">
                <DetailRow label="Plan" value={planName} />
                <DetailRow label="Original amount" value={formatAmount(original)} />
                <DetailRow
                  label="Discount"
                  value={discount ? formatAmount(discount) : 'None'}
                />
                <DetailRow label="Coupon" value={payment.couponCode || 'None'} />
              </section>

              <section className="rounded-xl border border-border bg-card px-4 py-1">
                <DetailRow label="Order ID" value={payment.razorpayOrderId || '—'} mono />
                <DetailRow
                  label="Payment ID"
                  value={payment.razorpayPaymentId || '—'}
                  mono
                />
                <DetailRow label="Transaction ID" value={payment._id} mono />
                <DetailRow label="Created" value={formatDateTime(payment.createdAt)} />
                <DetailRow label="Updated" value={formatDateTime(payment.updatedAt)} />
                {failureReason ? (
                  <DetailRow
                    label="Failure reason"
                    value={String(failureReason).replace(/_/g, ' ')}
                  />
                ) : null}
              </section>

              {payment.question?._id ? (
                <section className="rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                    Related question
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">
                    {payment.question.title || 'Untitled question'}
                  </p>
                  {questionStatus ? (
                    <p className="mt-0.5 text-xs capitalize text-muted">{questionStatus}</p>
                  ) : null}
                  <Link
                    to={`/dashboard/questions/${payment.question._id}`}
                    onClick={onClose}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink transition hover:gap-2"
                  >
                    Open question
                    <ArrowRight size={13} />
                  </Link>
                </section>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-border px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-card"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

function PaymentCard({ payment, index, onOpen }) {
  const status = getStatus(payment)
  const StatusIcon = status.icon
  const planName = PLANS[payment.plan]?.name || payment.plan
  const title = payment.question?.title || `${planName || 'Question'} payment`
  const preview = planName
    ? `${planName} · ${formatAmount(payment.amount)}`
    : formatAmount(payment.amount)
  const isPending = ['created', 'pending'].includes(String(payment.status || '').toLowerCase())

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(payment)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.15) }}
      whileHover={{ y: -2 }}
      className="group flex min-h-[10.5rem] h-full w-full flex-col rounded-xl border border-border bg-card p-3 text-left transition hover:border-ink/25 hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${status.logo}`}>
          <StatusIcon size={13} className={isPending ? 'animate-spin' : ''} />
        </span>
      </div>

      <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">{preview}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {planName ? (
          <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
            {planName}
          </span>
        ) : null}
        <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
          {formatAmount(payment.amount)}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${status.color}`}>
          <StatusIcon size={11} className={isPending ? 'animate-spin' : ''} />
          {status.label}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-light">
          <Clock size={10} />
          {payment.createdAt ? formatDistanceToNow(payment.createdAt) : '—'}
        </span>
      </div>
    </motion.button>
  )
}

export default function UserBilling() {
  const [selected, setSelected] = useState(null)

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
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Payments
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Billing
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Your payment history and receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <CreditCard size={13} />
              {stats.total} Payments
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <CheckCircle2 size={13} />
              {stats.paid} Paid
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <Wallet size={13} />
              {formatAmount(stats.totalSpent)} spent
            </span>
          </div>
        </header>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="min-h-[10.5rem] animate-pulse rounded-xl border border-border bg-surface"
                  />
                ))}
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-ink">
                <Receipt size={22} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">No payments yet</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted">
                Your transactions will appear here after you ask a question.
              </p>
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                  Payment history
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {payments.length} transactions in your workspace
                </p>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {payments.map((payment, index) => (
                  <PaymentCard
                    key={payment._id}
                    payment={payment}
                    index={index}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>

      <PaymentDetailModal
        open={!!selected}
        payment={selected}
        onClose={() => setSelected(null)}
      />
    </DashboardLayout>
  )
}
