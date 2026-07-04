import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { QUESTION_STATUS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'

export default function UserQuestions() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-questions'],
    queryFn: () => userApi.getQuestions({ limit: 50 }),
  })

  const questions = data?.questions || []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">My Questions</h1>
            <p className="text-sm text-muted">Track all your questions and answers</p>
          </div>
          <Link to="/dashboard/ask" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
            Ask Question
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card h-24 animate-pulse bg-surface" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="luxury-card py-16 text-center">
            <p className="text-muted">No questions yet</p>
            <Link to="/dashboard/ask" className="btn-primary mt-4 inline-block rounded-xl px-5 py-2 text-sm font-semibold">
              Ask your first question
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Link
                key={q._id}
                to={`/dashboard/questions/${q._id}`}
                className="luxury-card luxury-card-hover block p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{q.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {q.category?.name} · {QUESTION_STATUS[q.status] || q.status}
                    </p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
