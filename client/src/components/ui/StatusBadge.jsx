const STATUS_STYLES = {
  pending_payment: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  pending_admin_review: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  assigned: 'bg-white/10 text-ink',
  in_progress: 'bg-white/10 text-ink',
  waiting_admin_review: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  completed: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-charcoal/10 text-charcoal',
  pending_review: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  approved: 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[status] || 'bg-surface text-muted'}`}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
