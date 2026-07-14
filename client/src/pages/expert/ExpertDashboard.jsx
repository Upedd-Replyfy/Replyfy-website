import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  Loader,
  CheckCircle2,
  Coins,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import ExpertStatCard from '../../components/expert/ExpertStatCard'
import ExpertPanel from '../../components/expert/ExpertPanel'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'
import { formatPoints, formatPointsFixed } from '../../utils/currency'
import { useAuth } from '../../context/AuthContext'

const actionLinkClass =
  'flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-charcoal/20 hover:bg-card'

const listLinkClass =
  'flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 text-sm font-medium text-ink transition-colors hover:border-charcoal/20 hover:bg-card'

export default function ExpertDashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Mentor'

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
      <section className="overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-luxury-sm)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <Sparkles size={12} />
              Mentor workspace
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Good to see you, {firstName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Manage assigned questions, deliver thoughtful answers, and track your points earnings.
            </p>
          </div>

          <div className="min-w-[220px] rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <Coins size={20} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Available points</p>
                {isLoading ? (
                  <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-card" />
                ) : (
                  <p className="mt-1 text-2xl font-bold tracking-tight text-ink">
                    {formatPointsFixed(stats?.walletBalance)}
                  </p>
                )}
              </div>
            </div>
            <Link
              to="/expert/wallet"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-muted"
            >
              View points wallet <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ExpertStatCard label="Assigned" value={stats?.assigned ?? 0} icon={ClipboardList} accent="sky" loading={isLoading} />
        <ExpertStatCard label="In Progress" value={stats?.inProgress ?? 0} icon={Loader} accent="amber" loading={isLoading} />
        <ExpertStatCard label="Completed" value={stats?.completed ?? 0} icon={CheckCircle2} accent="emerald" loading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ExpertStatCard label="Total Points Earned" value={formatPoints(stats?.totalEarned)} icon={TrendingUp} accent="cyan" loading={isLoading} />
        <ExpertStatCard label="Points Balance" value={formatPoints(stats?.walletBalance)} icon={Coins} accent="violet" loading={isLoading} />
        <ExpertStatCard label="Average Rating" value={stats?.averageRating?.toFixed(1) ?? '0.0'} icon={Star} accent="amber" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpertPanel
            title="Active Questions"
            subtitle="Questions currently assigned to you"
            noPadding
            action={
              <Link to="/expert/questions" className={actionLinkClass}>
                View all <ArrowRight size={16} />
              </Link>
            }
          >
            {questionsLoading ? (
              <div className="space-y-3 px-6 py-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
                ))}
              </div>
            ) : questions.length ? (
              <div className="divide-y divide-border">
                {questions.map((q) => (
                  <Link
                    key={q._id}
                    to={`/expert/questions/${q._id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface"
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
              <div className="px-6 py-14 text-center">
                <p className="text-base font-medium text-ink">No active questions yet</p>
                <p className="mt-1 text-sm text-muted">New assignments will appear here when matched to you.</p>
              </div>
            )}
          </ExpertPanel>
        </div>

        <div className="space-y-6">
          <ExpertPanel title="Quick Actions">
            <div className="space-y-3">
              <Link to="/expert/questions" className={listLinkClass}>
                View all questions
                <ArrowRight size={18} className="text-muted" />
              </Link>
              <Link to="/expert/wallet" className={listLinkClass}>
                Points & redemptions
                <ArrowRight size={18} className="text-muted" />
              </Link>
            </div>
          </ExpertPanel>

          <ExpertPanel title="Performance Summary">
            <dl className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <dt className="text-sm text-muted">Pending work</dt>
                <dd className="text-lg font-semibold text-ink">{stats?.inProgress ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <dt className="text-sm text-muted">Completed</dt>
                <dd className="text-lg font-semibold text-ink">{stats?.completed ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <dt className="text-sm text-muted">Available points</dt>
                <dd className="text-lg font-semibold text-emerald-600">{formatPoints(stats?.walletBalance)}</dd>
              </div>
            </dl>
          </ExpertPanel>
        </div>
      </div>
    </div>
  )
}
