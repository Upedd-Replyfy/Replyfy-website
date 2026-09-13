import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Calendar,
  FolderOpen,
  Paperclip,
  Link2,
  User2,
  X,
  FileText,
  PenLine,
  CreditCard,
  Play,
} from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import UserAvatar from '../../components/ui/UserAvatar'
import { expertApi } from '../../services/api'
import { isMentorCallQuestion, MENTOR_CALL_DURATION_MINUTES } from '../../constants'

function formatMoney(amount) {
  return `₹${(amount || 0) / 100}`
}

export default function ExpertQuestionDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [slotLabel, setSlotLabel] = useState('')
  const [slots, setSlots] = useState([])
  const [timelineNote, setTimelineNote] = useState('')

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

  const availabilityMutation = useMutation({
    mutationFn: () =>
      expertApi.submitCallAvailability(id, {
        slots,
        timelineNote,
      }),
    onSuccess: () => {
      toast.success('Availability submitted to admin')
      queryClient.invalidateQueries({ queryKey: ['expert-question', id] })
      queryClient.invalidateQueries({ queryKey: ['expert-questions'] })
      setSlots([])
      setTimelineNote('')
      setSlotLabel('')
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 lg:h-[calc(100dvh-8rem)]">
        <div className="h-11 animate-pulse rounded-xl bg-card" />
        <div className="grid flex-1 gap-3 lg:min-h-0 lg:grid-cols-2 lg:gap-4">
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-card lg:h-auto" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-card lg:h-auto" />
        </div>
      </div>
    )
  }

  const { question, answer } = data || {}
  const mentorCall = isMentorCallQuestion(question)
  const canSubmit = !mentorCall && ['assigned', 'in_progress'].includes(question?.status)
  const canProvideAvailability =
    mentorCall &&
    ['assigned', 'in_progress'].includes(question?.status) &&
    question?.meetingStatus !== 'scheduled' &&
    question?.meetingStatus !== 'completed'
  const answerPending = answer?.status === 'pending_review'
  const answerRejected = answer?.status === 'rejected'
  const answerApproved = answer?.status === 'approved' || question?.status === 'completed'
  const attachments = question?.attachments || []
  const user = question?.user || {}
  const showStart = question?.status === 'assigned'

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addSlot = () => {
    const label = slotLabel.trim()
    if (!label) return toast.error('Enter an available date/time')
    setSlots((prev) => [...prev, { label }])
    setSlotLabel('')
  }

  return (
    <div className="flex flex-col gap-3 pb-4 lg:h-[calc(100dvh-8rem)] lg:max-h-[calc(100dvh-8rem)] lg:overflow-hidden lg:pb-0">
      {/* Top bar */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Link
          to={question?.status === 'completed' ? '/expert/history' : '/expert/questions'}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          {question?.status === 'completed' ? 'Back to history' : 'Back to questions'}
        </Link>

        {showStart && (
          <button
            type="button"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-fg shadow-sm transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-5 sm:py-2.5"
          >
            <Play size={15} fill="currentColor" />
            {startMutation.isPending ? 'Starting…' : 'Start working on this question'}
          </button>
        )}
      </div>

      {/* Stacked on mobile · side-by-side on desktop */}
      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:gap-4">
        {/* Panel 1 — Question */}
        <section className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-luxury-sm)] lg:min-h-0 lg:h-full">
          <div className="shrink-0 border-b border-border bg-gradient-to-br from-sky-500/8 via-transparent to-violet-500/5 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <FileText size={12} />
                  Question details
                </p>
                <h1 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-ink sm:truncate sm:text-xl">
                  {question?.title}
                </h1>
              </div>
              <StatusBadge status={question?.status} />
            </div>

            <div className="mt-3 flex items-center gap-3">
              <UserAvatar src={user.avatar} name={user.name} size="md" rounded="xl" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{user.name || 'User'}</p>
                <p className="truncate text-xs text-muted">{user.email || '—'}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {question?.category?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1 text-xs font-medium text-muted">
                  <FolderOpen size={12} />
                  {question.category.name}
                </span>
              )}
              {question?.deadline && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1 text-xs font-medium text-muted">
                  <Calendar size={12} />
                  Due {new Date(question.deadline).toLocaleDateString('en-IN')}
                </span>
              )}
              {question?.plan && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1 text-xs font-medium capitalize text-muted">
                  <CreditCard size={12} />
                  {question.plan} · {formatMoney(question.amount)}
                </span>
              )}
              {mentorCall && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600">
                  Mentor Call · {question?.meetingDurationMinutes || MENTOR_CALL_DURATION_MINUTES} min
                </span>
              )}
              {user.name && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 py-1 text-xs font-medium text-muted">
                  <User2 size={12} />
                  From {user.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto p-4 sm:p-5 lg:min-h-0 lg:flex-1">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Question
              </h2>
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface/60 p-3.5 sm:max-h-56 lg:max-h-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85 sm:text-[15px]">
                  {question?.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Attachments
              </h2>
              {attachments.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {attachments.map((a) => (
                    <li key={a.url || a.name}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-medium text-ink transition hover:border-sky-500/30 hover:bg-sky-500/5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                          <Paperclip size={15} />
                        </span>
                        <span className="min-w-0 truncate">{a.name || 'Attachment'}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted">
                  No files attached to this question.
                </p>
              )}
            </div>

            {(question?.links || []).length > 0 && (
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Links
                </h2>
                <ul className="mt-2 space-y-2">
                  {question.links.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-medium text-ink transition hover:border-sky-500/30 hover:bg-sky-500/5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                          <Link2 size={15} />
                        </span>
                        <span className="min-w-0 truncate">{url}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Panel 2 — Answer or Mentor Call availability */}
        <section className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-luxury-sm)] lg:min-h-0 lg:h-full">
          {mentorCall ? (
            <>
              <div className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <Calendar size={12} />
                  Mentor Call request
                </p>
                <h2 className="mt-1.5 text-base font-bold tracking-tight text-ink sm:text-lg">
                  Provide availability
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Duration: {question?.meetingDurationMinutes || MENTOR_CALL_DURATION_MINUTES} minutes.
                  Share possible dates/times — admin will finalize the meeting.
                </p>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-5 lg:min-h-0">
                {question?.mentorRequestStatus === 'responded' ? (
                  <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-700 dark:text-emerald-200">
                    Availability submitted. Waiting for admin to schedule the meeting.
                    {(question.mentorAvailability?.slots || []).length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs">
                        {question.mentorAvailability.slots.map((s, i) => (
                          <li key={i}>• {s.label || [s.date, s.time].filter(Boolean).join(' – ')}</li>
                        ))}
                      </ul>
                    )}
                    {question.mentorAvailability?.timelineNote ? (
                      <p className="mt-2 text-xs">{question.mentorAvailability.timelineNote}</p>
                    ) : null}
                  </div>
                ) : null}

                {question?.meetingStatus === 'scheduled' || question?.meetingStatus === 'completed' ? (
                  <div className="rounded-xl border border-border bg-surface/50 p-4 text-sm">
                    <p className="font-semibold text-ink">
                      Meeting {question.meetingStatus === 'completed' ? 'completed' : 'scheduled'}
                    </p>
                    <p className="mt-2 text-muted">
                      {question.meetingDate
                        ? new Date(question.meetingDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '—'}{' '}
                      · {question.meetingTime || '—'}
                    </p>
                    {question.meetingLink ? (
                      <a
                        href={question.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sky-600 hover:underline"
                      >
                        Open meeting link
                      </a>
                    ) : null}
                  </div>
                ) : canProvideAvailability ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-ink">Add available time</label>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={slotLabel}
                          onChange={(e) => setSlotLabel(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSlot())}
                          placeholder="e.g. 12 September – 4:00 PM"
                          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-sm"
                        />
                        <button
                          type="button"
                          onClick={addSlot}
                          className="rounded-xl border border-border bg-card px-4 text-sm font-semibold"
                        >
                          Add
                        </button>
                      </div>
                      {slots.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {slots.map((s, i) => (
                            <li
                              key={`${s.label}-${i}`}
                              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                            >
                              <span>{s.label}</span>
                              <button
                                type="button"
                                onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== i))}
                                className="text-muted hover:text-ink"
                              >
                                <X size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink">
                        Timeline note (optional)
                      </label>
                      <textarea
                        value={timelineNote}
                        onChange={(e) => setTimelineNote(e.target.value)}
                        placeholder="Or describe your general availability…"
                        className="mt-2 min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => availabilityMutation.mutate()}
                      disabled={
                        availabilityMutation.isPending || (!slots.length && !timelineNote.trim())
                      }
                      className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {availabilityMutation.isPending ? 'Submitting…' : 'Submit availability'}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted">This Mentor Call is no longer open for availability.</p>
                )}
              </div>
            </>
          ) : (
            <>
          <div className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <PenLine size={12} />
              Your answer
            </p>
            <h2 className="mt-1.5 text-base font-bold tracking-tight text-ink sm:text-lg">
              {answerApproved ? 'Submitted answer' : 'Submit your answer'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {answerApproved
                ? 'This answer was approved and delivered to the user.'
                : 'Provide a detailed, professional response for the user.'}
            </p>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-5 lg:min-h-0">
            {answerPending && (
              <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3.5 text-sm text-amber-700 dark:text-amber-200">
                Your answer is pending admin review. You will be notified once it is approved.
              </p>
            )}

            {answerRejected && (
              <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-700 dark:text-rose-300">
                Revision needed: {answer.rejectionReason}
              </p>
            )}

            {canSubmit && !answerPending ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] w-full flex-1 resize-y rounded-xl border border-border bg-surface/40 px-4 py-3.5 text-[15px] leading-relaxed text-ink placeholder:text-muted-light shadow-[var(--shadow-luxury-sm)] transition focus:border-sky-500/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-sky-500/15 lg:min-h-[180px] lg:resize-none"
                placeholder="Write your professional answer here…"
              />
            ) : answer?.content && (answerPending || answerApproved) ? (
              <div className="mt-0 rounded-xl border border-border bg-surface/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {answerApproved ? 'Delivered answer' : 'Submitted answer'}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                  {answer.content}
                </p>
              </div>
            ) : !answerPending && !answerRejected ? (
              <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
                <PenLine className="text-muted" size={28} />
                <p className="mt-3 text-sm font-semibold text-ink">Answer workspace locked</p>
                <p className="mt-1 max-w-xs text-xs text-muted">
                  {question?.status === 'assigned'
                    ? 'Start working on this question to unlock the answer editor.'
                    : 'This question is no longer open for answers.'}
                </p>
              </div>
            ) : null}
          </div>

          {canSubmit && !answerPending && (
            <div className="sticky bottom-0 shrink-0 space-y-3 border-t border-border bg-card/95 px-4 py-4 backdrop-blur sm:px-5">
              <div>
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas sm:w-auto sm:justify-start">
                  <Paperclip size={15} className="text-muted" />
                  Attach answer files
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-muted"
                      >
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="rounded p-0.5 text-muted hover:bg-card hover:text-ink"
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
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(14,165,233,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
