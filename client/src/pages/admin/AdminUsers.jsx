import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Bell, Search, UserCheck, UserX, Users } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import SendNotificationModal from '../../components/admin/SendNotificationModal'
import { adminApi } from '../../services/api'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [notifyUser, setNotifyUser] = useState(null)
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ limit: 50, role: 'user' }),
  })

  const users = usersData?.users || []
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.name, u.email].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [users, query])

  const stats = useMemo(() => {
    const active = users.filter((u) => u.isActive).length
    return [
      { label: 'Total users', value: users.length, icon: Users },
      { label: 'Active', value: active, icon: UserCheck },
      { label: 'Inactive', value: users.length - active, icon: UserX },
    ]
  }, [users])

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated')
    },
    onError: (err) => toast.error(err.message),
  })

  const UserActions = ({ u }) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setNotifyUser({ userId: u._id, name: u.name, email: u.email })}
        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/25 px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/10"
        title="Send personal notification"
      >
        <Bell size={13} /> Notify
      </button>
      <button
        type="button"
        onClick={() => toggleMutation.mutate(u._id)}
        disabled={toggleMutation.isPending}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
          u.isActive
            ? 'border-rose-500/25 text-rose-600 hover:bg-rose-500/10'
            : 'border-emerald-500/25 text-emerald-600 hover:bg-emerald-500/10'
        }`}
      >
        {u.isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Directory"
        title="Users"
        description="Manage platform user accounts"
      />

      <AdminStatStrip items={stats} />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-semibold text-ink">User accounts</p>
            <p className="text-xs text-muted">{filtered.length} shown</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#272927] py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none"
            />
          </label>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <p className="px-4 py-10 text-center text-muted">Loading users...</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-muted">No users found</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filtered.map((u) => (
                <div key={u._id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/15 to-violet-500/15 text-sm font-semibold text-sky-600">
                      {(u.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-ink">{u.name}</p>
                        <AdminStatusBadge tone={u.isActive ? 'success' : 'neutral'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </AdminStatusBadge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                  <UserActions u={u} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#242727]">
              <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted">No users found</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/15 to-violet-500/15 text-sm font-semibold text-sky-600">
                          {(u.name || '?').charAt(0).toUpperCase()}
                        </span>
                        <p className="min-w-0 truncate font-medium text-ink">{u.name}</p>
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-muted">{u.email}</td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge tone={u.isActive ? 'success' : 'neutral'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-5 py-4">
                      <UserActions u={u} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SendNotificationModal
        open={!!notifyUser}
        onClose={() => setNotifyUser(null)}
        recipient={notifyUser}
      />
    </div>
  )
}
