import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  Search,
  Check,
  X,
  UserPlus,
  CreditCard,
  UserRound,
  Clock,
  ArrowUpDown,
  Paperclip,
  Star,
  CircleHelp,
  BadgeCheck,
  MessageSquareWarning,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import AdminBadge from '../../components/admin/ui/AdminBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import AdminAvatar from '../../components/admin/ui/AdminAvatar'
import AssignExpertModal from '../../components/admin/AssignExpertModal'
import RejectReasonModal from '../../components/admin/RejectReasonModal'
import ConfirmActionModal from '../../components/admin/ConfirmActionModal'
import MentorAssignPanel from '../../components/admin/MentorAssignPanel'
import { adminApi } from '../../services/api'

const tabs = [
  { id: 'pending', label: 'Pending Review' },
  { id: 'all', label: 'All Questions' },
]

function statusTone(status) {
  const map = {
    pending_admin_review: 'warning',
    pending_payment: 'neutral',
    assigned: 'info',
    in_progress: 'info',
    waiting_admin_review: 'violet',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'neutral',
  }
  return map[status] || 'neutral'
}

function formatStatus(status) {
  return String(status || '').replace(/_/g, ' ')
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

function priorityBar(priority) {
  if (priority === 'urgent') return 'bg-rose-500'
  if (priority === 'priority') return 'bg-amber-500'
  return 'bg-slate-300'
}

function formatMoney(amount) {
  return `₹${(amount || 0) / 100}`
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 sm:gap-4">
      <dt className="shrink-0 text-xs font-medium text-slate-400">{label}</dt>
      <dd className="min-w-0 max-w-[70%] break-words text-right text-xs font-semibold text-slate-800">{value ?? '—'}</dd>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-slate-50/60 p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function QuestionCard({ question, onSelect }) {
  const verified = Boolean(question.user?.isVerified || question.user?.verified)
  const rating = question.user?.averageRating ?? question.rating

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(question)}
      className="relative w-full cursor-pointer rounded-2xl border border-border bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
    >
      <span className={`absolute left-0 top-4 h-10 w-1 rounded-r-full ${priorityBar(question.priority)}`} />
      <div className="flex items-start gap-3 pl-1.5">
        <AdminAvatar
          name={question.user?.name}
          src={question.user?.avatar}
          size="md"
          verified={verified}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-slate-900">{question.user?.name || 'Unknown'}</p>
                {verified && <BadgeCheck size={14} className="shrink-0 text-indigo-500" />}
              </div>
              <p className="truncate text-[11px] text-slate-400">{question.user?.email || '—'}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="block text-[10px] font-medium text-slate-400">{timeAgo(question.createdAt)}</span>
              {rating != null && rating !== '' && (
                <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  {rating}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-slate-800">
            {question.title}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <AdminBadge tone="violet">{question.category?.name || '—'}</AdminBadge>
            <AdminBadge tone="neutral" className="capitalize">{question.plan || '—'}</AdminBadge>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {formatMoney(question.amount)}
            </span>
            <AdminBadge tone={statusTone(question.status)} dot>
              {formatStatus(question.status)}
            </AdminBadge>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function QuestionDetailModal({
  open,
  question,
  onClose,
  onApprove,
  onReject,
  onAssignModal,
  onRequestChanges,
  approveLoading,
}) {
  const navigate = useNavigate()
  if (!question) return null

  const canReview = question.status === 'pending_admin_review'
  const canReassign = question.status === 'assigned'
  const assignMode = canReassign ? 'assign' : 'approve'
  const user = question.user || {}
  const tags = question.tags || []

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={question.title || 'Question details'}
      description={`${user.name || 'User'} · ${formatStatus(question.status)}`}
      size="xl"
      footer={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {canReview && (
            <>
              <AdminButton
                variant="success"
                icon={Check}
                loading={approveLoading}
                onClick={onApprove}
              >
                Auto assign
              </AdminButton>
              <AdminButton variant="soft" icon={UserPlus} onClick={onAssignModal}>
                Assign mentor
              </AdminButton>
              <AdminButton variant="danger" icon={X} onClick={onReject}>
                Reject
              </AdminButton>
              <AdminButton variant="secondary" icon={MessageSquareWarning} onClick={onRequestChanges}>
                Request changes
              </AdminButton>
            </>
          )}
          {canReassign && (
            <AdminButton variant="soft" icon={UserPlus} onClick={onAssignModal}>
              Reassign mentor
            </AdminButton>
          )}
          <AdminButton
            variant="secondary"
            icon={CreditCard}
            onClick={() => navigate('/admin/payments')}
          >
            View payment
          </AdminButton>
          <AdminButton
            variant="secondary"
            icon={UserRound}
            onClick={() => navigate('/admin/users')}
          >
            View user profile
          </AdminButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <AdminBadge tone={statusTone(question.status)} dot>
            {formatStatus(question.status)}
          </AdminBadge>
          <AdminBadge tone="neutral" className="capitalize">
            {question.priority || 'standard'}
          </AdminBadge>
          <AdminBadge tone="violet">{question.category?.name || '—'}</AdminBadge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="User">
            <div className="flex items-center gap-3">
              <AdminAvatar name={user.name} src={user.avatar} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{user.name || 'Unknown'}</p>
                <p className="truncate text-xs text-slate-500">{user.email || '—'}</p>
              </div>
            </div>
            <dl className="mt-3 divide-y divide-border border-t border-border">
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone || '—'} />
            </dl>
          </Section>

          <Section title="Plan details">
            <dl className="divide-y divide-border">
              <InfoRow label="Plan" value={<span className="capitalize">{question.plan || '—'}</span>} />
              <InfoRow label="Price" value={formatMoney(question.amount)} />
              <InfoRow label="Priority" value={<span className="capitalize">{question.priority || 'standard'}</span>} />
              <InfoRow label="Category" value={question.category?.name} />
              <InfoRow label="Mentor type" value={question.expertType?.name} />
              <InfoRow
                label="Created"
                value={question.createdAt ? new Date(question.createdAt).toLocaleString('en-IN') : '—'}
              />
            </dl>
          </Section>
        </div>

        <Section title="Question details">
          <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-white p-3 sm:max-h-64">
            <p className="text-sm font-semibold text-slate-900">{question.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {question.description || 'No description provided.'}
            </p>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <AdminBadge key={tag} tone="neutral">{tag}</AdminBadge>
              ))}
            </div>
          )}
          {(question.attachments || []).length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Attachments</p>
              {question.attachments.map((file) => (
                <a
                  key={file._id || file.url}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  <Paperclip size={13} />
                  <span className="truncate">{file.name || 'Attachment'}</span>
                </a>
              ))}
            </div>
          )}
        </Section>

        <Section title="Assign mentor">
          {question.assignedExpert || question.selectedExpert ? (
            <div className="mb-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                {question.assignedExpert ? 'Assigned mentor' : 'Preferred mentor'}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <AdminAvatar
                  name={question.assignedExpert?.name || question.selectedExpert?.name}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {question.assignedExpert?.name || question.selectedExpert?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {question.assignedAt ? `Assigned ${timeAgo(question.assignedAt)}` : 'Selected by user'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {(canReview || canReassign) ? (
            <>
              <MentorAssignPanel question={question} mode={assignMode} onAssigned={onClose} />
              <button
                type="button"
                onClick={onAssignModal}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open full mentor browser →
              </button>
            </>
          ) : (
            !question.assignedExpert &&
            !question.selectedExpert && (
              <p className="text-sm text-slate-500">No mentor assigned yet.</p>
            )
          )}
        </Section>
      </div>
    </AdminModal>
  )
}

export default function AdminQuestions() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('pending')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [detailQuestion, setDetailQuestion] = useState(null)
  const [assignQuestion, setAssignQuestion] = useState(null)
  const [rejectQuestion, setRejectQuestion] = useState(null)
  const [rejectTitle, setRejectTitle] = useState('Reject Question')
  const [confirmApprove, setConfirmApprove] = useState(false)

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-questions'],
    queryFn: adminApi.getPendingQuestions,
  })

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => adminApi.getQuestions({ limit: 50 }),
    enabled: tab === 'all',
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  }

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveQuestion(id),
    onSuccess: () => {
      toast.success('Question approved & mentor assigned')
      setConfirmApprove(false)
      setDetailQuestion(null)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectQuestion(id, reason),
    onSuccess: () => {
      toast.success(rejectTitle.includes('Changes') ? 'Changes requested' : 'Question rejected')
      setRejectQuestion(null)
      setDetailQuestion(null)
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const source = tab === 'pending' ? pendingData?.questions || [] : allData?.questions || []
  const isLoading = tab === 'pending' ? pendingLoading : allLoading
  const pendingCount = pendingData?.questions?.length || 0

  const categories = useMemo(() => {
    const map = new Map()
    source.forEach((q) => {
      const id = q.category?._id || q.category
      const name = q.category?.name
      if (id && name) map.set(String(id), name)
    })
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [source])

  const plans = useMemo(() => [...new Set(source.map((q) => q.plan).filter(Boolean))], [source])
  const statuses = useMemo(() => [...new Set(source.map((q) => q.status).filter(Boolean))], [source])

  const questions = useMemo(() => {
    let list = [...source]
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((item) =>
        [item.title, item.description, item.user?.name, item.user?.email, item.category?.name, item.plan, item.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (categoryFilter !== 'all') {
      list = list.filter((item) => String(item.category?._id || item.category) === categoryFilter)
    }
    if (statusFilter !== 'all') {
      list = list.filter((item) => item.status === statusFilter)
    }
    if (planFilter !== 'all') {
      list = list.filter((item) => item.plan === planFilter)
    }
    list.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      if (sort === 'oldest') return aTime - bTime
      if (sort === 'amount') return (b.amount || 0) - (a.amount || 0)
      return bTime - aTime
    })
    return list
  }, [source, query, categoryFilter, statusFilter, planFilter, sort])

  const openAssignModal = () =>
    setAssignQuestion(
      detailQuestion?.status === 'assigned'
        ? { ...detailQuestion, _reassign: true }
        : detailQuestion
    )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Questions"
        description="Click a request card to review details, assign a mentor, and approve"
        actions={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
            <Clock size={14} className="text-amber-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/80">Pending</p>
              <p className="text-sm font-bold text-amber-800">{pendingCount}</p>
            </div>
          </div>
        }
      />

      <div className="rounded-[20px] border border-border bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex max-w-full items-center overflow-x-auto rounded-xl bg-slate-100 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-3.5 ${
                  tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
                {t.id === 'pending' && pendingCount > 0 && (
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <label className="relative block w-full lg:max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, users, categories..."
              className="h-10 w-full rounded-xl border border-border bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-700"
            aria-label="Category filter"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-700"
            aria-label="Status filter"
            disabled={tab === 'pending'}
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-700"
            aria-label="Plan filter"
          >
            <option value="all">All plans</option>
            {plans.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
          <div className="relative">
            <ArrowUpDown size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-700"
              aria-label="Sort"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount">Highest amount</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 px-1 text-xs font-semibold text-slate-500">
          {questions.length} request{questions.length === 1 ? '' : 's'}
        </p>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-14 text-center">
            <CircleHelp className="mx-auto text-slate-300" size={28} />
            <p className="mt-3 text-sm font-semibold text-slate-800">No questions found</p>
            <p className="mt-1 text-xs text-slate-500">Adjust filters or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {questions.map((q) => (
              <QuestionCard key={q._id} question={q} onSelect={setDetailQuestion} />
            ))}
          </div>
        )}
      </div>

      <QuestionDetailModal
        open={!!detailQuestion}
        question={detailQuestion}
        onClose={() => setDetailQuestion(null)}
        approveLoading={approveMutation.isPending}
        onApprove={() => setConfirmApprove(true)}
        onReject={() => {
          setRejectTitle('Reject Question')
          setRejectQuestion(detailQuestion)
        }}
        onRequestChanges={() => {
          setRejectTitle('Request Changes')
          setRejectQuestion(detailQuestion)
        }}
        onAssignModal={openAssignModal}
      />

      <AssignExpertModal
        open={!!assignQuestion}
        onClose={() => setAssignQuestion(null)}
        question={assignQuestion}
        mode={assignQuestion?._reassign ? 'assign' : 'approve'}
      />

      <RejectReasonModal
        open={!!rejectQuestion}
        onClose={() => setRejectQuestion(null)}
        title={rejectTitle}
        loading={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate({ id: rejectQuestion._id, reason })}
      />

      <ConfirmActionModal
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        title="Auto assign?"
        description="This will approve the question and auto-assign the best available mentor."
        confirmLabel="Auto assign"
        variant="success"
        loading={approveMutation.isPending}
        onConfirm={() => detailQuestion && approveMutation.mutate(detailQuestion._id)}
      />
    </div>
  )
}
