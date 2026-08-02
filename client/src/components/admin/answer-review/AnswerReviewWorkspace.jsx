import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  MessageSquareWarning,
  UserRound,
  GraduationCap,
  Paperclip,
  FileText,
  Image as ImageIcon,
  File,
  Archive,
  Download,
  HelpCircle,
  BadgeCheck,
  Star,
  CircleDollarSign,
  History,
  Eye,
} from 'lucide-react'
import AdminAvatar from '../ui/AdminAvatar'
import AdminBadge from '../ui/AdminBadge'
import AdminButton from '../ui/AdminButton'

function formatMoney(amount) {
  if (amount == null) return '—'
  return `₹${amount / 100}`
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
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortId(id) {
  if (!id) return '—'
  return String(id).slice(-8).toUpperCase()
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className="max-w-[60%] break-words text-right text-[13px] font-semibold text-slate-800">{value ?? '—'}</dd>
    </div>
  )
}

function SideCard({ title, icon: Icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="mb-3 flex items-center gap-2">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5]">
            <Icon size={15} />
          </span>
        )}
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </motion.section>
  )
}

function fileIcon(type = '', name = '') {
  const n = String(name).toLowerCase()
  if (type === 'image' || /\.(png|jpe?g|gif|webp)$/.test(n)) return ImageIcon
  if (type === 'pdf' || n.endsWith('.pdf')) return FileText
  if (/\.(zip|rar|7z)$/.test(n)) return Archive
  if (type === 'document' || /\.(docx?|txt)$/.test(n)) return FileText
  return File
}

export function AttachmentGallery({ files = [], label = 'Attachments' }) {
  if (!files.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-5 py-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-[#E2E8F0]">
          <Paperclip size={20} />
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-700">No attachments uploaded</p>
        <p className="mt-1 text-xs text-slate-400">{label} will appear here when available.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {files.map((file, i) => {
        const Icon = fileIcon(file.type, file.name)
        return (
          <motion.div
            key={file._id || file.url || i}
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5]">
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {file.name || `File ${i + 1}`}
              </p>
              <p className="text-[11px] capitalize text-slate-400">{file.type || 'file'}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-[#4F46E5]"
                title="Preview"
              >
                <Eye size={15} />
              </a>
              <a
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-[#4F46E5]"
                title="Download"
              >
                <Download size={15} />
              </a>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function QuestionCard({ question }) {
  const attachments = question?.attachments || []
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5]">
          <HelpCircle size={18} />
        </span>
        <h2 className="text-base font-bold text-slate-900">Question</h2>
        {question?.category?.name && (
          <AdminBadge tone="violet">{question.category.name}</AdminBadge>
        )}
        {question?.priority && (
          <AdminBadge tone="neutral" className="capitalize">
            {question.priority}
          </AdminBadge>
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
        {question?.title || 'Untitled question'}
      </h3>

      <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
          {question?.description || 'No description provided.'}
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Question files
          </p>
          <AttachmentGallery files={attachments} label="Question files" />
        </div>
      )}
    </motion.section>
  )
}

export function AnswerCard({ answer, mentor }) {
  const attachments = answer?.attachments || []
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminAvatar name={mentor?.name} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-slate-900">{mentor?.name || 'Mentor'}</p>
              <BadgeCheck size={14} className="text-[#4F46E5]" />
            </div>
            <p className="text-xs text-slate-500">
              Answered {timeAgo(answer?.submittedAt)}
            </p>
          </div>
        </div>
        <AdminBadge tone="success" dot>
          Submitted
        </AdminBadge>
      </div>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-4">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
          {answer?.content || 'No answer content.'}
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Answer files
          </p>
          <AttachmentGallery files={attachments} label="Answer files" />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <History size={13} />
        Edit history unavailable
      </div>
    </motion.section>
  )
}

export function UserCard({ user, question }) {
  return (
    <SideCard title="User details" icon={UserRound}>
      <div className="mb-3 flex items-center gap-3">
        <AdminAvatar name={user?.name} src={user?.avatar} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name || '—'}</p>
            <BadgeCheck size={14} className="shrink-0 text-[#4F46E5]" />
          </div>
          <p className="truncate text-xs text-slate-500">{user?.email || '—'}</p>
        </div>
      </div>
      <dl className="divide-y divide-[#E2E8F0] border-t border-[#E2E8F0]">
        <MetaRow label="Email" value={user?.email} />
        <MetaRow label="Phone" value={user?.phone || '—'} />
        <MetaRow label="Wallet" value="—" />
        <MetaRow label="Questions" value="—" />
        <MetaRow label="Completed" value="—" />
        <MetaRow label="Plan" value={<span className="capitalize">{question?.plan || '—'}</span>} />
        <MetaRow label="Country" value={user?.country || '—'} />
      </dl>
    </SideCard>
  )
}

export function MentorCard({ mentor }) {
  return (
    <SideCard title="Mentor" icon={GraduationCap}>
      <div className="mb-3 flex items-center gap-3">
        <AdminAvatar name={mentor?.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{mentor?.name || '—'}</p>
          <p className="truncate text-xs text-slate-500">{mentor?.email || '—'}</p>
        </div>
      </div>
      <dl className="divide-y divide-[#E2E8F0] border-t border-[#E2E8F0]">
        <MetaRow label="Experience" value="—" />
        <MetaRow
          label="Rating"
          value={
            <span className="inline-flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" /> —
            </span>
          }
        />
        <MetaRow label="Response time" value="—" />
        <MetaRow label="Availability" value="—" />
        <MetaRow label="Specialization" value="—" />
      </dl>
    </SideCard>
  )
}

export function PaymentCard({ question }) {
  return (
    <SideCard title="Payment" icon={CircleDollarSign}>
      <dl className="divide-y divide-[#E2E8F0]">
        <MetaRow label="Plan" value={<span className="capitalize">{question?.plan || '—'}</span>} />
        <MetaRow label="Amount" value={formatMoney(question?.amount)} />
        <MetaRow label="Payment status" value="Completed" />
        <MetaRow label="Transaction" value="—" />
        <MetaRow label="Invoice" value="—" />
      </dl>
    </SideCard>
  )
}

export function TimelineCard({ answer, question }) {
  const items = [
    { label: 'Created', at: question?.createdAt, tone: 'neutral' },
    { label: 'Paid', at: question?.createdAt, tone: 'success' },
    { label: 'Assigned', at: question?.assignedAt || question?.adminReviewedAt, tone: 'info' },
    { label: 'Answered', at: answer?.submittedAt, tone: 'violet' },
    { label: 'Pending review', at: answer?.submittedAt, tone: 'warning' },
  ].filter((i) => i.at)

  return (
    <SideCard title="Timeline" icon={History}>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={item.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  item.tone === 'success'
                    ? 'bg-[#22C55E]'
                    : item.tone === 'warning'
                      ? 'bg-[#F59E0B]'
                      : item.tone === 'info' || item.tone === 'violet'
                        ? 'bg-[#4F46E5]'
                        : 'bg-slate-300'
                }`}
              />
              {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-[#E2E8F0]" />}
            </div>
            <div className="pb-1">
              <p className="text-xs font-semibold text-slate-800">{item.label}</p>
              <p className="text-[11px] text-slate-400">{timeAgo(item.at)}</p>
            </div>
          </li>
        ))}
      </ol>
    </SideCard>
  )
}

export function ActionPanel({
  onApprove,
  onReject,
  onViewUsers,
  onViewMentors,
  approveLoading,
}) {
  return (
    <div className="border-t border-[#E2E8F0] bg-white/95 px-3 py-3 backdrop-blur sm:px-6 sm:py-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <AdminButton
          className="!h-11 col-span-2 sm:col-span-1"
          variant="success"
          icon={Check}
          loading={approveLoading}
          onClick={onApprove}
        >
          Approve
        </AdminButton>
        <AdminButton className="!h-11 col-span-2 sm:col-span-1" variant="danger" icon={MessageSquareWarning} onClick={onReject}>
          Request changes
        </AdminButton>
        <AdminButton className="!h-11" variant="secondary" icon={UserRound} onClick={onViewUsers}>
          View user
        </AdminButton>
        <AdminButton className="!h-11" variant="secondary" icon={GraduationCap} onClick={onViewMentors}>
          View mentor
        </AdminButton>
      </div>
    </div>
  )
}

/**
 * Premium enterprise Q&A review workspace (UI only — same approve/reject handlers).
 */
export default function AnswerReviewWorkspace({
  open,
  answer,
  answers = [],
  onClose,
  onNavigate,
  onApprove,
  onReject,
  approveLoading,
  onViewUsers,
  onViewMentors,
}) {
  if (!answer) return null

  const question = answer.question || {}
  const user = question.user || {}
  const mentor = answer.expert || {}
  const allAttachments = [
    ...(question.attachments || []),
    ...(answer.attachments || []),
  ]
  const index = answers.findIndex((a) => a._id === answer._id)
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < answers.length - 1

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Question review"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.22 }}
            className="relative flex h-[100dvh] w-full max-w-[1400px] flex-col overflow-hidden rounded-none border-0 border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_32px_100px_rgba(15,23,42,0.28)] sm:h-[90vh] sm:w-[90vw] sm:rounded-3xl sm:border"
          >
            {/* Sticky header */}
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-[#E2E8F0] bg-white/90 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-6 sm:py-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl px-1.5 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:px-2"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h1 className="truncate text-sm font-bold text-slate-900 sm:text-lg">Question Review</h1>
                    <span className="hidden sm:inline-flex">
                      <AdminBadge tone="warning" dot>
                        Pending review
                      </AdminBadge>
                    </span>
                    {question.priority && (
                      <span className="hidden sm:inline-flex">
                        <AdminBadge tone="neutral" className="capitalize">
                          {question.priority}
                        </AdminBadge>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400 sm:text-xs">
                    ID {shortId(answer._id || question._id)} · {formatDate(question.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => hasPrev && onNavigate?.(answers[index - 1])}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => hasNext && onNavigate?.(answers[index + 1])}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  className="hidden rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 sm:inline-flex"
                  aria-label="More"
                >
                  <MoreHorizontal size={18} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-4 p-4 sm:p-6">
                {/* Top summary */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-3"
                >
                  <div className="flex items-start gap-3">
                    <AdminAvatar name={user.name} src={user.avatar} size="xl" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-base font-bold text-slate-900">{user.name || 'User'}</p>
                        <BadgeCheck size={15} className="text-[#4F46E5]" />
                      </div>
                      <p className="truncate text-xs text-slate-500">{user.email || '—'}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <AdminBadge tone="neutral" className="capitalize">
                          {question.plan || '—'}
                        </AdminBadge>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Wallet —
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">
                        Joined — · Questions asked —
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t border-[#E2E8F0] pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <AdminAvatar name={mentor.name} size="lg" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Assigned mentor
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{mentor.name || '—'}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" /> —
                        </span>
                        <span>Exp —</span>
                        <span>Availability —</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-[#E2E8F0] pt-4 text-xs lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                      <p className="mt-1 font-bold text-[#F59E0B]">Pending</p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Category</p>
                      <p className="mt-1 font-bold text-slate-800">{question.category?.name || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price</p>
                      <p className="mt-1 font-bold text-slate-800">{formatMoney(question.amount)}</p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Files</p>
                      <p className="mt-1 font-bold text-slate-800">{allAttachments.length}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Two columns */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
                  <div className="space-y-4">
                    <QuestionCard question={question} />
                    <AnswerCard answer={answer} mentor={mentor} />

                    <section className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5]/10 text-[#4F46E5]">
                          <Paperclip size={16} />
                        </span>
                        <h2 className="text-base font-bold text-slate-900">All attachments</h2>
                        <AdminBadge tone="neutral">{allAttachments.length}</AdminBadge>
                      </div>
                      <AttachmentGallery files={allAttachments} />
                    </section>

                    <div className="lg:hidden">
                      <TimelineCard answer={answer} question={question} />
                    </div>
                  </div>

                  <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
                    <UserCard user={user} question={question} />
                    <MentorCard mentor={mentor} />
                    <PaymentCard question={question} />
                    <div className="hidden lg:block">
                      <TimelineCard answer={answer} question={question} />
                    </div>
                  </aside>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 shrink-0">
              <ActionPanel
                onApprove={onApprove}
                onReject={onReject}
                onViewUsers={onViewUsers}
                onViewMentors={onViewMentors}
                approveLoading={approveLoading}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
