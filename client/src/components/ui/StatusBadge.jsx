const STATUS_STYLES = {
  pending_payment: 'bg-surface text-muted',
  pending_admin_review: 'bg-surface text-ink',
  assigned: 'bg-white/10 text-ink',
  in_progress: 'bg-white/10 text-ink',
  waiting_admin_review: 'bg-surface text-muted',
  completed: 'bg-primary text-primary-fg',
  rejected: 'bg-charcoal/10 text-charcoal',
  pending_review: 'bg-surface text-muted',
  approved: 'bg-primary text-primary-fg',
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
