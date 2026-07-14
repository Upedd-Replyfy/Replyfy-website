import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderTree, Tags, UserPlus, Bell, CreditCard } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

const sections = [
  {
    title: 'Catalog',
    items: [
      { to: '/admin/categories', icon: FolderTree, label: 'Categories', desc: 'Manage question categories' },
      { to: '/admin/expert-types', icon: Tags, label: 'Mentor Types', desc: 'Roles within categories' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/experts?register=1', icon: UserPlus, label: 'Register Mentor', desc: 'Onboard new mentors' },
      { to: '/admin/notifications', icon: Bell, label: 'Notifications', desc: 'Send user messages' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payments', desc: 'View transactions' },
    ],
  },
]

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Platform" title="Settings" description="Catalog, operations, and configuration" />

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-5">
            <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
            <div className="mt-4 space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-sky-500/30 hover:bg-sky-500/5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
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
