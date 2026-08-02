import {
  LayoutDashboard,
  BarChart3,
  CircleHelp,
  MessageSquare,
  Users,
  UserCheck,
  CreditCard,
  Wallet,
  Bell,
  Settings,
  FolderTree,
  Tags,
} from 'lucide-react'

export const ADMIN_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'moderation',
    label: 'Moderation',
    items: [
      { to: '/admin/questions', label: 'Questions', icon: CircleHelp },
      { to: '/admin/answers', label: 'Answers', icon: MessageSquare },
    ],
  },
  {
    id: 'directory',
    label: 'Directory',
    items: [
      { to: '/admin/experts', label: 'Mentors', icon: UserCheck },
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      { to: '/admin/expert-types', label: 'Mentor Types', icon: Tags },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

/** Flat list kept for search / quick actions consumers */
export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items)
