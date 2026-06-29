import { NavLink } from 'react-router-dom'
import Logo from '../ui/Logo'
import { EXPERT_NAV } from './expertNav'

export default function ExpertSidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-[248px] flex-col border-r border-white/[0.08] bg-[#0a0a0a]/98 backdrop-blur-xl">
      <div className="flex h-16 items-center border-b border-white/[0.08] px-6">
        <Logo />
      </div>
      <div className="px-4 py-5">
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
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/15 to-violet-500/10 text-ink shadow-[inset_0_0_0_1px_rgba(56,189,248,0.2)]'
                      : 'text-muted hover:bg-white/[0.04] hover:text-ink'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
