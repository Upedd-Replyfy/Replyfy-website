import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Bookmark,
  Briefcase,
  ChevronRight,
  Clock,
  Download,
  FileText,
  FolderTree,
  GraduationCap,
  Paperclip,
  ScrollText,
  Star,
  Trophy,
  User2,
  X,
} from 'lucide-react'
import { catalogApi, userApi } from '../../services/api'
import StatusBadge from '../ui/StatusBadge'
import { QUESTION_STATUS, PLANS } from '../../constants'
import { isQuestionSaved, toggleSavedQuestion } from '../../utils/savedAnswers'

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

function formatWhen(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AttachmentList({ files = [] }) {
  if (!files.length) return <p className="text-sm text-muted">No attachments</p>

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file._id || file.url}>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm text-ink transition hover:border-emerald-500/35 hover:bg-surface"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              {file.type === 'image' ? <FileText size={16} /> : <Paperclip size={16} />}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{file.name || 'Attachment'}</span>
            <Download size={14} className="shrink-0 text-muted" />
          </a>
        </li>
      ))}
    </ul>
  )
}

function Timeline({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-muted">No timeline events yet.</p>
  }

  return (
    <ol className="question-timeline">
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="question-timeline-item"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <span className="question-timeline-dot" aria-hidden />
          <p className="text-sm font-semibold text-ink">{item.label}</p>
          {item.detail ? <p className="mt-0.5 text-xs text-muted">{item.detail}</p> : null}
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400/90">
            <Clock size={11} />
            {formatWhen(item.at)}
          </p>
        </li>
      ))}
    </ol>
  )
}

function MentorChip({ mentor, categoryName, typeName, active, onClick }) {
  if (!mentor?.name) return null
  const photo = mentor.avatar || mentor.profilePhoto
  const initial = mentor.name.charAt(0).toUpperCase()

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex max-w-[240px] items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition sm:max-w-[280px] ${
        active
          ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
          : 'border-border bg-surface hover:border-emerald-500/30 hover:bg-emerald-500/5'
      }`}
      title="View mentor profile"
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-border"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-base font-bold text-emerald-400">
          {initial}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400/90">
          Mentor
        </p>
        <p className="truncate text-sm font-semibold text-ink">{mentor.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {[typeName, categoryName].filter(Boolean).join(' · ') || mentor.email || 'View profile'}
        </p>
      </div>
      <ChevronRight size={16} className={`shrink-0 ${active ? 'text-emerald-400' : 'text-muted'}`} />
    </button>
  )
}

function MentorSidePanel({ mentorId, fallback, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['mentor-profile', mentorId],
    queryFn: () => catalogApi.getExpert(mentorId),
    enabled: !!mentorId,
  })

  const expert = data?.expert
  const ratingList = data?.ratings || []
  const rating = Number(expert?.averageRating) || 0
  const reviews = expert?.totalRatings || expert?.reviewCount || 0
  const photo = expert?.profilePhoto || expert?.avatar || fallback?.avatar
  const name = expert?.name || fallback?.name || 'Mentor'
  const bio =
    expert?.bio?.trim() ||
    'Experienced mentor ready to help with practical, situation-specific guidance.'
  const education = expert?.education || []
  const certificates = expert?.certificates || []
  const achievements = expert?.achievements || []
  const categories = [
    ...(expert?.categories || []).map((c) => c?.name).filter(Boolean),
    expert?.category?.name,
  ].filter(Boolean)
  const types = [
    ...(expert?.expertTypes || []).map((t) => t?.name).filter(Boolean),
    expert?.expertType?.name,
  ].filter(Boolean)
  const uniqueCats = [...new Set(categories)]
  const uniqueTypes = [...new Set(types)]

  return (
    <motion.aside
      role="dialog"
      aria-label="Mentor profile"
      initial={{ opacity: 0, x: 40, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 28, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex h-[min(90vh,720px)] w-full max-w-[380px] flex-col overflow-hidden rounded-t-[24px] border border-border bg-card shadow-2xl sm:rounded-[24px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="text-base font-semibold text-ink">Mentor profile</h3>
          <p className="mt-0.5 text-xs text-muted">Assigned to this question</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface hover:text-ink"
          aria-label="Close mentor profile"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-surface" />
            <div className="h-4 w-32 animate-pulse rounded bg-surface" />
            <div className="h-16 animate-pulse rounded-xl bg-surface" />
          </div>
        ) : isError && !fallback?.name ? (
          <p className="text-sm text-muted">Could not load mentor profile.</p>
        ) : (
          <>
            <div className="flex items-start gap-3">
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-border"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl font-bold text-emerald-400">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-ink">{name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-ink">
                    {rating ? rating.toFixed(1) : '—'}
                  </span>
                  <span>({reviews} reviews)</span>
                </div>
                {fallback?.email || expert?.email ? (
                  <p className="mt-1 truncate text-[11px] text-muted-light">
                    {fallback?.email || expert?.email}
                  </p>
                ) : null}
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">{bio}</p>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink">
              <p className="inline-flex items-center gap-2">
                <Briefcase size={14} className="text-emerald-400" />
                {expert?.experience?.trim() || '—'}
              </p>
              <p className="inline-flex items-center gap-2">
                <User2 size={14} className="text-emerald-400" />
                {(expert?.completedAnswers || 0).toLocaleString('en-IN')} sessions
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock size={14} className="text-emerald-400" />~
                {expert?.responseTime || 48}h avg response
              </p>
            </div>

            {(uniqueTypes.length > 0 || uniqueCats.length > 0) && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Focus
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[...uniqueTypes, ...uniqueCats].slice(0, 6).map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(expert?.skills || []).length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {expert.skills.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-4 border-t border-border pt-4">
              <section>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <GraduationCap size={12} className="text-emerald-400" />
                  Education
                </p>
                {education.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-light">No education listed</p>
                ) : (
                  <ul className="mt-2 space-y-2.5">
                    {education.map((item, i) => (
                      <li key={`edu-${i}`} className="rounded-xl border border-border bg-surface/60 px-3 py-2.5">
                        <p className="text-sm font-semibold text-ink">
                          {[item.degree, item.field].filter(Boolean).join(' · ') ||
                            item.school ||
                            'Education'}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {[item.school, item.year].filter(Boolean).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <ScrollText size={12} className="text-emerald-400" />
                  Certificates
                </p>
                {certificates.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-light">No certificates listed</p>
                ) : (
                  <ul className="mt-2 space-y-2.5">
                    {certificates.map((item, i) => (
                      <li key={`cert-${i}`} className="rounded-xl border border-border bg-surface/60 px-3 py-2.5">
                        <p className="text-sm font-semibold text-ink">
                          {item.title || 'Certificate'}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {[item.issuer, item.year].filter(Boolean).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <Trophy size={12} className="text-emerald-400" />
                  Achievements
                </p>
                {achievements.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-light">No achievements listed</p>
                ) : (
                  <ul className="mt-2 space-y-2.5">
                    {achievements.map((item, i) => (
                      <li key={`ach-${i}`} className="rounded-xl border border-border bg-surface/60 px-3 py-2.5">
                        <p className="text-sm font-semibold text-ink">
                          {item.title || 'Achievement'}
                        </p>
                        {(item.description || item.year) && (
                          <p className="mt-0.5 text-[12px] text-muted">
                            {[item.description, item.year].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <Star size={12} className="text-amber-400" />
                  Reviews
                  {reviews > 0 ? (
                    <span className="font-normal normal-case tracking-normal text-muted-light">
                      · {rating ? rating.toFixed(1) : '—'} avg · {reviews} total
                    </span>
                  ) : null}
                </p>
                {ratingList.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-light">No reviews yet</p>
                ) : (
                  <ul className="mt-2 space-y-2.5">
                    {ratingList.map((r) => (
                      <li
                        key={r._id}
                        className="rounded-xl border border-border bg-surface/60 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">
                            {r.user?.name || 'Student'}
                          </p>
                          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-ink">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {r.stars}
                          </span>
                        </div>
                        {r.comment?.trim() ? (
                          <p className="mt-1 text-[12px] leading-relaxed text-muted">{r.comment}</p>
                        ) : null}
                        {r.createdAt ? (
                          <p className="mt-1 text-[11px] text-muted-light">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </motion.aside>
  )
}

export default function QuestionDetailModal({ questionId, open, onClose }) {
  const queryClient = useQueryClient()
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(false)
  const [showMentor, setShowMentor] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => userApi.getQuestion(questionId),
    enabled: open && !!questionId,
  })

  useEffect(() => {
    if (!open || !questionId) return undefined
    setSaved(isQuestionSaved(questionId))
    setStars(5)
    setComment('')
    setShowMentor(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, questionId])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (showMentor) setShowMentor(false)
      else onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, showMentor, onClose])

  const ratingMutation = useMutation({
    mutationFn: () => userApi.submitRating({ questionId, stars, comment }),
    onSuccess: () => {
      toast.success('Thank you for your rating!')
      queryClient.invalidateQueries({ queryKey: ['question', questionId] })
    },
    onError: (err) => toast.error(err.message),
  })

  const question = data?.question
  const answer = data?.answer
  const answerMeta = data?.answerMeta
  const timeline = data?.timeline || []

  const allAttachments = useMemo(() => {
    const qFiles = question?.attachments || []
    const aFiles = answer?.attachments || []
    return [
      ...qFiles.map((f) => ({ ...f, source: 'Question' })),
      ...aFiles.map((f) => ({ ...f, source: 'Answer' })),
    ]
  }, [question, answer])

  const planName = question ? PLANS[question.plan]?.name || question.plan : ''
  const statusLabel = question ? QUESTION_STATUS[question.status] || question.status : ''
  const mentorUser = question?.assignedExpert || question?.selectedExpert
  const mentorId = mentorUser?._id || mentorUser

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Close question details"
            onClick={() => {
              setShowMentor(false)
              onClose?.()
            }}
          />

          <div className="relative z-10 flex w-full max-w-[min(100%,1120px)] flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-start sm:gap-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Question details"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[24px] border border-border bg-card shadow-2xl sm:max-h-[90vh] sm:rounded-[24px]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                {isLoading || !question ? (
                  <div className="h-6 w-48 animate-pulse rounded-lg bg-surface" />
                ) : (
                  <>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={question.status} />
                      <span className="text-xs text-muted">{statusLabel}</span>
                    </div>
                    <h2 className="truncate text-lg font-semibold tracking-tight text-ink sm:text-xl">
                      {question.title}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted">
                      {question.category?.name && (
                        <span className="inline-flex items-center gap-1">
                          <FolderTree size={11} />
                          {question.category.name}
                        </span>
                      )}
                      {question.expertType?.name && <span>{question.expertType.name}</span>}
                      {planName && <span className="capitalize">{planName}</span>}
                      <span>{formatWhen(question.createdAt)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <MentorChip
                  mentor={mentorUser}
                  categoryName={question?.category?.name}
                  typeName={question?.expertType?.name}
                  active={showMentor}
                  onClick={() => setShowMentor((v) => !v)}
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface hover:text-ink"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              {isLoading || !question ? (
                <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
                  <div className="h-48 animate-pulse rounded-2xl bg-surface" />
                  <div className="h-48 animate-pulse rounded-2xl bg-surface" />
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
                  <div className="space-y-4">
                    <section className="premium-surface flex max-h-[280px] flex-col overflow-hidden rounded-[18px] sm:max-h-[320px]">
                      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-5">
                          <h3 className="text-base font-semibold text-ink">Your question</h3>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                            {question.description}
                          </p>
                          {question.rejectionReason && (
                            <p className="mt-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                              Rejection reason: {question.rejectionReason}
                            </p>
                          )}
                          {(question.attachments || []).length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                                Question attachments
                              </p>
                              <AttachmentList files={question.attachments} />
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {answer ? (
                      <section className="premium-surface flex max-h-[320px] flex-col overflow-hidden rounded-[18px] sm:max-h-[380px]">
                        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
                          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
                            <div>
                              <h3 className="text-base font-semibold text-ink">Mentor answer</h3>
                              {answer.expert?.name && (
                                <p className="mt-0.5 text-xs text-muted">From {answer.expert.name}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const next = toggleSavedQuestion(question._id)
                                setSaved(next)
                                toast.success(next ? 'Answer saved' : 'Removed from saved')
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                                saved
                                  ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-400'
                                  : 'border-border text-muted hover:bg-surface hover:text-ink'
                              }`}
                            >
                              <Bookmark size={13} className={saved ? 'fill-current' : ''} />
                              {saved ? 'Saved' : 'Save'}
                            </button>
                          </div>
                          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                              {answer.content}
                            </p>
                            {(answer.attachments || []).length > 0 && (
                              <div className="mt-4">
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                                  Answer attachments
                                </p>
                                <AttachmentList files={answer.attachments} />
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    ) : (
                      <section className="rounded-[18px] border border-dashed border-border bg-card px-4 py-7 text-center">
                        <h3 className="text-sm font-semibold text-ink">Answer not ready yet</h3>
                        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted sm:text-sm">
                          {answerMeta?.status === 'pending_review'
                            ? 'Your mentor submitted an answer. Admin is reviewing it before delivery.'
                            : answerMeta?.status === 'rejected'
                              ? 'The answer needs revision from your mentor.'
                              : 'You’ll see the full mentor answer here once it’s approved and delivered.'}
                        </p>
                      </section>
                    )}

                    {question.status === 'completed' && !question.isRated && (
                      <section className="overflow-hidden rounded-[18px] border border-border bg-card">
                        <div className="border-b border-border bg-surface/80 px-4 py-3">
                          <h3 className="text-base font-semibold text-ink">Rate this mentor</h3>
                        </div>
                        <div className="space-y-4 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {[1, 2, 3, 4, 5].map((n) => {
                              const active = n <= stars
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setStars(n)}
                                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                                    active
                                      ? 'border-amber-400/50 bg-amber-400/15 text-amber-400'
                                      : 'border-border text-muted-light hover:border-amber-400/30'
                                  }`}
                                >
                                  <Star
                                    size={18}
                                    className={active ? 'fill-amber-400 text-amber-400' : 'fill-none'}
                                  />
                                </button>
                              )
                            })}
                            <span className="text-sm text-ink">
                              {stars} / 5 · {RATING_LABELS[stars]}
                            </span>
                          </div>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Optional comment"
                            rows={3}
                            className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted-light focus:border-emerald-500/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                          />
                          <button
                            type="button"
                            onClick={() => ratingMutation.mutate()}
                            disabled={ratingMutation.isPending}
                            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                          >
                            {ratingMutation.isPending ? 'Submitting...' : 'Submit rating'}
                          </button>
                        </div>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <section className="premium-surface flex max-h-[260px] flex-col overflow-hidden rounded-[18px] sm:max-h-[320px]">
                      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-5">
                          <h3 className="text-base font-semibold text-ink">Timeline</h3>
                          <p className="mt-1 text-xs text-muted">Status updates for this question</p>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
                          <Timeline items={timeline} />
                        </div>
                      </div>
                    </section>

                    <section className="premium-surface flex max-h-[220px] flex-col overflow-hidden rounded-[18px]">
                      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-5">
                          <h3 className="text-base font-semibold text-ink">All attachments</h3>
                          <p className="mt-1 text-xs text-muted">
                            {allAttachments.length
                              ? `${allAttachments.length} file${allAttachments.length === 1 ? '' : 's'}`
                              : 'Question and answer files'}
                          </p>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
                          {allAttachments.length === 0 ? (
                            <p className="text-sm text-muted">No attachments uploaded yet.</p>
                          ) : (
                            <ul className="space-y-2">
                              {allAttachments.map((file) => (
                                <li key={`${file.source}-${file._id || file.url}`}>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm text-ink transition hover:border-emerald-500/35"
                                  >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                                      <Paperclip size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate font-medium">
                                        {file.name || 'Attachment'}
                                      </span>
                                      <span className="text-[10px] uppercase tracking-wide text-muted-light">
                                        {file.source}
                                      </span>
                                    </span>
                                    <Download size={14} className="shrink-0 text-muted" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </section>
                  </aside>
                </div>
              )}
            </div>
            </motion.div>

            <AnimatePresence>
              {showMentor && mentorId ? (
                <MentorSidePanel
                  mentorId={mentorId}
                  fallback={mentorUser}
                  onClose={() => setShowMentor(false)}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
