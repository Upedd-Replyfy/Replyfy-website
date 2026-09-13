import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Bookmark,
  Briefcase,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  FolderTree,
  GraduationCap,
  Loader2,
  Paperclip,
  Link2,
  ScrollText,
  Star,
  Trash2,
  Trophy,
  User2,
  Video,
  X,
} from 'lucide-react'
import { catalogApi, userApi } from '../../services/api'
import StatusBadge from '../ui/StatusBadge'
import {
  QUESTION_STATUS,
  planDisplayName,
  resolvePlan,
  isMentorCallQuestion,
  MENTOR_CALL_DURATION_MINUTES,
} from '../../constants'
import { usePlans } from '../../hooks/useCatalog'
import { isQuestionSaved, toggleSavedQuestion } from '../../utils/savedAnswers'
import { payForQuestion } from '../../utils/payForQuestion'
import { formatRupee } from '../../utils/currency'

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
  const visibility = {
    bio: expert?.profileVisibility?.bio !== false,
    experience: expert?.profileVisibility?.experience !== false,
    skills: expert?.profileVisibility?.skills !== false,
    education: expert?.profileVisibility?.education !== false,
    certificates: expert?.profileVisibility?.certificates !== false,
    achievements: expert?.profileVisibility?.achievements !== false,
    reviews: expert?.profileVisibility?.reviews !== false,
  }
  const ratingList = visibility.reviews ? data?.ratings || [] : []
  const rating = Number(expert?.averageRating) || 0
  const reviews = expert?.totalRatings || expert?.reviewCount || 0
  const photo = expert?.profilePhoto || expert?.avatar || fallback?.avatar
  const name = expert?.name || fallback?.name || 'Mentor'
  const bio =
    expert?.bio?.trim() ||
    'Experienced mentor ready to help with practical, situation-specific guidance.'
  const education = visibility.education ? expert?.education || [] : []
  const certificates = visibility.certificates ? expert?.certificates || [] : []
  const achievements = visibility.achievements ? expert?.achievements || [] : []
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
                {visibility.reviews ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-ink">
                      {rating ? rating.toFixed(1) : '—'}
                    </span>
                    <span>({reviews} reviews)</span>
                  </div>
                ) : null}
                {fallback?.email || expert?.email ? (
                  <p className="mt-1 truncate text-[11px] text-muted-light">
                    {fallback?.email || expert?.email}
                  </p>
                ) : null}
              </div>
            </div>

            {visibility.bio ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">{bio}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink">
              {visibility.experience ? (
                <p className="inline-flex items-center gap-2">
                  <Briefcase size={14} className="text-emerald-400" />
                  {expert?.experience?.trim() || '—'}
                </p>
              ) : null}
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

            {visibility.skills && (expert?.skills || []).length > 0 && (
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

            {(visibility.education ||
              visibility.certificates ||
              visibility.achievements ||
              visibility.reviews) && (
            <div className="mt-5 space-y-4 border-t border-border pt-4">
              <section className={visibility.education ? '' : 'hidden'}>
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

              <section className={visibility.certificates ? '' : 'hidden'}>
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

              <section className={visibility.achievements ? '' : 'hidden'}>
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

              <section className={visibility.reviews ? '' : 'hidden'}>
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
            )}
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
  const [paying, setPaying] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { data: plans } = usePlans()

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
    setPaying(false)
    setDeleting(false)
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
  const needsPayment = question?.status === 'pending_payment'
  const amountPaise =
    question?.amount || resolvePlan(question?.plan, plans)?.pricePaise || 0

  const handlePay = async () => {
    if (!question || paying || deleting) return
    setPaying(true)
    try {
      await payForQuestion(question)
      toast.success('Payment successful! Your question is moving forward.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['question', questionId] }),
        queryClient.invalidateQueries({ queryKey: ['my-questions'] }),
        queryClient.invalidateQueries({ queryKey: ['sidebar-questions'] }),
      ])
    } catch (err) {
      if (err?.message !== 'Payment cancelled') {
        toast.error(err.message || 'Payment failed')
      }
    } finally {
      setPaying(false)
    }
  }

  const handleDelete = async () => {
    if (!question || paying || deleting) return
    const ok = window.confirm('Delete this unpaid question? This cannot be undone.')
    if (!ok) return
    setDeleting(true)
    try {
      await userApi.deleteQuestion(question._id)
      toast.success('Question deleted')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-questions'] }),
        queryClient.invalidateQueries({ queryKey: ['sidebar-questions'] }),
      ])
      onClose?.()
    } catch (err) {
      toast.error(err.message || 'Could not delete question')
    } finally {
      setDeleting(false)
    }
  }

  const allAttachments = useMemo(() => {
    const qFiles = question?.attachments || []
    const aFiles = answer?.attachments || []
    return [
      ...qFiles.map((f) => ({ ...f, source: 'Question' })),
      ...aFiles.map((f) => ({ ...f, source: 'Answer' })),
    ]
  }, [question, answer])

  const planName = question ? planDisplayName(question.plan, plans) : ''
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
                    {needsPayment && (
                      <section className="overflow-hidden rounded-[18px] border border-amber-500/30 bg-amber-500/10 px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-300">
                              <CreditCard size={15} />
                              Payment pending
                            </p>
                            <p className="mt-1 text-xs text-muted sm:text-sm">
                              Complete payment to submit this question for mentor matching.
                            </p>
                            <p className="mt-2 text-lg font-bold text-ink">
                              {formatRupee(amountPaise)}
                              {planName ? (
                                <span className="ml-2 text-xs font-medium text-muted">
                                  · {planName}
                                </span>
                              ) : null}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleDelete}
                              disabled={paying || deleting}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/15 disabled:opacity-60"
                            >
                              {deleting ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={handlePay}
                              disabled={paying || deleting}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-card transition hover:bg-ink/90 disabled:opacity-60"
                            >
                              {paying ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Processing…
                                </>
                              ) : (
                                <>
                                  <CreditCard size={16} />
                                  Pay {formatRupee(amountPaise)}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </section>
                    )}

                    <section className="flex max-h-[280px] flex-col overflow-hidden rounded-[18px] border border-border bg-card sm:max-h-[320px]">
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
                          {(question.links || []).length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                                Links
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {question.links.map((url) => (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:underline"
                                  >
                                    <Link2 size={13} />
                                    <span className="truncate">{url}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {isMentorCallQuestion(question) ? (
                      <section className="rounded-[18px] border border-sky-500/25 bg-sky-500/5 px-4 py-4 sm:px-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-500">
                          {question.meetingStatus === 'scheduled'
                            ? 'Upcoming Mentor Call'
                            : question.meetingStatus === 'completed'
                              ? 'Mentor Call Completed'
                              : 'Mentor Call Request'}
                        </p>
                        <dl className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between gap-3">
                            <dt className="text-muted">Mentor</dt>
                            <dd className="font-semibold text-ink">
                              {question.assignedExpert?.name ||
                                question.selectedExpert?.name ||
                                'To be assigned'}
                            </dd>
                          </div>
                          {question.meetingStatus === 'scheduled' ||
                          question.meetingStatus === 'completed' ? (
                            <>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted">Date</dt>
                                <dd className="font-semibold text-ink">
                                  {question.meetingDate
                                    ? new Date(question.meetingDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted">Time</dt>
                                <dd className="font-semibold text-ink">
                                  {question.meetingTime || '—'}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted">Duration</dt>
                                <dd className="font-semibold text-ink">
                                  {question.meetingDurationMinutes || MENTOR_CALL_DURATION_MINUTES}{' '}
                                  minutes
                                </dd>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-muted">
                              {question.adminApprovalStatus === 'rejected'
                                ? 'This request was rejected.'
                                : question.adminApprovalStatus === 'pending' ||
                                    question.status === 'pending_admin_review'
                                  ? 'Pending admin approval. You will receive meeting details by email once scheduled.'
                                  : 'Our team is coordinating with your mentor. Meeting details will appear here once scheduled.'}
                            </p>
                          )}
                        </dl>
                        {question.meetingStatus === 'scheduled' && question.meetingLink ? (
                          <a
                            href={question.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-card transition hover:opacity-90 sm:w-auto"
                          >
                            <Video size={16} />
                            Join Meeting
                          </a>
                        ) : null}
                      </section>
                    ) : null}

                    {answer ? (
                      <section className="flex max-h-[320px] flex-col overflow-hidden rounded-[18px] border border-border bg-card sm:max-h-[380px]">
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
                        <h3 className="text-sm font-semibold text-ink">
                          {needsPayment ? 'Waiting on payment' : 'Answer not ready yet'}
                        </h3>
                        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted sm:text-sm">
                          {needsPayment
                            ? 'Pay now to send this question for admin review and mentor matching.'
                            : answerMeta?.status === 'pending_review'
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
                            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-card transition hover:bg-ink/90 disabled:opacity-50"
                          >
                            {ratingMutation.isPending ? 'Submitting...' : 'Submit rating'}
                          </button>
                        </div>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <section className="flex max-h-[260px] flex-col overflow-hidden rounded-[18px] border border-border bg-card sm:max-h-[320px]">
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

                    <section className="flex max-h-[220px] flex-col overflow-hidden rounded-[18px] border border-border bg-card">
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

            {needsPayment ? (
              <div className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={paying || deleting}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/15 disabled:opacity-60 sm:w-auto"
                  >
                    {deleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete question
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={paying || deleting}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-card transition hover:bg-ink/90 disabled:opacity-60"
                  >
                    {paying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing payment…
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Pay {formatRupee(amountPaise)} to continue
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
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
