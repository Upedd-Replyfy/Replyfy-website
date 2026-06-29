import { LayoutDashboard, HelpCircle, Wallet } from 'lucide-react'

export const EXPERT_NAV = [
  { to: '/expert', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expert/questions', label: 'Questions', icon: HelpCircle },
  { to: '/expert/wallet', label: 'Wallet', icon: Wallet },
]
