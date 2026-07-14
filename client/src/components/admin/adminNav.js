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

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/questions', label: 'Questions', icon: CircleHelp },
  { to: '/admin/answers', label: 'Answers', icon: MessageSquare },
  { to: '/admin/experts', label: 'Mentors', icon: UserCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/expert-types', label: 'Mentor Types', icon: Tags },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]
