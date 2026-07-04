import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useShellTheme } from '../../context/ShellThemeContext'

export default function ExpertTopbar({ onMenuOpen }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useShellTheme()

  return (
    <header className="expert-topbar sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-xl p-2.5 text-muted hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm font-medium text-muted lg:text-base">
          Welcome back, <span className="text-ink">{user?.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
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
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  )
}
