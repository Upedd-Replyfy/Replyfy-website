import AdminBadge from './ui/AdminBadge'

/** Back-compat wrapper used across admin pages */
export default function AdminStatusBadge({ children, tone = 'neutral', className = '' }) {
  const mapped =
    tone === 'success'
      ? 'success'
      : tone === 'warning'
        ? 'warning'
        : tone === 'danger'
          ? 'danger'
          : tone === 'info'
            ? 'info'
            : tone === 'violet'
              ? 'violet'
              : 'neutral'

  return (
    <AdminBadge tone={mapped} className={className} dot>
      {children}
    </AdminBadge>
  )
}
