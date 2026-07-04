import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Logo from '../ui/Logo'
import { ADMIN_NAV } from './adminNav'

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      <div className={`flex h-16 items-center border-b border-border ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        {!collapsed && <Logo admin className="scale-90" light={false} />}
        {collapsed && (
          <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-fg">
            R
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`hidden rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink lg:flex ${collapsed ? 'absolute -right-3 top-5 z-50 bg-card' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'admin-nav-active text-ink'
                    : 'text-muted hover:bg-surface hover:text-ink'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-glow"
                      className="absolute inset-0 rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-cyan-500/5 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10 shrink-0" />
                  {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-4">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 to-violet-500/10 p-4">
            <p className="text-xs font-semibold text-ink">Replyfy Admin</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Monitor platform health, reviews, and revenue in real time.
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
