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
  HelpCircle,
  Loader2,
  MessageSquarePlus,
  Trash2,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import QuestionDetailModal from '../../components/questions/QuestionDetailModal'
import { userApi } from '../../services/api'
import { PLANS, QUESTION_STATUS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'
import { formatRupee } from '../../utils/currency'
import { payForQuestion } from '../../utils/payForQuestion'

const STATUS_TONE = {
  pending_payment: 'border-amber-200 bg-amber-50 text-amber-700',
  pending_admin_review: 'border-sky-200 bg-sky-50 text-sky-700',
  assigned: 'border-slate-200 bg-slate-100 text-slate-700',
  in_progress: 'border-violet-200 bg-violet-50 text-violet-700',
  waiting_admin_review: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  cancelled: 'border-border bg-surface text-muted',
}

function previewText(text, words = 10) {
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
  const planName = PLANS[question.plan]?.name
  const needsPayment = question.status === 'pending_payment'
  const amountPaise = question.amount || PLANS[question.plan]?.pricePaise || 0
  const isPaying = payingId === question._id
  const isDeleting = deletingId === question._id
  const isAnswered = question.answered || question.status === 'completed'
  const questionSnippet = previewText(question.description || question.title, 10)
  const answerSnippet = question.answerPreview || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.15) }}
      whileHover={{ y: -1 }}
    >
      <article className="group flex h-full w-full flex-col rounded-xl border border-border bg-card p-3 transition hover:border-ink/20">
        <button
          type="button"
          onClick={() => onOpen(question._id)}
          className="flex flex-1 flex-col text-left"
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                isAnswered
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-border bg-surface text-ink'
              }`}
              aria-label={isAnswered ? 'Answered' : 'Pending answer'}
            >
              {isAnswered ? <Check size={14} strokeWidth={2.5} /> : <HelpCircle size={14} />}
            </span>
            <span
              className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}
            >
              {statusLabel}
            </span>
          </div>

          <h3 className="mt-2.5 line-clamp-1 text-[13px] font-semibold leading-snug tracking-tight text-ink">
            {question.title}
          </h3>

          {questionSnippet ? (
            <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-muted">
              {questionSnippet}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted">
            {question.category?.name ? (
              <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-medium">
                {question.category.name}
              </span>
            ) : null}
            {question.expertType?.name ? (
              <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-medium">
                {question.expertType.name}
              </span>
            ) : null}
            {planName ? (
              <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-medium">
                {planName}
              </span>
            ) : null}
            {question.createdAt ? (
              <span className="inline-flex items-center gap-0.5 text-muted-light">
                <Clock size={10} />
                {formatDistanceToNow(question.createdAt)}
              </span>
            ) : null}
          </div>

          {isAnswered && answerSnippet ? (
            <div className="mt-2 rounded-lg border border-border bg-surface/70 px-2.5 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                Answer
              </p>
              <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-ink">
                “{answerSnippet}”
              </p>
            </div>
          ) : (
            <div className="mt-2 rounded-lg border border-dashed border-border px-2.5 py-2">
              <p className="line-clamp-2 text-[11px] text-muted">
                {needsPayment
                  ? 'Payment pending — complete checkout to continue.'
                  : question.assignedExpert?.name
                    ? `Assigned to ${question.assignedExpert.name}. Waiting for answer.`
                    : 'Waiting for mentor assignment and answer.'}
              </p>
            </div>
          )}
        </button>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="min-w-0 truncate text-[11px] font-medium text-muted">
            {needsPayment
              ? `Due ${formatRupee(amountPaise)}`
              : question.assignedExpert?.name
                ? `Mentor: ${question.assignedExpert.name}`
                : isAnswered
                  ? 'Answer delivered'
                  : 'Awaiting mentor'}
          </span>
          {needsPayment ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isDeleting || isPaying}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(question)
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold text-ink transition hover:bg-surface disabled:opacity-60"
                aria-label="Delete question"
              >
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
              <button
                type="button"
                disabled={isPaying || isDeleting}
                onClick={(e) => {
                  e.stopPropagation()
                  onPay(question)
                }}
                className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-card transition hover:bg-ink/90 disabled:opacity-60"
              >
                {isPaying ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Paying…
                  </>
                ) : (
                  <>
                    <CreditCard size={12} />
                    Pay now
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpen(question._id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink transition hover:gap-1.5"
            >
              Open
              <ArrowRight size={12} />
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
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Your workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              My Questions
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Track all your questions and answers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              {stats.total} Total
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <Clock size={13} />
              {stats.active} Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <CheckCircle2 size={13} />
              {stats.completed} Completed
            </span>
            <Link
              to="/dashboard/ask"
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-card transition hover:bg-ink/90"
            >
              <MessageSquarePlus size={15} />
              Ask Question
            </Link>
          </div>
        </header>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[168px] animate-pulse rounded-xl border border-border bg-surface" />
                ))}
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-ink">
                <HelpCircle size={22} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">No questions yet</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted">
                Ask your first question and get guidance from verified mentors.
              </p>
              <Link
                to="/dashboard/ask"
                className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-card"
              >
                Ask your first question
              </Link>
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold text-ink">All questions</p>
                  <p className="text-[11px] text-muted">{questions.length} in your workspace</p>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
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
