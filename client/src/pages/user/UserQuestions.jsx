import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MessageSquarePlus,
  Trash2,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import QuestionDetailModal from '../../components/questions/QuestionDetailModal'
import { userApi } from '../../services/api'
import { PLANS, QUESTION_STATUS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'
import { formatRupee } from '../../utils/currency'
import { payForQuestion } from '../../utils/payForQuestion'

const STATUS_TONE = {
  pending_payment: 'border-amber-400/40 bg-amber-400/10 text-amber-500',
  pending_admin_review: 'border-amber-400/40 bg-amber-400/10 text-amber-500',
  assigned: 'border-sky-400/40 bg-sky-400/10 text-sky-500',
  in_progress: 'border-violet-400/40 bg-violet-400/10 text-violet-500',
  waiting_admin_review: 'border-amber-400/40 bg-amber-400/10 text-amber-500',
  completed: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-500',
  rejected: 'border-rose-400/40 bg-rose-400/10 text-rose-500',
  cancelled: 'border-border bg-surface text-muted',
}

const STATUS_DOT = {
  pending_payment: 'bg-amber-400',
  pending_admin_review: 'bg-amber-400',
  assigned: 'bg-sky-400',
  in_progress: 'bg-violet-500',
  waiting_admin_review: 'bg-amber-400',
  completed: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  cancelled: 'bg-muted',
}

function previewText(text, words = 12) {
  const parts = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  if (!parts.length) return ''
  const slice = parts.slice(0, words)
  return slice.length < parts.length ? `${slice.join(' ')}…` : slice.join(' ')
}

function QuestionCard({ question, index, onOpen, onPay, onDelete, payingId, deletingId }) {
  const statusLabel = QUESTION_STATUS[question.status] || question.status
  const tone = STATUS_TONE[question.status] || STATUS_TONE.cancelled
  const dotColor = STATUS_DOT[question.status] || 'bg-muted'
  const planName = PLANS[question.plan]?.name
  const needsPayment = question.status === 'pending_payment'
  const amountPaise = question.amount || PLANS[question.plan]?.pricePaise || 0
  const isPaying = payingId === question._id
  const isDeleting = deletingId === question._id
  const isAnswered = question.answered || question.status === 'completed'
  const questionSnippet = previewText(question.description || question.title, 12)
  const answerSnippet = question.answerPreview || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="h-full"
    >
      <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5">


        <button
          type="button"
          onClick={() => onOpen(question._id)}
          className="flex flex-1 flex-col p-4 text-left"
        >
          {/* Header row: Q badge + status badge */}
          <div className="flex items-start justify-between gap-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isAnswered
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm'
              }`}
              aria-label={isAnswered ? 'Answered' : 'Pending answer'}
            >
              {isAnswered ? (
                <Check size={15} strokeWidth={2.5} />
              ) : (
                <span className="text-xs font-bold leading-none">Q</span>
              )}
            </span>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${tone}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
              {statusLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 line-clamp-1 text-[14px] font-bold leading-snug tracking-tight text-ink">
            {question.title}
          </h3>

          {/* Snippet */}
          {questionSnippet ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
              {questionSnippet}
            </p>
          ) : null}

          {/* Tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
            {question.category?.name ? (
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 font-semibold text-muted">
                {question.category.name}
              </span>
            ) : null}
            {question.expertType?.name ? (
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 font-semibold text-muted">
                {question.expertType.name}
              </span>
            ) : null}
            {planName ? (
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 font-semibold text-muted">
                {planName}
              </span>
            ) : null}
            {question.createdAt ? (
              <span className="inline-flex items-center gap-1 text-muted-light">
                <Clock size={9} />
                {formatDistanceToNow(question.createdAt)}
              </span>
            ) : null}
          </div>

          {/* Status message box */}
          {isAnswered && answerSnippet ? (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-600">
                Answer Preview
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-ink">
                "{answerSnippet}"
              </p>
            </div>
          ) : (
            <div className={`mt-3 rounded-xl border px-3 py-2.5 ${
              needsPayment
                ? 'border-amber-400/20 bg-amber-400/5'
                : 'border-border/60 bg-surface/50'
            }`}>
              <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
                {needsPayment
                  ? '⚡ Payment pending — complete checkout to continue.'
                  : question.assignedExpert?.name
                    ? `Assigned to ${question.assignedExpert.name}. Waiting for answer.`
                    : 'Waiting for mentor assignment and answer.'}
              </p>
            </div>
          )}
        </button>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-surface/30 px-4 py-3">
          <span className="min-w-0 truncate text-[11px] font-semibold text-muted">
            {needsPayment
              ? `💳 Due ${formatRupee(amountPaise)}`
              : question.assignedExpert?.name
                ? `👤 ${question.assignedExpert.name}`
                : isAnswered
                  ? '✅ Answer delivered'
                  : '⏳ Awaiting mentor'}
          </span>
          {needsPayment ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isDeleting || isPaying}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(question)
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted transition hover:bg-surface hover:text-ink disabled:opacity-60"
                aria-label="Delete question"
              >
                {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                Delete
              </button>
              <button
                type="button"
                disabled={isPaying || isDeleting}
                onClick={(e) => {
                  e.stopPropagation()
                  onPay(question)
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              >
                {isPaying ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    Paying…
                  </>
                ) : (
                  <>
                    <CreditCard size={11} />
                    Pay now
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpen(question._id)}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-[11px] font-bold text-transparent transition hover:gap-1.5"
              style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Open
              <ArrowRight size={12} className="text-indigo-500" />
            </button>
          )}
        </div>
      </article>
    </motion.div>
  )
}

export default function UserQuestions() {
  const queryClient = useQueryClient()
  const [openId, setOpenId] = useState(null)
  const [payingId, setPayingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['my-questions'],
    queryFn: () => userApi.getQuestions({ limit: 50 }),
  })

  const questions = data?.questions || []

  const stats = useMemo(() => {
    const completed = questions.filter((q) => q.status === 'completed').length
    const active = questions.filter((q) =>
      ['assigned', 'in_progress', 'waiting_admin_review', 'pending_admin_review'].includes(q.status)
    ).length
    return { total: questions.length, completed, active }
  }, [questions])

  const handlePay = async (question) => {
    if (payingId || deletingId) return
    setPayingId(question._id)
    try {
      await payForQuestion(question)
      toast.success('Payment successful! Your question is moving forward.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-questions'] }),
        queryClient.invalidateQueries({ queryKey: ['sidebar-questions'] }),
        queryClient.invalidateQueries({ queryKey: ['question', question._id] }),
      ])
      setOpenId(question._id)
    } catch (err) {
      if (err?.message !== 'Payment cancelled') {
        toast.error(err.message || 'Payment failed')
      }
    } finally {
      setPayingId(null)
    }
  }

  const handleDelete = async (question) => {
    if (payingId || deletingId) return
    const ok = window.confirm('Delete this unpaid question? This cannot be undone.')
    if (!ok) return
    setDeletingId(question._id)
    try {
      await userApi.deleteQuestion(question._id)
      toast.success('Question deleted')
      if (openId === question._id) setOpenId(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-questions'] }),
        queryClient.invalidateQueries({ queryKey: ['sidebar-questions'] }),
      ])
    } catch (err) {
      toast.error(err.message || 'Could not delete question')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 lg:py-10"
      >
        {/* ── Page Header ── */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Your workspace
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                My Questions
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Track all your questions and answers.
            </p>
          </div>

          {/* Stats + CTA */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
              <Sparkles size={13} className="text-indigo-400" />
              <span className="text-xs font-bold text-ink">{stats.total} Total</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
              <TrendingUp size={13} className="text-blue-400" />
              <span className="text-xs font-bold text-ink">{stats.active} Active</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-xs font-bold text-ink">{stats.completed} Completed</span>
            </div>
            <Link
              to="/dashboard/ask"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <MessageSquarePlus size={15} />
              Ask Question
            </Link>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="mt-8">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-blue-600/30 to-purple-600/30" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-xl bg-card" />
                        <div className="h-5 w-24 rounded-full bg-card" />
                      </div>
                      <div className="h-4 w-3/4 rounded-lg bg-card" />
                      <div className="h-3 w-full rounded-lg bg-card" />
                      <div className="h-3 w-2/3 rounded-lg bg-card" />
                      <div className="flex gap-1.5">
                        <div className="h-5 w-16 rounded-lg bg-card" />
                        <div className="h-5 w-14 rounded-lg bg-card" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 ring-1 ring-border">
                <AlertCircle size={26} className="text-indigo-400" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-ink">No questions yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Ask your first question and get guidance from verified mentors.
              </p>
              <Link
                to="/dashboard/ask"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
              >
                <MessageSquarePlus size={15} />
                Ask your first question
              </Link>
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
              {/* Section Header */}
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <p className="text-sm font-bold text-ink">All questions</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {questions.length} in your workspace
                  </p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                  Sorted by latest
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {questions.map((q, index) => (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    index={index}
                    onOpen={setOpenId}
                    onPay={handlePay}
                    onDelete={handleDelete}
                    payingId={payingId}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>

      <QuestionDetailModal
        open={!!openId}
        questionId={openId}
        onClose={() => setOpenId(null)}
      />
    </DashboardLayout>
  )
}
