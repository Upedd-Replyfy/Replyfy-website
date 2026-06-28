import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DashboardShell, StatCard } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

export default function ExpertDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['expert-dashboard'],
    queryFn: expertApi.getDashboard,
  })

  const stats = data?.stats

  const nav = [
    { to: '/expert', label: 'Dashboard' },
    { to: '/expert/questions', label: 'Questions' },
    { to: '/expert/wallet', label: 'Wallet' },
  ]

  return (
    <DashboardShell title="Expert" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Expert Dashboard</h1>
      <p className="mt-1 text-muted">Manage assigned questions and earnings</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="luxury-card h-24 animate-pulse bg-surface" />)
        ) : (
          <>
            <StatCard label="Assigned" value={stats?.assigned ?? 0} />
            <StatCard label="In Progress" value={stats?.inProgress ?? 0} />
            <StatCard label="Completed" value={stats?.completed ?? 0} />
            <StatCard label="Wallet" value={`₹${((stats?.walletBalance ?? 0) / 100).toFixed(0)}`} />
          </>
        )}
      </div>

      <Link
        to="/expert/questions"
        className="btn-primary mt-8 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        View Assigned Questions
      </Link>
    </DashboardShell>
  )
}
