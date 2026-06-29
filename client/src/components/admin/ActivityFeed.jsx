import { motion } from 'framer-motion'
import {
  UserPlus,
  BadgeCheck,
  HelpCircle,
  CheckCircle2,
  Wallet,
  CreditCard,
} from 'lucide-react'

const typeConfig = {
  user_joined: { icon: UserPlus, color: 'text-sky-400 bg-sky-500/10' },
  expert_verified: { icon: BadgeCheck, color: 'text-violet-400 bg-violet-500/10' },
  question_submitted: { icon: HelpCircle, color: 'text-cyan-400 bg-cyan-500/10' },
  answer_approved: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
  withdrawal_requested: { icon: Wallet, color: 'text-amber-400 bg-amber-500/10' },
  payment_completed: { icon: CreditCard, color: 'text-blue-400 bg-blue-500/10' },
}

function formatTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins || 1}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ActivityFeed({ activity = [], loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#111111]"
    >
      <div className="border-b border-white/[0.08] px-5 py-4">
        <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
        <p className="mt-0.5 text-xs text-muted">Live platform events</p>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-3 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No recent activity</p>
        ) : (
          <ul className="space-y-1">
            {activity.map((item, i) => {
              const config = typeConfig[item.type] || typeConfig.user_joined
              const Icon = config.icon
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full ${config.color}`}>
                      <Icon size={16} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                    <p className="truncate text-xs text-muted">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-light">{formatTime(item.at)}</span>
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </motion.div>
  )
}
