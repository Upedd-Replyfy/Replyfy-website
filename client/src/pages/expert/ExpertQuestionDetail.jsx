import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import ExpertPanel from '../../components/expert/ExpertPanel'
import { StatusBadge } from '../../components/layouts/DashboardShell'
import { expertApi } from '../../services/api'

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] px-4 py-3.5 text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sky-500/30'

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
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
  }

  const { question, answer } = data || {}
  const canSubmit = ['assigned', 'in_progress'].includes(question?.status)
  const answerPending = answer?.status === 'pending_review'
  const answerRejected = answer?.status === 'rejected'

  return (
    <div className="space-y-6">
      <Link
        to="/expert/questions"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to questions
      </Link>

      <ExpertPanel noPadding>
        <div className="border-b border-white/[0.08] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-ink sm:text-2xl">{question?.title}</h1>
            <StatusBadge status={question?.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span className="rounded-lg bg-white/[0.04] px-3 py-1.5">{question?.category?.name || 'General'}</span>
            {question?.deadline && (
              <span className="rounded-lg bg-white/[0.04] px-3 py-1.5">
                Due {new Date(question.deadline).toLocaleDateString()}
              </span>
            )}
            {question?.user?.name && (
              <span className="rounded-lg bg-white/[0.04] px-3 py-1.5">From {question.user.name}</span>
            )}
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-muted">{question?.description}</p>

          {question?.attachments?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {question.attachments.map((a) => (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white/[0.04]"
                >
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
              className="mt-6 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-black disabled:opacity-50"
            >
              Start working on this question
            </button>
          )}

          {answerPending && (
            <p className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-base text-amber-200">
              Your answer is pending admin review. You will be notified once it is approved.
            </p>
          )}

          {answerRejected && (
            <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-base text-rose-300">
              Revision needed: {answer.rejectionReason}
            </p>
          )}

          {canSubmit && !answerPending && (
            <div className="mt-8 border-t border-white/[0.08] pt-8">
              <h2 className="text-lg font-semibold text-ink">Submit your answer</h2>
              <p className="mt-1 text-sm text-muted">Provide a detailed, professional response for the user.</p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className={`${inputClass} mt-4`}
                placeholder="Write your professional answer here…"
              />
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="mt-4 text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-ink"
              />
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={!content.trim() || submitMutation.isPending}
                className="mt-5 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-black disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          )}
        </div>
      </ExpertPanel>
    </div>
  )
}
