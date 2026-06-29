import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  Loader,
  CheckCircle2,
  IndianRupee,
  Star,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import ExpertStatCard from '../../components/expert/ExpertStatCard'
import ExpertPanel from '../../components/expert/ExpertPanel'
import ExpertPageHeader from '../../components/expert/ExpertPageHeader'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

import { formatRupee } from '../../utils/currency'

export default function ExpertDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['expert-dashboard'],
    queryFn: expertApi.getDashboard,
    refetchInterval: 60000,
  })

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['expert-questions', 'recent'],
    queryFn: () => expertApi.getQuestions({ limit: 6 }),
  })

  const stats = data?.stats
  const questions = questionsData?.questions || []

  return (
    <div className="space-y-8">
      <ExpertPageHeader
        title="Dashboard"
        description="Track assignments, deliver answers, and monitor your earnings."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <ExpertStatCard label="Assigned" value={stats?.assigned ?? 0} icon={ClipboardList} accent="sky" loading={isLoading} />
        <ExpertStatCard label="In Progress" value={stats?.inProgress ?? 0} icon={Loader} accent="amber" loading={isLoading} />
        <ExpertStatCard label="Completed" value={stats?.completed ?? 0} icon={CheckCircle2} accent="emerald" loading={isLoading} />
        <ExpertStatCard label="Wallet Balance" value={formatRupee(stats?.walletBalance)} icon={IndianRupee} accent="violet" loading={isLoading} />
        <ExpertStatCard label="Total Earned" value={formatRupee(stats?.totalEarned)} icon={TrendingUp} accent="cyan" loading={isLoading} />
        <ExpertStatCard label="Average Rating" value={stats?.averageRating?.toFixed(1) ?? '0.0'} icon={Star} accent="amber" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpertPanel
            title="Active Questions"
            subtitle="Questions currently assigned to you"
            noPadding
            action={
              <Link
                to="/expert/questions"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
              >
                View all <ArrowRight size={16} />
              </Link>
            }
          >
            {questionsLoading ? (
              <div className="space-y-3 px-6 py-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                ))}
              </div>
            ) : questions.length ? (
              <div className="divide-y divide-white/[0.06]">
                {questions.map((q) => (
                  <Link
                    key={q._id}
                    to={`/expert/questions/${q._id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-ink">{q.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {q.category?.name || 'General'}
                        {q.deadline ? ` · Due ${new Date(q.deadline).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={q.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-6 py-12 text-center text-base text-muted">No active questions assigned yet</p>
            )}
          </ExpertPanel>
        </div>

        <div className="space-y-6">
          <ExpertPanel title="Quick Actions">
            <div className="space-y-3">
              <Link
                to="/expert/questions"
                className="flex items-center justify-between rounded-xl border border-white/[0.08] px-5 py-4 text-base font-medium text-ink transition-colors hover:bg-white/[0.04]"
              >
                View all questions
                <ArrowRight size={18} className="text-muted" />
              </Link>
              <Link
                to="/expert/wallet"
                className="flex items-center justify-between rounded-xl border border-white/[0.08] px-5 py-4 text-base font-medium text-ink transition-colors hover:bg-white/[0.04]"
              >
                Wallet & withdrawals
                <ArrowRight size={18} className="text-muted" />
              </Link>
            </div>
          </ExpertPanel>

          <ExpertPanel title="Performance Summary">
            <dl className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-sm text-muted">Pending work</dt>
                <dd className="text-lg font-semibold text-ink">{stats?.inProgress ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-sm text-muted">Completed</dt>
                <dd className="text-lg font-semibold text-ink">{stats?.completed ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                <dt className="text-sm text-muted">Available balance</dt>
                <dd className="text-lg font-semibold text-emerald-400">{formatRupee(stats?.walletBalance)}</dd>
              </div>
            </dl>
          </ExpertPanel>
        </div>
      </div>
    </div>
  )
}
