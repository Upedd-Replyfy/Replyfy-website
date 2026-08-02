import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Bell, Send, Inbox, Link2, UserRound, Users, UserCheck } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { adminApi } from '../../services/api'

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#272927] px-4 py-2.5 text-sm text-ink focus:border-sky-500/40 focus:outline-none'

const emptyForm = { audience: 'one', userId: '', title: '', message: '', link: '' }

const audienceOptions = [
  { id: 'one', label: 'One person', hint: 'Pick a single account', icon: UserRound },
  { id: 'all_users', label: 'All users', hint: 'Every active user', icon: Users },
  { id: 'all_mentors', label: 'All mentors', hint: 'Every active mentor', icon: UserCheck },
]

function formatWhen(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function typeTone(type) {
  if (type === 'general') return 'info'
  if (String(type).includes('reject')) return 'danger'
  if (String(type).includes('approv') || String(type).includes('success') || String(type).includes('deliver')) {
    return 'success'
  }
  return 'violet'
}

export default function AdminNotifications() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)

  const { data: usersData } = useQuery({
    queryKey: ['admin-users-notify'],
    queryFn: () => adminApi.getUsers({ limit: 100, role: 'all' }),
  })

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminApi.getNotifications({ limit: 50 }),
  })

  const sendMutation = useMutation({
    mutationFn: () =>
      adminApi.sendNotification({
        audience: form.audience,
        userId: form.audience === 'one' ? form.userId : undefined,
        title: form.title,
        message: form.message,
        link: form.link,
      }),
    onSuccess: (res) => {
      const count = res?.count || 1
      toast.success(
        count > 1 ? `Notification sent to ${count} people` : 'Notification sent'
      )
      setForm(emptyForm)
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const users = usersData?.users || []
  const notifications = listData?.notifications || []
  const total = listData?.pagination?.total ?? notifications.length

  const subtitle =
    form.audience === 'all_users'
      ? 'Broadcast to all active users'
      : form.audience === 'all_mentors'
        ? 'Broadcast to all active mentors'
        : 'Compose and deliver to one account'

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Notifications"
        description="Review sent alerts and message platform users"
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="order-2 admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323] xl:order-1">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <Inbox size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">All notifications</p>
                <p className="text-xs text-muted">{total} sent · newest first</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Bell size={22} />
              </span>
              <p className="mt-4 text-base font-semibold text-ink">No notifications yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Sent messages and system alerts will show up here.
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(70vh,720px)] divide-y divide-white/[0.06] overflow-y-auto">
              {notifications.map((n) => (
                <li key={n._id} className="px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{n.title}</p>
                        <AdminStatusBadge tone={typeTone(n.type)}>
                          {String(n.type || 'general').replace(/_/g, ' ')}
                        </AdminStatusBadge>
                        <AdminStatusBadge tone={n.isRead ? 'neutral' : 'warning'}>
                          {n.isRead ? 'Read' : 'Unread'}
                        </AdminStatusBadge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{n.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-light">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <UserRound size={11} className="shrink-0" />
                          <span className="truncate">
                            {n.user?.name || 'Unknown'}
                            {n.user?.email ? ` · ${n.user.email}` : ''}
                            {n.user?.role ? ` (${n.user.role})` : ''}
                          </span>
                        </span>
                        {n.link ? (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <Link2 size={11} className="shrink-0" />
                            <span className="truncate">{n.link}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <time className="shrink-0 text-[11px] text-muted-light">{formatWhen(n.createdAt)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="order-1 space-y-4 xl:order-2">
          <div className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                <Send size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Send notification</p>
                <p className="text-xs text-muted">{subtitle}</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!form.title.trim() || !form.message.trim()) {
                  toast.error('Title and message are required')
                  return
                }
                if (form.audience === 'one' && !form.userId) {
                  toast.error('Select a recipient')
                  return
                }
                sendMutation.mutate()
              }}
              className="space-y-4"
            >
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Send to *</p>
                <div className="grid gap-2">
                  {audienceOptions.map((opt) => {
                    const Icon = opt.icon
                    const selected = form.audience === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, audience: opt.id }))}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                          selected
                            ? 'border-sky-500/40 bg-sky-500/10 ring-1 ring-sky-500/20'
                            : 'border-white/[0.08] hover:border-sky-500/25 hover:bg-white/[0.02]'
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            selected ? 'bg-sky-500/15 text-sky-600' : 'bg-surface text-muted'
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                          <span className="block text-[11px] text-muted">{opt.hint}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {form.audience === 'one' && (
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
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Short headline"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className={inputClass}
                  placeholder="What should they know?"
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
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="admin-btn-gradient inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 sm:w-auto"
              >
                <Bell size={16} />
                {sendMutation.isPending
                  ? 'Sending...'
                  : form.audience === 'all_users'
                    ? 'Send to all users'
                    : form.audience === 'all_mentors'
                      ? 'Send to all mentors'
                      : 'Send Notification'}
              </button>
            </form>
          </div>

          <div className="admin-panel rounded-[20px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-violet-500/8 to-transparent p-5">
            <p className="text-sm font-semibold text-ink">Tips</p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
              <li>Keep titles under ~60 characters so they read well in the bell menu.</li>
              <li>Broadcasts create in-app alerts for every matching active account.</li>
              <li>Prefer clear, actionable language over marketing copy.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
