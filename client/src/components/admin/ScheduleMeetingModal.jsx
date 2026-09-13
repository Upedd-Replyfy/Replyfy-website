import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Calendar, Link2, RefreshCw, CheckCircle2, Copy } from 'lucide-react'
import AdminModal from './AdminModal'
import AdminButton from './ui/AdminButton'
import AdminBadge from './ui/AdminBadge'
import { adminApi } from '../../services/api'
import { MENTOR_CALL_DURATION_MINUTES } from '../../constants'

function formatSlot(slot) {
  if (slot?.label) return slot.label
  const date = slot?.date
    ? new Date(slot.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''
  return [date, slot?.time].filter(Boolean).join(' – ') || '—'
}

function statusTone(status) {
  if (status === 'sent') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'pending') return 'warning'
  return 'neutral'
}

async function copyText(value) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    toast.success('WhatsApp number copied')
  } catch {
    toast.error('Could not copy number')
  }
}

export default function ScheduleMeetingModal({ question, open, onClose }) {
  const queryClient = useQueryClient()
  const [meetingDate, setMeetingDate] = useState(
    question?.meetingDate ? String(question.meetingDate).slice(0, 10) : ''
  )
  const [meetingTime, setMeetingTime] = useState(question?.meetingTime || '')
  const [meetingLink, setMeetingLink] = useState(question?.meetingLink || '')
  const [duration, setDuration] = useState(
    question?.meetingDurationMinutes || MENTOR_CALL_DURATION_MINUTES
  )

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-mentor-calls'] })
  }

  const scheduleMutation = useMutation({
    mutationFn: () =>
      adminApi.scheduleMentorCall(question._id, {
        meetingDate,
        meetingTime,
        meetingLink,
        meetingDurationMinutes: Number(duration) || MENTOR_CALL_DURATION_MINUTES,
        forceNotify: question.meetingStatus === 'scheduled',
      }),
    onSuccess: () => {
      toast.success('Meeting scheduled — email notification sent where configured')
      invalidate()
      onClose?.()
    },
    onError: (err) => toast.error(err.message),
  })

  const completeMutation = useMutation({
    mutationFn: () => adminApi.completeMentorCall(question._id),
    onSuccess: () => {
      toast.success('Mentor call marked completed')
      invalidate()
      onClose?.()
    },
    onError: (err) => toast.error(err.message),
  })

  const retryMutation = useMutation({
    mutationFn: () => adminApi.retryMentorCallNotifications(question._id),
    onSuccess: () => {
      toast.success('Email notification retry triggered')
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  if (!question) return null

  const slots = question.mentorAvailability?.slots || []
  const note = question.mentorAvailability?.timelineNote || ''
  const scheduled = question.meetingStatus === 'scheduled'
  const completed = question.meetingStatus === 'completed'
  const whatsapp = question.whatsappNumber || ''

  return (
    <AdminModal open={open} onClose={onClose} title="Schedule Mentor Call" size="lg">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-slate-50/70 p-4 text-sm">
          <p className="font-semibold text-slate-900">{question.user?.name || 'User'}</p>
          <p className="mt-1 text-xs text-slate-500">{question.user?.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>WhatsApp: {whatsapp || '—'}</span>
            {whatsapp ? (
              <button
                type="button"
                onClick={() => copyText(whatsapp)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy size={11} /> Copy
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-slate-700">{question.title}</p>
          <p className="mt-2 text-xs text-slate-500">
            Mentor: {question.assignedExpert?.name || question.selectedExpert?.name || '—'}
          </p>
        </div>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Mentor availability
          </h3>
          {slots.length || note ? (
            <ul className="mt-2 space-y-1.5">
              {slots.map((slot, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {formatSlot(slot)}
                </li>
              ))}
              {note ? (
                <li className="rounded-xl border border-dashed border-border bg-white px-3 py-2 text-sm text-slate-600">
                  {note}
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Mentor has not submitted availability yet
              {question.mentorRequestStatus === 'sent' ? ' (request sent)' : ''}.
            </p>
          )}
        </section>

        {!completed ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-ink">Meeting date</span>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-ink">Meeting time</span>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="4:00 PM"
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-ink">Duration (minutes)</span>
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm"
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-ink">Meeting link</span>
              <div className="relative">
                <Link2
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/…"
                  className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm"
                />
              </div>
            </label>
          </div>
        ) : null}

        {scheduled || completed ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-xs">
            <span className="font-semibold text-slate-500">Email:</span>
            <AdminBadge tone={statusTone(question.emailNotificationStatus)}>
              {question.emailNotificationStatus || '—'}
            </AdminBadge>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <AdminButton variant="secondary" onClick={onClose}>
            Close
          </AdminButton>
          {scheduled && !completed ? (
            <>
              <AdminButton
                variant="secondary"
                icon={RefreshCw}
                disabled={retryMutation.isPending}
                onClick={() => retryMutation.mutate()}
              >
                Retry email
              </AdminButton>
              <AdminButton
                icon={CheckCircle2}
                disabled={completeMutation.isPending}
                onClick={() => completeMutation.mutate()}
              >
                Mark completed
              </AdminButton>
            </>
          ) : null}
          {!completed ? (
            <AdminButton
              icon={Calendar}
              disabled={scheduleMutation.isPending || !meetingDate || !meetingTime || !meetingLink}
              onClick={() => scheduleMutation.mutate()}
            >
              {scheduled ? 'Update & email' : 'Schedule Meeting'}
            </AdminButton>
          ) : null}
        </div>
      </div>
    </AdminModal>
  )
}
