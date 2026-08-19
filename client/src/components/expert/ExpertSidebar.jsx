import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import Logo from '../ui/Logo'
import UserAvatar from '../ui/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { expertApi } from '../../services/api'
import { EXPERT_NAV } from './expertNav'

export default function ExpertSidebar({ onNavigate }) {
  const { user, logout } = useAuth()
  const { data } = useQuery({
    queryKey: ['expert-profile'],
    queryFn: expertApi.getProfile,
    staleTime: 60_000,
  })
  const photo = data?.profile?.profilePhoto || data?.profile?.avatar || user?.avatar

  const handleSignOut = async () => {
    onNavigate?.()
    await logout()
  }

  return (
    <aside className="expert-sidebar flex h-full w-[248px] flex-col border-r border-border bg-card/98 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-6 pt-[env(safe-area-inset-top)]">
        <Logo expert surface="adaptive" size="sidebar" className="ml-1" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Menu</p>
        <nav className="mt-3 space-y-1">
          {EXPERT_NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${
                    isActive
                      ? 'bg-surface text-ink ring-1 ring-border'
                      : 'text-muted hover:bg-surface hover:text-ink'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <UserAvatar src={photo} name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.name || 'Mentor'}</p>
              <p className="truncate text-[11px] text-muted">{user?.email || 'Mentor account'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-red-500/90 transition hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={20} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
