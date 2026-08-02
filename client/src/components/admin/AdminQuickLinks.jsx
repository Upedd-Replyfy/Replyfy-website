import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleHelp, MessageSquare, Wallet, UserPlus, ArrowUpRight } from 'lucide-react'
import { adminApi } from '../../services/api'

export default function AdminQuickLinks() {
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.getDashboard })
  const pending = (data?.stats?.pendingQuestions ?? 0) + (data?.stats?.pendingAnswers ?? 0)

  const links = [
    { to: '/admin/questions', label: 'Review Questions', count: data?.stats?.pendingQuestions, icon: CircleHelp },
    { to: '/admin/answers', label: 'Review Answers', count: data?.stats?.pendingAnswers, icon: MessageSquare },
    { to: '/admin/withdrawals', label: 'Withdrawals', count: data?.stats?.pendingWithdrawals, icon: Wallet },
    { to: '/admin/experts?register=1', label: 'Register Mentor', icon: UserPlus },
  ]

  return (
    <div className="admin-panel rounded-[20px] border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
      <p className="mt-0.5 text-xs text-slate-500">{pending} items need attention</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.label}
              to={link.to}
              className="group flex items-center justify-between rounded-2xl border border-border bg-slate-50/70 px-3.5 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50/70"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-border">
                  <Icon size={15} />
                </span>
                {link.label}
              </span>
              <span className="inline-flex items-center gap-2">
                {link.count != null && link.count > 0 && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                    {link.count}
                  </span>
                )}
                <ArrowUpRight size={14} className="text-slate-300 transition group-hover:text-indigo-500" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
