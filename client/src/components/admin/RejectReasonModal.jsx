import { useState } from 'react'
import AdminModal from './AdminModal'

export default function RejectReasonModal({ open, onClose, onConfirm, title = 'Reject', label = 'Reason', loading }) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    onConfirm(reason.trim())
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <AdminModal open={open} onClose={handleClose} title={title} description="This action cannot be undone.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
            placeholder="Explain why..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#090909] px-4 py-3 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-ink hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="admin-btn-danger rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Confirm'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
