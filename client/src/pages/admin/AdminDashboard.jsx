import { useQuery } from '@tanstack/react-query'
import {
  Users,
  UserCheck,
  HelpCircle,
  MessageSquare,
  IndianRupee,
  Wallet,
  TrendingUp,
  Target,
} from 'lucide-react'
import { adminApi } from '../../services/api'
import StatOverviewCard from '../../components/admin/StatOverviewCard'
import AnalyticsSection from '../../components/admin/AnalyticsSection'
import ActivityFeed from '../../components/admin/ActivityFeed'
import PendingReviewTable from '../../components/admin/PendingReviewTable'
import QuickStatsPanel from '../../components/admin/QuickStatsPanel'
import AdminQuickLinks from '../../components/admin/AdminQuickLinks'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { formatRupee } from '../../utils/currency'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 60000,
  })

  const stats = data?.stats
  const trends = data?.trends

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Overview"
        title="Admin Dashboard"
        description="Platform health, pending actions, and revenue at a glance"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatOverviewCard label="Total Users" value={stats?.totalUsers ?? 0} trend={trends?.users} icon={Users} accent="sky" loading={isLoading} />
        <StatOverviewCard label="Verified Mentors" value={stats?.verifiedExperts ?? 0} trend={trends?.experts} icon={UserCheck} accent="violet" loading={isLoading} />
        <StatOverviewCard label="Pending Questions" value={stats?.pendingQuestions ?? 0} trend={trends?.questions} icon={HelpCircle} accent="amber" loading={isLoading} />
        <StatOverviewCard label="Pending Answers" value={stats?.pendingAnswers ?? 0} trend={trends?.answers} icon={MessageSquare} accent="cyan" loading={isLoading} />
        <StatOverviewCard label="Revenue" value={formatRupee(stats?.totalRevenue)} trend={trends?.revenue} icon={IndianRupee} accent="emerald" loading={isLoading} />
        <StatOverviewCard label="Withdrawals" value={stats?.pendingWithdrawals ?? 0} trend={trends?.withdrawals} icon={Wallet} accent="rose" loading={isLoading} />
        <StatOverviewCard label="Platform Growth" value={`${stats?.platformGrowth ?? 0}%`} trend={trends?.platformGrowth} icon={TrendingUp} accent="purple" loading={isLoading} />
        <StatOverviewCard label="Success Rate" value={`${stats?.successRate ?? 0}%`} trend={trends?.successRate} icon={Target} accent="blue" loading={isLoading} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <AnalyticsSection charts={data?.charts} loading={isLoading} compact />
          <PendingReviewTable questions={data?.pendingQuestions} loading={isLoading} />
        </div>
        <div className="space-y-5 xl:col-span-4">
          <AdminQuickLinks />
          <QuickStatsPanel stats={stats} loading={isLoading} />
          <ActivityFeed activity={data?.activity} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}
