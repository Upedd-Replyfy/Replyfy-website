import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { adminApi } from '../../services/api'

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#272927] px-4 py-2.5 text-sm text-ink focus:border-sky-500/40 focus:outline-none'

export default function AdminNotifications() {
  const [form, setForm] = useState({ userId: '', title: '', message: '', link: '' })

  const { data: usersData } = useQuery({
    queryKey: ['admin-users-notify'],
    queryFn: () => adminApi.getUsers({ limit: 100, role: 'all' }),
  })

  const sendMutation = useMutation({
    mutationFn: () => adminApi.sendNotification(form),
    onSuccess: () => {
      toast.success('Notification sent')
      setForm({ userId: '', title: '', message: '', link: '' })
    },
    onError: (err) => toast.error(err.message),
  })

  const users = usersData?.users || []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Communications"
        title="Notifications"
        description="Send notifications to platform users"
      />

      <div className="admin-panel max-w-xl rounded-[20px] border border-white/[0.08] bg-[#202323] p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.userId || !form.title || !form.message) {
              toast.error('User, title, and message are required')
              return
            }
            sendMutation.mutate()
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Recipient *</label>
            <select
              required
              value={form.userId}
              onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) — {u.role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Title *</label>
            <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Message *</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Link (optional)</label>
            <input value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} placeholder="/dashboard" className={inputClass} />
          </div>
          <button type="submit" disabled={sendMutation.isPending} className="admin-btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  )
}
