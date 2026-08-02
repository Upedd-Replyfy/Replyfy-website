import { Link } from 'react-router-dom'
import { FolderTree, Tags, UserPlus, Bell, CreditCard, Users, Wallet, Settings2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

const sections = [
  {
    title: 'Catalog',
    description: 'Structure how mentors and questions are organized',
    items: [
      { to: '/admin/categories', icon: FolderTree, label: 'Categories', desc: 'Manage question categories' },
      { to: '/admin/expert-types', icon: Tags, label: 'Mentor Types', desc: 'Roles within categories' },
    ],
  },
  {
    title: 'Directory',
    description: 'People on the platform',
    items: [
      { to: '/admin/experts?register=1', icon: UserPlus, label: 'Register Mentor', desc: 'Onboard new mentors' },
      { to: '/admin/users', icon: Users, label: 'Users', desc: 'Activate or deactivate accounts' },
    ],
  },
  {
    title: 'Finance & alerts',
    description: 'Money movement and messaging',
    items: [
      { to: '/admin/payments', icon: CreditCard, label: 'Payments', desc: 'View transactions' },
      { to: '/admin/withdrawals', icon: Wallet, label: 'Withdrawals', desc: 'Review mentor payouts' },
      { to: '/admin/notifications', icon: Bell, label: 'Notifications', desc: 'Send user messages' },
    ],
  },
]

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Settings"
        description="Catalog, operations, and configuration shortcuts"
      />

      <div className="admin-panel flex items-start gap-4 rounded-[20px] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-violet-500/8 to-transparent p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/60 text-sky-600 shadow-sm">
          <Settings2 size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Quick configuration</p>
          <p className="mt-1 text-sm text-muted">
            Jump into the admin areas you use most. Theme and profile controls live in the top bar.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-5"
          >
            <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
            <p className="mt-1 text-xs text-muted">{section.description}</p>
            <div className="mt-4 space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 transition-all hover:border-sky-500/30 hover:bg-sky-500/5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-violet-500/15 text-sky-500 transition group-hover:from-sky-500/25 group-hover:to-violet-500/25">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{item.label}</p>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
