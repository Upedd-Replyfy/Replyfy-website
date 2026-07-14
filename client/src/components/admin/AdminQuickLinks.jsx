import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/api'

export default function AdminQuickLinks() {
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.getDashboard })
  const pending = (data?.stats?.pendingQuestions ?? 0) + (data?.stats?.pendingAnswers ?? 0)

  const links = [
    { to: '/admin/questions', label: 'Review Questions', count: data?.stats?.pendingQuestions },
    { to: '/admin/answers', label: 'Review Answers', count: data?.stats?.pendingAnswers },
    { to: '/admin/withdrawals', label: 'Withdrawals', count: data?.stats?.pendingWithdrawals },
    { to: '/admin/experts', label: 'Register Mentor', register: true },
  ]

  return (
    <div className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-5">
      <h3 className="text-sm font-semibold text-ink">Quick Actions</h3>
      <p className="mt-0.5 text-xs text-muted">{pending} items need attention</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.register ? '/admin/experts?register=1' : link.to}
            className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm font-medium text-ink transition-all hover:border-sky-500/30 hover:bg-sky-500/5"
          >
            {link.label}
            {link.count != null && link.count > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                {link.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
