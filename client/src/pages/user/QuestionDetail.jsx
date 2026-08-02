import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import StatusBadge from '../../components/ui/StatusBadge'
import { Bookmark, Star } from 'lucide-react'
import { isQuestionSaved, toggleSavedQuestion } from '../../utils/savedAnswers'

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

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
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
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
          <div className="luxury-card mt-6 overflow-hidden border border-border p-0">
            <div className="border-b border-border bg-surface/80 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-ink">Rate this mentor</h2>
              <p className="mt-1 text-sm text-muted">
                {question.assignedExpert?.name
                  ? `How was your experience with ${question.assignedExpert.name}?`
                  : 'Your feedback helps other users and supports mentor quality.'}
              </p>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Your rating
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = n <= stars
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setStars(n)}
                        aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                          active
                            ? 'border-amber-400/50 bg-amber-400/15 text-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]'
                            : 'border-border bg-card text-muted-light hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-amber-300'
                        }`}
                      >
                        <Star
                          size={22}
                          strokeWidth={1.75}
                          className={active ? 'fill-amber-400 text-amber-400' : 'fill-none'}
                        />
                      </button>
                    )
                  })}
                  <span className="ml-1 text-sm font-medium text-ink sm:ml-2">
                    {stars} / 5 · {RATING_LABELS[stars]}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="rating-comment" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Comment <span className="font-normal normal-case tracking-normal text-muted-light">(optional)</span>
                </label>
                <textarea
                  id="rating-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What went well? Any advice for future users?"
                  rows={4}
                  className="w-full resize-y rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-muted-light focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                  Ratings unlock mentor earnings and improve matching quality.
                </p>
                <button
                  type="button"
                  onClick={() => ratingMutation.mutate()}
                  disabled={ratingMutation.isPending}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ratingMutation.isPending ? 'Submitting...' : 'Submit rating'}
                </button>
              </div>
            </div>
          </div>
        )}

        {question.status === 'completed' && question.isRated && (
          <div className="luxury-card mt-6 flex items-start gap-3 border border-emerald-500/20 bg-emerald-500/10 p-5">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Star size={18} className="fill-emerald-400" />
            </span>
            <div>
              <p className="font-semibold text-ink">Thanks for your rating</p>
              <p className="mt-1 text-sm text-muted">
                Your feedback was submitted successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
