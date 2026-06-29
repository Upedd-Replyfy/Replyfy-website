import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ExpertPageHeader from '../../components/expert/ExpertPageHeader'
import ExpertPanel from '../../components/expert/ExpertPanel'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

export default function ExpertQuestions() {
  const { data, isLoading } = useQuery({
    queryKey: ['expert-questions'],
    queryFn: () => expertApi.getQuestions({ limit: 50 }),
  })

  const questions = data?.questions || []

  return (
    <div className="space-y-8">
      <ExpertPageHeader
        title="Assigned Questions"
        description={`${questions.length} active assignment${questions.length !== 1 ? 's' : ''} requiring your attention.`}
        badge={
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-ink">
            {questions.length} total
          </span>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      ) : questions.length ? (
        <ExpertPanel title="Your assignments" subtitle="Click a question to view details and submit your answer" noPadding>
          <div className="divide-y divide-white/[0.06]">
            {questions.map((q) => (
              <Link
                key={q._id}
                to={`/expert/questions/${q._id}`}
                className="flex items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">{q.title}</p>
                  <p className="mt-1.5 text-sm text-muted">
                    {q.category?.name} · {q.user?.name || 'User'}
                    {q.deadline ? ` · Due ${new Date(q.deadline).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </Link>
            ))}
          </div>
        </ExpertPanel>
      ) : (
        <ExpertPanel>
          <p className="py-12 text-center text-base text-muted">No assigned questions right now. Check back later.</p>
        </ExpertPanel>
      )}
    </div>
  )
}
