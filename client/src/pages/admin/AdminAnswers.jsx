import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  Paperclip,
  CircleHelp,
  UserRound,
  GraduationCap,
  Clock,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminBadge from '../../components/admin/ui/AdminBadge'
import AdminAvatar from '../../components/admin/ui/AdminAvatar'
import RejectReasonModal from '../../components/admin/RejectReasonModal'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import AnswerReviewWorkspace from '../../components/admin/answer-review/AnswerReviewWorkspace'
import { adminApi } from '../../services/api'

function formatMoney(amount) {
  return `₹${(amount || 0) / 100}`
}

function timeAgo(date) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function AnswerCard({ answer, onOpen }) {
  const question = answer.question || {}
  const user = question.user || {}
  const mentor = answer.expert || {}
  const fileCount =
    (question.attachments?.length || 0) + (answer.attachments?.length || 0)

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen(answer)}
      className="group relative w-full cursor-pointer rounded-2xl border border-border bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-start gap-3">
        <AdminAvatar name={user.name} src={user.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user.name || 'Unknown user'}</p>
              <p className="truncate text-[11px] text-slate-400">{user.email || '—'}</p>
            </div>
            <span className="shrink-0 text-[10px] font-medium text-slate-400">
              {timeAgo(answer.submittedAt)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-slate-800">
            {question.title || 'Untitled question'}
          </p>

          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-2.5 py-1.5">
            <AdminAvatar name={mentor.name} size="sm" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                Assigned mentor
              </p>
              <p className="truncate text-xs font-bold text-slate-800">{mentor.name || '—'}</p>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {question.category?.name && (
              <AdminBadge tone="violet">{question.category.name}</AdminBadge>
            )}
            {question.plan && (
              <AdminBadge tone="neutral" className="capitalize">{question.plan}</AdminBadge>
            )}
            {question.amount != null && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {formatMoney(question.amount)}
              </span>
            )}
            {fileCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                <Paperclip size={11} />
                {fileCount}
              </span>
            )}
            <AdminBadge tone="warning" dot>
              Pending review
            </AdminBadge>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

export default function AdminAnswers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [detailAnswer, setDetailAnswer] = useState(null)
  const [rejectAnswer, setRejectAnswer] = useState(null)
  const [confirmApprove, setConfirmApprove] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-answers'],
    queryFn: adminApi.getPendingAnswers,
  })

  const answers = data?.answers || []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-answers'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  }

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveAnswer(id),
    onSuccess: () => {
      toast.success('Answer approved & delivered to user')
      setConfirmApprove(false)
      setDetailAnswer(null)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectAnswer(id, reason),
    onSuccess: () => {
      toast.success('Revision requested')
      setRejectAnswer(null)
      setDetailAnswer(null)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Answer Review"
        description="Open a card to review the full question, mentor answer, and attachments"
        actions={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
            <Clock size={14} className="text-amber-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/80">
                Pending
              </p>
              <p className="text-sm font-bold text-amber-800">{answers.length}</p>
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : answers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-14 text-center">
          <CircleHelp className="mx-auto text-slate-300" size={28} />
          <p className="mt-3 text-sm font-semibold text-slate-800">No pending answers</p>
          <p className="mt-1 text-xs text-slate-500">New mentor submissions will appear here.</p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 px-1 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={13} />
              User card
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap size={13} />
              Mentor assigned
            </span>
            <span className="text-slate-300">·</span>
            <span>{answers.length} awaiting review</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {answers.map((a) => (
              <AnswerCard key={a._id} answer={a} onOpen={setDetailAnswer} />
            ))}
          </div>
        </div>
      )}

      <AnswerReviewWorkspace
        open={!!detailAnswer}
        answer={detailAnswer}
        answers={answers}
        onClose={() => setDetailAnswer(null)}
        onNavigate={setDetailAnswer}
        approveLoading={approveMutation.isPending}
        onApprove={() => setConfirmApprove(true)}
        onReject={() => setRejectAnswer(detailAnswer)}
        onViewUsers={() => navigate('/admin/users')}
        onViewMentors={() => navigate('/admin/experts')}
      />

      <ConfirmActionModal
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        title="Approve & deliver?"
        description="The answer will be delivered to the user and the question marked completed."
        confirmLabel="Approve"
        variant="success"
        loading={approveMutation.isPending}
        onConfirm={() => detailAnswer && approveMutation.mutate(detailAnswer._id)}
      />

      <RejectReasonModal
        open={!!rejectAnswer}
        onClose={() => setRejectAnswer(null)}
        title="Request Revision"
        label="Revision notes for mentor"
        loading={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectAnswer._id, reason })}
      />
    </div>
  )
}
