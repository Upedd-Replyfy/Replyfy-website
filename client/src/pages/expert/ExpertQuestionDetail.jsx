import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, Calendar, FolderOpen, Paperclip, User2, X } from 'lucide-react'
import ExpertPanel from '../../components/expert/ExpertPanel'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

export default function ExpertQuestionDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['expert-question', id],
    queryFn: () => expertApi.getQuestion(id),
  })

  const startMutation = useMutation({
    mutationFn: () => expertApi.startQuestion(id),
    onSuccess: () => {
      toast.success('Question started')
      queryClient.invalidateQueries({ queryKey: ['expert-question', id] })
      queryClient.invalidateQueries({ queryKey: ['expert-questions'] })
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('content', content)
      files.forEach((f) => formData.append('files', f))
      return expertApi.submitAnswer(id, formData)
    },
    onSuccess: () => {
      toast.success('Answer submitted for review')
      queryClient.invalidateQueries({ queryKey: ['expert-question', id] })
      queryClient.invalidateQueries({ queryKey: ['expert-questions'] })
      queryClient.invalidateQueries({ queryKey: ['expert-dashboard'] })
      setContent('')
      setFiles([])
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
  }

  const { question, answer } = data || {}
  const canSubmit = ['assigned', 'in_progress'].includes(question?.status)
  const answerPending = answer?.status === 'pending_review'
  const answerRejected = answer?.status === 'rejected'

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to="/expert/questions"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to questions
      </Link>

      <ExpertPanel noPadding>
        <div className="border-b border-border px-6 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {question?.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {question?.category?.name && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                    <FolderOpen size={12} />
                    {question.category.name}
                  </span>
                )}
                {question?.deadline && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                    <Calendar size={12} />
                    Due {new Date(question.deadline).toLocaleDateString()}
                  </span>
                )}
                {question?.user?.name && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                    <User2 size={12} />
                    From {question.user.name}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={question?.status} />
          </div>
        </div>

        <div className="px-6 py-6 sm:px-7">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink/80">
            {question?.description}
          </p>

          {question?.attachments?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {question.attachments.map((a) => (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink transition hover:bg-card"
                >
                  <Paperclip size={14} className="text-muted" />
                  {a.name}
                </a>
              ))}
            </div>
          )}

          {question?.status === 'assigned' && (
            <button
              type="button"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg transition hover:opacity-90 disabled:opacity-50"
            >
              {startMutation.isPending ? 'Starting…' : 'Start working on this question'}
            </button>
          )}

          {answerPending && (
            <p className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3.5 text-sm text-amber-700 dark:text-amber-200">
              Your answer is pending admin review. You will be notified once it is approved.
            </p>
          )}

          {answerRejected && (
            <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-700 dark:text-rose-300">
              Revision needed: {answer.rejectionReason}
            </p>
          )}

          {canSubmit && !answerPending && (
            <div className="mt-8 rounded-2xl border border-border bg-surface/50 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink">Submit your answer</h2>
              <p className="mt-1 text-sm text-muted">
                Provide a detailed, professional response for the user.
              </p>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="mt-4 w-full resize-y rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] leading-relaxed text-ink placeholder:text-muted-light shadow-[var(--shadow-luxury-sm)] transition focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
                placeholder="Write your professional answer here…"
              />

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-ink transition hover:bg-surface">
                    <Paperclip size={15} className="text-muted" />
                    Attach files
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted"
                        >
                          <span className="truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="rounded p-0.5 text-muted hover:bg-surface hover:text-ink"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => submitMutation.mutate()}
                  disabled={!content.trim() || submitMutation.isPending}
                  className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
                </button>
              </div>
            </div>
          )}
        </div>
      </ExpertPanel>
    </div>
  )
}
