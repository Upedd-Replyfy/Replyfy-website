import { motion } from 'framer-motion'
import { IndianRupee, HelpCircle, MessageSquare, UserCheck, ClipboardList, Server } from 'lucide-react'
import { formatRupee } from '../../utils/currency'

function QuickStat({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-[11px] text-muted">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  )
}

export default function QuickStatsPanel({ stats, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="admin-panel space-y-4 rounded-[20px] border border-white/[0.08] bg-[#202323] p-5"
    >
      <div>
        <h3 className="text-sm font-semibold text-ink">Quick Stats</h3>
        <p className="mt-0.5 text-xs text-muted">Today at a glance</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <QuickStat
            icon={IndianRupee}
            label="Today's Revenue"
            value={formatRupee(stats?.todayRevenue)}
            accent="bg-emerald-500/10 text-emerald-400"
          />
          <QuickStat
            icon={HelpCircle}
            label="Today's Questions"
            value={stats?.todayQuestions ?? 0}
            accent="bg-sky-500/10 text-sky-400"
          />
          <QuickStat
            icon={MessageSquare}
            label="Today's Answers"
            value={stats?.todayAnswers ?? 0}
            accent="bg-violet-500/10 text-violet-400"
          />
          <QuickStat
            icon={UserCheck}
            label="Online Experts"
            value={stats?.onlineExperts ?? 0}
            accent="bg-cyan-500/10 text-cyan-400"
          />
          <QuickStat
            icon={ClipboardList}
            label="Pending Reviews"
            value={(stats?.pendingQuestions ?? 0) + (stats?.pendingAnswers ?? 0)}
            accent="bg-amber-500/10 text-amber-400"
          />
        </div>
      )}

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-emerald-400" />
          <p className="text-sm font-medium text-ink">Server Status</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <p className="text-xs text-emerald-300">All systems operational</p>
        </div>
        <p className="mt-2 text-[11px] text-muted">API · Database · Payments</p>
      </div>
    </motion.div>
  )
}
