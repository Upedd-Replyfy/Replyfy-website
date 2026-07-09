import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

function ChartCard({ title, subtitle, children, delay = 0, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      <div className={`w-full ${compact ? 'h-[200px]' : 'h-[240px]'}`}>{children}</div>
    </motion.div>
  )
}

const tooltipStyle = {
  contentStyle: {
    background: '#242727',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: '#a1a1aa' },
}

export default function AnalyticsSection({ charts, loading, compact = false }) {
  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="admin-panel h-[300px] animate-pulse rounded-[20px] bg-[#202323]" />
        ))}
      </div>
    )
  }

  const revenue = charts?.revenueByDay || []
  const questions = charts?.questionsByDay || []
  const answers = charts?.answersByDay || []
  const users = charts?.usersByDay || []
  const experts = charts?.expertsByDay || []
  const monthly = charts?.monthlyEarnings || []
  const weekly = charts?.weeklyActivity || []

  const qaMerged = questions.map((q, i) => ({
    label: q.label,
    questions: q.value,
    answers: answers[i]?.value ?? 0,
  }))

  const growthMerged = users.map((u, i) => ({
    label: u.label,
    users: u.value,
    experts: experts[i]?.value ?? 0,
  }))

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${compact ? 'lg:grid-cols-1' : 'xl:grid-cols-2'}`}>
        <ChartCard title="Revenue" subtitle="Last 14 days" delay={0.05} compact={compact}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Questions & Answers" subtitle="Daily volume" delay={0.1} compact={compact}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qaMerged}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="questions" stroke="#a78bfa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="answers" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User & Expert Growth" subtitle="New registrations" delay={0.15} compact={compact}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthMerged}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="users" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="experts" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Earnings" subtitle="Last 6 months" delay={0.2} compact={compact}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v}`, 'Earnings']} />
              <Bar dataKey="value" fill="url(#monthGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Weekly Activity" subtitle="Combined platform events" delay={0.25} compact={compact}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weekly}>
            <defs>
              <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="total" stroke="#a78bfa" fill="url(#weekGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
