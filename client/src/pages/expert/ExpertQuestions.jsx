import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DashboardShell, StatusBadge } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

export default function ExpertQuestions() {
  const { data, isLoading } = useQuery({
    queryKey: ['expert-questions'],
    queryFn: () => expertApi.getQuestions({ limit: 50 }),
  })

  const nav = [
    { to: '/expert', label: 'Dashboard' },
    { to: '/expert/questions', label: 'Questions' },
    { to: '/expert/wallet', label: 'Wallet' },
  ]

  return (
    <DashboardShell title="Questions" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Assigned Questions</h1>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="luxury-card h-20 animate-pulse bg-surface" />)}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(data?.questions || []).map((q) => (
            <Link key={q._id} to={`/expert/questions/${q._id}`} className="luxury-card luxury-card-hover block p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{q.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {q.category?.name} · Deadline: {q.deadline ? new Date(q.deadline).toLocaleDateString() : '—'}
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </div>
            </Link>
          ))}
          {!data?.questions?.length && (
            <div className="luxury-card py-12 text-center text-muted">No assigned questions</div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
