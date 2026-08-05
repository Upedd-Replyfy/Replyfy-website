import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderTree,
  HelpCircle,
  MessageSquarePlus,
  Sparkles,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import QuestionDetailModal from '../../components/questions/QuestionDetailModal'
import { userApi } from '../../services/api'
import { PLANS, QUESTION_STATUS } from '../../constants'
import { formatDistanceToNow } from '../../utils/date'

const STATUS_TONE = {
  pending_payment: 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
  pending_admin_review: 'bg-sky-500/15 text-sky-400 ring-sky-500/25',
  assigned: 'bg-[#5B4CFF]/15 text-[#a5a0ff] ring-[#5B4CFF]/25',
  in_progress: 'bg-violet-500/15 text-violet-300 ring-violet-500/25',
  waiting_admin_review: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
  rejected: 'bg-rose-500/15 text-rose-400 ring-rose-500/25',
  cancelled: 'bg-surface text-muted ring-border',
}

function QuestionCard({ question, index, onOpen }) {
  const statusLabel = QUESTION_STATUS[question.status] || question.status
  const tone = STATUS_TONE[question.status] || STATUS_TONE.cancelled
  const planName = PLANS[question.plan]?.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.25) }}
      whileHover={{ y: -4 }}
    >
      <button
        type="button"
        onClick={() => onOpen(question._id)}
        className="premium-surface group relative flex h-full w-full flex-col rounded-[16px] p-4 text-left transition hover:border-[#5B4CFF]/50 sm:p-4"
      >
        <div className="relative z-[1] flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-[#7C6CFF]">
              <HelpCircle size={18} />
            </span>
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone}`}
            >
              {statusLabel}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight text-ink">
            {question.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted">
            {question.category?.name && (
              <span className="inline-flex items-center gap-1">
                <FolderTree size={11} />
                {question.category.name}
              </span>
            )}
            {planName && (
              <>
                <span className="h-3 w-px bg-border" aria-hidden />
                <span>{planName}</span>
              </>
            )}
            {question.createdAt && (
              <>
                <span className="h-3 w-px bg-border" aria-hidden />
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {formatDistanceToNow(question.createdAt)}
                </span>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
            <span className="text-[12px] font-medium text-muted">
              {question.assignedExpert?.name
                ? `Mentor: ${question.assignedExpert.name}`
                : 'Awaiting mentor'}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#a5a0ff] transition group-hover:gap-1.5">
              Open
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  )
}

export default function UserQuestions() {
  const [openId, setOpenId] = useState(null)
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

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 lg:py-10"
      >
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a5a0ff]">
              <Sparkles size={12} />
              Your workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-[36px] sm:leading-[1.15]">
              My Questions
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Track all your questions and answers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink">
              <HelpCircle size={13} className="text-[#7C6CFF]" />
              {stats.total} Total
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-3 py-1 text-xs font-semibold text-[#a5a0ff]">
              <Clock size={13} />
              {stats.active} Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              {stats.completed} Completed
            </span>
            <Link
              to="/dashboard/ask"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B4CFF] to-[#7C6CFF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(91,76,255,0.25)] transition hover:brightness-110"
            >
              <MessageSquarePlus size={15} />
              Ask Question
            </Link>
          </div>
        </header>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="premium-surface h-[180px] animate-pulse rounded-[16px]" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center rounded-[24px] border border-dashed border-border bg-card px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
                <HelpCircle size={24} />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-ink">No questions yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Ask your first question and get guidance from verified mentors.
              </p>
              <Link
                to="/dashboard/ask"
                className="mt-6 rounded-xl bg-[#5B4CFF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(91,76,255,0.28)]"
              >
                Ask your first question
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              {questions.map((q, index) => (
                <QuestionCard key={q._id} question={q} index={index} onOpen={setOpenId} />
              ))}
            </div>
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
