import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { HelpCircle, LogOut, Menu, Moon, Sun, Video } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useShellTheme } from '../../context/ShellThemeContext'
import { expertApi } from '../../services/api'
import NotificationBell from '../shared/NotificationBell'
import UserAvatar from '../ui/UserAvatar'

function AvailabilitySwitch({
  checked,
  onChange,
  disabled,
  title,
  subtitleOn,
  subtitleOff,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${title}: ${checked ? 'on' : 'off'}. Tap to ${checked ? 'turn off' : 'turn on'}.`}
      disabled={disabled}
      onClick={onChange}
      className={`group flex min-h-[48px] min-w-0 flex-1 items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left transition-all duration-200 disabled:opacity-55 sm:min-w-[180px] sm:flex-none sm:px-3.5 ${
        checked
          ? 'border-border shadow-[var(--shadow-luxury-sm)]'
          : 'border-border hover:bg-surface'
      } outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-border ${
          checked ? 'bg-ink text-card' : 'bg-surface text-muted'
        }`}
      >
        <Icon size={16} strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-tight text-ink">{title}</span>
        <span className={`mt-0.5 block text-[11px] font-medium leading-tight ${checked ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
          {checked ? subtitleOn : subtitleOff}
        </span>
      </span>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-muted-light/40'
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[1.25rem]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export default function ExpertTopbar({ onMenuOpen }) {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useShellTheme()
  const { data: profileData } = useQuery({
    queryKey: ['expert-profile'],
    queryFn: expertApi.getProfile,
    staleTime: 60_000,
  })
  const photo = profileData?.profile?.profilePhoto || profileData?.profile?.avatar || user?.avatar

  const { data, isLoading } = useQuery({
    queryKey: ['expert-availability'],
    queryFn: expertApi.getAvailability,
    staleTime: 30000,
  })

  const isAvailable = data?.availability === 'available'
  const isVideoCallAvailable = Boolean(data?.videoCallAvailable)

  const availabilityMutation = useMutation({
    mutationFn: (payload) => expertApi.updateAvailability(payload),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['expert-availability'], res)
      queryClient.invalidateQueries({ queryKey: ['expert-dashboard'] })

      if ('availability' in variables) {
        toast.success(
          res.availability === 'available'
            ? 'You are now available for new questions'
            : 'You are now unavailable for new questions'
        )
      }
      if ('videoCallAvailable' in variables) {
        toast.success(
          res.videoCallAvailable
            ? 'You are now available for video calls'
            : 'You are no longer available for video calls'
        )
      }
    },
    onError: (err) => toast.error(err.message),
  })

  const busy = isLoading || availabilityMutation.isPending
  const firstName = user?.name?.split(' ')[0] || 'Mentor'

  return (
    <header className="expert-topbar sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuOpen}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-surface hover:text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <UserAvatar src={photo} name={user?.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink sm:text-base">
                Welcome back, {firstName}
              </p>
              <p className="hidden text-xs text-muted sm:block">Manage your mentor availability</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-surface hover:text-ink"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell
              buttonClassName="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-surface hover:text-ink"
            />
            <button
              type="button"
              onClick={async () => {
                await logout()
              }}
              className="hidden items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink sm:inline-flex"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 sm:gap-3">
          <AvailabilitySwitch
            checked={isAvailable}
            disabled={busy}
            title="Questions"
            subtitleOn="Accepting new asks"
            subtitleOff="Not accepting asks"
            icon={HelpCircle}
            onChange={() => {
              if (busy) return
              availabilityMutation.mutate({
                availability: isAvailable ? 'unavailable' : 'available',
              })
            }}
          />

          <AvailabilitySwitch
            checked={isVideoCallAvailable}
            disabled={busy}
            title="Video calls"
            subtitleOn="Open for calls"
            subtitleOff="Calls paused"
            icon={Video}
            onChange={() => {
              if (busy) return
              availabilityMutation.mutate({ videoCallAvailable: !isVideoCallAvailable })
            }}
          />
        </div>
      </div>
    </header>
  )
}
