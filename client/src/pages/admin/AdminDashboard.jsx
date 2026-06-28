import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DashboardShell, StatCard } from '../../components/layouts/DashboardShell'
import { adminApi } from '../../services/api'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
  })

  const stats = data?.stats
  const nav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/questions', label: 'Questions' },
    { to: '/admin/answers', label: 'Answers' },
    { to: '/admin/experts', label: 'Experts' },
    { to: '/admin/users', label: 'Users' },
  ]

  return (
    <DashboardShell title="Admin" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Admin Dashboard</h1>
      <p className="mt-1 text-muted">Platform overview and pending actions</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="luxury-card h-24 animate-pulse bg-surface" />)
        ) : (
          <>
            <StatCard label="Users" value={stats?.totalUsers ?? 0} />
            <StatCard label="Experts" value={stats?.totalExperts ?? 0} />
            <StatCard label="Pending Questions" value={stats?.pendingQuestions ?? 0} sub="Needs review" />
            <StatCard label="Pending Answers" value={stats?.pendingAnswers ?? 0} sub="Needs review" />
            <StatCard label="Revenue" value={`₹${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`} />
            <StatCard label="Completed" value={stats?.completedQuestions ?? 0} />
            <StatCard label="Withdrawals" value={stats?.pendingWithdrawals ?? 0} sub="Pending" />
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/questions" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
          Review Questions
        </Link>
        <Link to="/admin/answers" className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold">
          Review Answers
        </Link>
      </div>
    </DashboardShell>
  )
}
