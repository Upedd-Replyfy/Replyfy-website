import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import Logo, { LogoMark } from '../ui/Logo'
import { ADMIN_NAV_GROUPS } from './adminNav'

export default function AdminSidebar({ collapsed, onToggle, floating = false }) {
  return (
    <aside
      className={`admin-sidebar z-40 flex h-full flex-col bg-card/95 backdrop-blur-xl transition-all duration-300 ${
        floating
          ? `fixed top-3 bottom-3 left-3 rounded-[20px] border border-border ${
              collapsed ? 'w-[84px]' : 'w-[268px]'
            }`
          : `fixed inset-y-0 left-0 h-full border-r border-border ${
              collapsed ? 'w-[84px]' : 'w-[268px]'
            }`
      }`}
    >
      <div
        className={`relative flex h-[64px] shrink-0 items-center ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        {!collapsed && <Logo admin className="scale-[0.88]" surface="adaptive" />}
        {collapsed && (
          <Link to="/admin" className="flex h-10 w-10 items-center justify-center" aria-label="Replyfy Admin">
            <LogoMark className="h-9 w-9 object-contain" />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-white text-muted shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 ${
            collapsed ? 'absolute -right-3 top-5 z-50 hidden lg:flex' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Close menu'}
        >
          <span className="lg:hidden">
            <X size={14} />
          </span>
          <span className="hidden lg:inline-flex">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-3">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-auto mb-2 h-px w-7 bg-border" aria-hidden />}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'admin-nav-active text-indigo-700'
                          : 'text-slate-500 hover:text-slate-900'
                      } ${collapsed ? 'justify-center px-2' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="admin-nav-glow"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/15 via-indigo-400/10 to-blue-400/5 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.18)]"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                            isActive
                              ? 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-[0_8px_16px_rgba(79,70,229,0.28)]'
                              : 'bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm'
                          }`}
                        >
                          <Icon size={16} strokeWidth={isActive ? 2.25 : 1.85} />
                        </span>
                        {!collapsed && (
                          <span className="relative z-10 truncate tracking-tight">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="shrink-0 p-3">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-3.5">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-indigo-400/20 blur-2xl" />
            <div className="relative flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3B82F6] text-white shadow-sm">
                <Sparkles size={14} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Replyfy Admin</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Monitor health, reviews, and revenue in real time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
