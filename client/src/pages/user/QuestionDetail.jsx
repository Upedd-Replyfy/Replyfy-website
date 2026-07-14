import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { Bookmark, Star } from 'lucide-react'
import { isQuestionSaved, toggleSavedQuestion } from '../../utils/savedAnswers'

export default function QuestionDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(() => isQuestionSaved(id))

  useEffect(() => {
    setSaved(isQuestionSaved(id))
  }, [id])

  const { data, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => userApi.getQuestion(id),
  })

  const ratingMutation = useMutation({
    mutationFn: () => userApi.submitRating({ questionId: id, stars, comment }),
    onSuccess: () => {
      toast.success('Thank you for your rating!')
      queryClient.invalidateQueries({ queryKey: ['question', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl luxury-card h-64 animate-pulse bg-surface" />
      </DashboardLayout>
    )
  }

  const { question, answer } = data || {}
  if (!question) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-muted">Question not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard/questions" className="text-sm text-muted hover:text-ink">← Back to questions</Link>

        <div className="luxury-card mt-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-ink">{question.title}</h1>
            <StatusBadge status={question.status} />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">{question.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-light">
            <span>{question.category?.name}</span>
            <span>·</span>
            <span className="capitalize">{question.plan} plan</span>
            <span>·</span>
            <span className="capitalize">{question.priority} priority</span>
          </div>
          {question.rejectionReason && (
            <p className="mt-4 rounded-xl bg-surface p-3 text-sm text-charcoal">
              Rejection reason: {question.rejectionReason}
            </p>
          )}
        </div>

        {answer && question.status === 'completed' && (
          <div className="luxury-card mt-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Mentor Answer</h2>
              <button
                type="button"
                onClick={() => {
                  const isSaved = toggleSavedQuestion(question._id)
                  setSaved(isSaved)
                  toast.success(isSaved ? 'Answer saved' : 'Removed from saved')
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  saved
                    ? 'border-primary bg-primary text-primary-fg'
                    : 'border-border text-muted hover:bg-surface hover:text-ink'
                }`}
              >
                <Bookmark size={14} className={saved ? 'fill-current' : ''} />
                {saved ? 'Saved' : 'Save answer'}
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{answer.content}</p>
            {answer.attachments?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {answer.attachments.map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-surface"
                  >
                    Download {a.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {question.status === 'completed' && !question.isRated && (
          <div className="luxury-card mt-6 p-6">
            <h2 className="text-lg font-semibold text-ink">Rate this mentor</h2>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setStars(n)}>
                  <Star size={24} className={n <= stars ? 'fill-ink text-ink' : 'text-border'} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              rows={3}
              className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/10"
            />
            <button
              type="button"
              onClick={() => ratingMutation.mutate()}
              disabled={ratingMutation.isPending}
              className="btn-primary mt-4 rounded-xl px-5 py-2 text-sm font-semibold"
            >
              Submit Rating
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
