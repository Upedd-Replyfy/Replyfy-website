import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'
import AdminModal from './AdminModal'
import { adminApi } from '../../services/api'

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#272927] px-4 py-2.5 text-sm text-ink focus:border-sky-500/40 focus:outline-none'

const emptyForm = { title: '', message: '', link: '' }

/**
 * @param {{ open: boolean, onClose: () => void, recipient: { userId: string, name?: string, email?: string } | null }} props
 */
export default function SendNotificationModal({ open, onClose, recipient }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) setForm(emptyForm)
  }, [open, recipient?.userId])

  const sendMutation = useMutation({
    mutationFn: () =>
      adminApi.sendNotification({
        userId: recipient.userId,
        title: form.title.trim(),
        message: form.message.trim(),
        link: form.link.trim(),
      }),
    onSuccess: () => {
      toast.success(`Notification sent to ${recipient?.name || 'user'}`)
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleClose = () => {
    if (sendMutation.isPending) return
    onClose()
  }

  return (
    <AdminModal
      open={open && !!recipient?.userId}
      onClose={handleClose}
      title="Send notification"
      description={
        recipient
          ? `Personal message to ${recipient.name || 'user'}${recipient.email ? ` (${recipient.email})` : ''}`
          : undefined
      }
      size="md"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.title.trim() || !form.message.trim()) {
            toast.error('Title and message are required')
            return
          }
          sendMutation.mutate()
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Title *</label>
          <input
            required
            autoFocus
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Short headline"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Message *</label>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="What should they know?"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Link (optional)</label>
          <input
            value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            placeholder="/dashboard"
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4 max-sm:flex-col-reverse">
          <button type="button" onClick={handleClose} className="admin-btn-secondary max-sm:w-full" disabled={sendMutation.isPending}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={sendMutation.isPending}
            className="admin-btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 max-sm:w-full"
          >
            <Bell size={15} />
            {sendMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
