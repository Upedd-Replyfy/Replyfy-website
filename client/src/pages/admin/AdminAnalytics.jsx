import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/api'
import AnalyticsSection from '../../components/admin/AnalyticsSection'

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gradient-accent">Insights</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Revenue, engagement, and growth metrics</p>
      </div>
      <AnalyticsSection charts={data?.charts} loading={isLoading} />
    </div>
  )
}
