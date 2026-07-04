import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bookmark } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { getSavedQuestionIds, toggleSavedQuestion } from '../../utils/savedAnswers'
import { formatDistanceToNow } from '../../utils/date'

export default function UserSaved() {
  const [savedIds, setSavedIds] = useState(() => getSavedQuestionIds())

  const { data, isLoading } = useQuery({
    queryKey: ['my-questions'],
    queryFn: () => userApi.getQuestions({ limit: 100 }),
  })

  const savedQuestions = useMemo(() => {
    const questions = data?.questions || []
    return questions.filter((q) => savedIds.includes(q._id))
  }, [data?.questions, savedIds])

  const handleRemove = (id) => {
    toggleSavedQuestion(id)
    setSavedIds(getSavedQuestionIds())
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink">Saved Answers</h1>
          <p className="mt-1 text-sm text-muted">Answers you bookmarked for quick reference.</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card h-24 animate-pulse bg-surface" />
            ))}
          </div>
        ) : savedQuestions.length === 0 ? (
          <div className="luxury-card py-16 text-center">
            <Bookmark size={28} className="mx-auto text-muted-light" />
            <p className="mt-4 text-muted">No saved answers yet.</p>
            <p className="mt-1 text-sm text-muted-light">
              Open a completed question and tap Save answer to bookmark it here.
            </p>
            <Link to="/dashboard/questions" className="btn-primary mt-6 inline-block rounded-xl px-5 py-2 text-sm font-semibold">
              View my questions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedQuestions.map((q) => (
              <div key={q._id} className="luxury-card flex items-start justify-between gap-4 p-5">
                <Link to={`/dashboard/questions/${q._id}`} className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{q.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {q.category?.name} · Saved {formatDistanceToNow(q.updatedAt || q.createdAt)}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(q._id)}
                  className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
