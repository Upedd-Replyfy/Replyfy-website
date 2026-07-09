import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { LogOut, Menu, Moon, Sun, Video } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useShellTheme } from '../../context/ShellThemeContext'
import { expertApi } from '../../services/api'

function AvailabilityToggle({
  checked,
  onChange,
  disabled,
  activeClass,
  label,
  shortLabel,
  icon: Icon,
  ariaLabelOn,
  ariaLabelOff,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? ariaLabelOff : ariaLabelOn}
      disabled={disabled}
      onClick={onChange}
      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-medium transition-colors disabled:opacity-60 sm:px-3 sm:py-2.5 ${
        checked
          ? activeClass
          : 'border-border bg-surface text-muted hover:bg-card hover:text-ink'
      }`}
    >
      {Icon && <Icon size={16} className="shrink-0 sm:hidden" />}
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-current opacity-90' : 'bg-muted-light/40'
        }`}
        style={checked ? { color: 'inherit' } : undefined}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel}</span>
    </button>
  )
}

export default function ExpertTopbar({ onMenuOpen }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useShellTheme()

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

  return (
    <header className="expert-topbar sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-xl sm:flex-nowrap sm:px-6 sm:py-0">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-xl p-2.5 text-muted hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="truncate text-sm font-medium text-muted lg:text-base">
          Welcome back, <span className="text-ink">{user?.name}</span>
        </p>
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <AvailabilityToggle
          checked={isAvailable}
          disabled={busy}
          label={isAvailable ? 'Questions' : 'Questions off'}
          shortLabel={isAvailable ? 'Q On' : 'Q Off'}
          ariaLabelOn="Turn on question availability"
          ariaLabelOff="Turn off question availability"
          activeClass="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
          onChange={() => {
            if (busy) return
            availabilityMutation.mutate({ availability: isAvailable ? 'unavailable' : 'available' })
          }}
        />

        <AvailabilityToggle
          checked={isVideoCallAvailable}
          disabled={busy}
          icon={Video}
          label={isVideoCallAvailable ? 'Video calls' : 'Video calls off'}
          shortLabel={isVideoCallAvailable ? 'V On' : 'V Off'}
          ariaLabelOn="Turn on video call availability"
          ariaLabelOff="Turn off video call availability"
          activeClass="border-sky-500/30 bg-sky-500/10 text-sky-600 hover:bg-sky-500/15 dark:text-sky-400"
          onChange={() => {
            if (busy) return
            availabilityMutation.mutate({ videoCallAvailable: !isVideoCallAvailable })
          }}
        />

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-border p-2.5 text-muted transition-colors hover:bg-surface hover:text-ink"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={async () => {
            await logout()
            navigate('/login', { replace: true })
          }}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink sm:px-4"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
