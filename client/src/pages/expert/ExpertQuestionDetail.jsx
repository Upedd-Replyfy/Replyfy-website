import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { DashboardShell, StatusBadge } from '../../components/layouts/DashboardShell'
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
    },
    onError: (err) => toast.error(err.message),
  })

  const nav = [
    { to: '/expert', label: 'Dashboard' },
    { to: '/expert/questions', label: 'Questions' },
    { to: '/expert/wallet', label: 'Wallet' },
  ]

  if (isLoading) {
    return (
      <DashboardShell nav={nav}>
        <div className="luxury-card h-64 animate-pulse bg-surface" />
      </DashboardShell>
    )
  }

  const { question, answer } = data || {}

  return (
    <DashboardShell nav={nav}>
      <Link to="/expert/questions" className="text-sm text-muted hover:text-ink">← Back</Link>

      <div className="luxury-card mt-6 p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-semibold text-ink">{question?.title}</h1>
          <StatusBadge status={question?.status} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{question?.description}</p>
        {question?.attachments?.map((a) => (
          <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-ink underline">
            {a.name}
          </a>
        ))}

        {question?.status === 'assigned' && (
          <button
            type="button"
            onClick={() => startMutation.mutate()}
            className="btn-primary mt-6 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Start Working
          </button>
        )}

        {['assigned', 'in_progress'].includes(question?.status) && !answer?.status?.includes('pending') && (
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-semibold text-ink">Submit Answer</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none"
              placeholder="Write your professional answer..."
            />
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="mt-4 text-sm"
            />
            <button
              type="button"
              onClick={() => submitMutation.mutate()}
              disabled={!content.trim() || submitMutation.isPending}
              className="btn-primary mt-4 rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Submit for Review
            </button>
          </div>
        )}

        {answer?.status === 'rejected' && (
          <p className="mt-4 rounded-xl bg-surface p-3 text-sm text-charcoal">
            Revision needed: {answer.rejectionReason}
          </p>
        )}
      </div>
    </DashboardShell>
  )
}
