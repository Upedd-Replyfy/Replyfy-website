import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, CreditCard, IndianRupee, Search, Webhook, X } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import { adminApi } from '../../services/api'
import { planDisplayName } from '../../constants'
import { formatRupee } from '../../utils/currency'
import { usePlans } from '../../hooks/useCatalog'

function statusTone(status) {
  if (status === 'captured' || status === 'paid' || status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'pending' || status === 'created') return 'warning'
  return 'info'
}

function statusLabel(status) {
  if (status === 'created') return 'Pending checkout'
  if (status === 'paid' || status === 'captured' || status === 'success') return 'Paid'
  if (status === 'failed') return 'Failed'
  if (status === 'refunded') return 'Refunded'
  return status
}

function webhookStatusTone(status) {
  if (status === 'processed') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'ignored') return 'warning'
  return 'info'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function planName(plan, plans) {
  return planDisplayName(plan, plans)
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <span
        className={`min-w-0 text-right text-sm font-medium text-ink break-all ${
          mono ? 'font-mono text-[12px]' : ''
        }`}
      >
        {value || '—'}
      </span>
    </div>
  )
}

function PaymentDetailModal({ payment, open, onClose }) {
  const { data: plans } = usePlans()
  if (!payment) return null

  const failureReason = payment.metadata?.failureReason
  const original = payment.originalAmount ?? payment.amount
  const discount = payment.discountAmount || 0
  const webhookHistory = payment.webhookHistory || []

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Payment details"
      description={`${payment.user?.name || 'User'} · ${formatRupee(payment.amount)}`}
      size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-card sm:w-auto"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <AdminStatusBadge tone={statusTone(payment.status)}>
            {statusLabel(payment.status)}
          </AdminStatusBadge>
          <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold capitalize text-muted">
            {planName(payment.plan, plans)}
          </span>
          <span className="text-lg font-bold text-ink">{formatRupee(payment.amount)}</span>
        </div>

        <section className="rounded-2xl border border-border bg-surface/50 px-4 py-1">
          <DetailRow label="User" value={payment.user?.name} />
          <DetailRow label="Email" value={payment.user?.email} />
          <DetailRow label="User ID" value={payment.user?._id} mono />
        </section>

        <section className="rounded-2xl border border-border bg-surface/50 px-4 py-1">
          <DetailRow label="Question" value={payment.question?.title} />
          <DetailRow
            label="Question status"
            value={
              payment.question?.status
                ? String(payment.question.status).replace(/_/g, ' ')
                : null
            }
          />
          <DetailRow label="Question ID" value={payment.question?._id} mono />
        </section>

        <section className="rounded-2xl border border-border bg-surface/50 px-4 py-1">
          <DetailRow label="Plan" value={planName(payment.plan, plans)} />
          <DetailRow label="Currency" value={payment.currency || 'INR'} />
          <DetailRow label="Amount charged" value={formatRupee(payment.amount)} />
          <DetailRow label="Original amount" value={formatRupee(original)} />
          <DetailRow
            label="Discount"
            value={discount ? formatRupee(discount) : 'None'}
          />
          <DetailRow label="Coupon" value={payment.couponCode || 'None'} />
        </section>

        <section className="rounded-2xl border border-border bg-surface/50 px-4 py-1">
          <DetailRow label="Order ID" value={payment.razorpayOrderId} mono />
          <DetailRow label="Payment ID" value={payment.razorpayPaymentId || '—'} mono />
          <DetailRow
            label="Verified via"
            value={
              payment.verifiedVia
                ? String(payment.verifiedVia).replace(/_/g, ' ')
                : '—'
            }
          />
          <DetailRow label="Paid at" value={formatDateTime(payment.paidAt)} />
          <DetailRow label="Created at" value={formatDateTime(payment.createdAt)} />
          <DetailRow label="Updated at" value={formatDateTime(payment.updatedAt)} />
          <DetailRow label="Record ID" value={payment._id} mono />
          {failureReason ? (
            <DetailRow label="Failure reason" value={String(failureReason).replace(/_/g, ' ')} />
          ) : null}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface/50">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-ink">
                <Webhook size={15} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">Webhook history</h3>
                <p className="text-[11px] text-muted">
                  Razorpay events received for this payment
                </p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-muted">
              {webhookHistory.length}
            </span>
          </div>

          {webhookHistory.length ? (
            <div className="divide-y divide-border">
              {webhookHistory.map((event) => (
                <article key={event._id || event.eventId} className="space-y-2 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {event.event || 'Unknown event'}
                      </span>
                      <AdminStatusBadge tone={webhookStatusTone(event.status)}>
                        {event.status || 'unknown'}
                      </AdminStatusBadge>
                    </div>
                    <time className="text-[11px] text-muted">
                      {formatDateTime(event.createdAt)}
                    </time>
                  </div>
                  <p className="break-all font-mono text-[10px] text-muted-light">
                    Event ID: {event.eventId || '—'}
                  </p>
                  {event.razorpayPaymentId ? (
                    <p className="break-all font-mono text-[10px] text-muted-light">
                      Payment ID: {event.razorpayPaymentId}
                    </p>
                  ) : null}
                  {event.notes ? (
                    <p className="rounded-lg bg-card px-2.5 py-2 text-xs text-muted">
                      {String(event.notes).replace(/_/g, ' ')}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-ink">No webhook events received</p>
              <p className="mt-1 text-xs text-muted">
                This payment may have been verified directly by the checkout.
              </p>
            </div>
          )}
        </section>
      </div>
    </AdminModal>
  )
}

export default function AdminPayments() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const { data: plans } = usePlans()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminApi.getPayments,
  })

  const payments = data?.payments || []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return payments
    return payments.filter((p) => {
      const paymentId = String(p.razorpayPaymentId || '').toLowerCase()
      const orderId = String(p.razorpayOrderId || '').toLowerCase()
      const recordId = String(p._id || '').toLowerCase()
      return paymentId.includes(q) || orderId.includes(q) || recordId.includes(q)
    })
  }, [payments, search])

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + (p.amount || 0), 0)
    const captured = payments.filter((p) =>
      ['captured', 'paid', 'success'].includes(p.status)
    ).length
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
        description="All platform transactions · click a row for full details"
      />

      <AdminStatStrip items={stats} />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-semibold text-ink">Transaction history</p>
            <p className="text-xs text-muted">
              {search.trim()
                ? `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`
                : 'Newest payments first'}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-light"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by payment ID or order ID..."
              className="admin-search h-10 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-9 text-sm text-ink placeholder:text-muted-light focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              aria-label="Search by payment ID"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-card hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </label>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <p className="px-4 py-10 text-center text-muted">Loading payments...</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-muted">
              {search.trim() ? 'No payments match this ID' : 'No payments yet'}
            </p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filtered.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setSelected(p)}
                  className="block w-full space-y-2 px-4 py-4 text-left transition hover:bg-white/[0.03]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.user?.name || '—'}</p>
                      <p className="truncate text-xs text-muted">{p.user?.email}</p>
                    </div>
                    <AdminStatusBadge tone={statusTone(p.status)}>
                      {statusLabel(p.status)}
                    </AdminStatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="capitalize">{planName(p.plan, plans)}</span>
                    <span className="font-semibold text-ink">
                      ₹{(p.amount / 100).toLocaleString('en-IN')}
                    </span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                  {p.razorpayPaymentId ? (
                    <p className="truncate font-mono text-[10px] text-muted-light">
                      {p.razorpayPaymentId}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#242727]">
              <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Payment ID</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    Loading payments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    {search.trim() ? 'No payments match this ID' : 'No payments yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelected(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(p)
                      }
                    }}
                    className="cursor-pointer border-b border-white/[0.06] transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{p.user?.name || '—'}</p>
                      <p className="truncate text-xs text-muted">{p.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 capitalize text-muted">
                      {planName(p.plan, plans)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      ₹{(p.amount / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[160px] truncate font-mono text-[11px] text-muted" title={p.razorpayPaymentId || p.razorpayOrderId || ''}>
                        {p.razorpayPaymentId || p.razorpayOrderId || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge tone={statusTone(p.status)}>
                        {statusLabel(p.status)}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatDate(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentDetailModal
        payment={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
