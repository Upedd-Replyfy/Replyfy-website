import { useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ExpertTopbar({ onMenuOpen }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#090909]/90 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-xl p-2.5 text-muted hover:bg-white/[0.06] hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm font-medium text-muted lg:text-base">
          Welcome back, <span className="text-ink">{user?.name}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await logout()
          navigate('/login', { replace: true })
        }}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </header>
  )
}
