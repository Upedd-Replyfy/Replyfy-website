import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Bell, Mail, Search, UserCheck, UserX, Users } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import SendNotificationModal from '../../components/admin/SendNotificationModal'
import { adminApi } from '../../services/api'

function UserAdminCard({ user, index, onNotify, onToggle, toggling }) {
  const initial = (user.name || '?').charAt(0).toUpperCase()

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -2 }}
      className="premium-surface group relative rounded-[14px] px-3 py-2.5 transition hover:border-[#5B4CFF]/50"
    >
      <div className="relative z-[1] flex items-center gap-2.5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B4CFF] to-[#7C6CFF] text-xs font-semibold text-white">
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">
              {user.name}
            </h3>
            <AdminStatusBadge tone={user.isActive ? 'success' : 'neutral'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </AdminStatusBadge>
          </div>
          <p className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-[11px] text-muted">
            <Mail size={11} className="shrink-0 text-muted-light" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onNotify(user)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#5B4CFF]/25 bg-[#5B4CFF]/10 px-2.5 text-[11px] font-semibold text-[#a5a0ff] transition hover:bg-[#5B4CFF]/15"
            title="Send personal notification"
          >
            <Bell size={12} />
            <span className="hidden sm:inline">Notify</span>
          </button>
          <button
            type="button"
            onClick={() => onToggle(user._id)}
            disabled={toggling}
            className={`inline-flex h-8 items-center rounded-lg border px-2.5 text-[11px] font-semibold transition disabled:opacity-50 ${
              user.isActive
                ? 'border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
            }`}
          >
            {user.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Directory"
        title="Users"
        description="Manage platform user accounts"
      />

      <AdminStatStrip items={stats} />

      <div className="premium-filter flex flex-col gap-2.5 rounded-[16px] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            className="h-9 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="premium-surface h-[68px] animate-pulse rounded-[14px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
            <Users size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">No users found</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted">
            Try another search or check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((u, index) => (
            <UserAdminCard
              key={u._id}
              user={u}
              index={index}
              onNotify={(user) =>
                setNotifyUser({ userId: user._id, name: user.name, email: user.email })
              }
              onToggle={(id) => toggleMutation.mutate(id)}
              toggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      <SendNotificationModal
        open={!!notifyUser}
        onClose={() => setNotifyUser(null)}
        recipient={notifyUser}
      />
    </div>
  )
}
