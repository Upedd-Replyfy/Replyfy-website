import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  UserPlus,
  CircleHelp,
  MessageSquare,
  Wallet,
  FolderTree,
  Tags,
} from 'lucide-react'

const actions = [
  { label: 'Register Expert', icon: UserPlus, to: '/admin/experts?register=1' },
  { label: 'Review Questions', icon: CircleHelp, to: '/admin/questions' },
  { label: 'Review Answers', icon: MessageSquare, to: '/admin/answers' },
  { label: 'Process Withdrawals', icon: Wallet, to: '/admin/withdrawals' },
  { label: 'Manage Categories', icon: FolderTree, to: '/admin/categories' },
  { label: 'Expert Types', icon: Tags, to: '/admin/expert-types' },
]

export default function QuickActionsMenu({ onRegisterExpert }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        className="admin-btn-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Quick Actions</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] py-1 shadow-2xl"
          >
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    if (action.to.includes('register=1') && onRegisterExpert) {
                      onRegisterExpert()
                    } else {
                      navigate(action.to)
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-white/[0.06]"
                >
                  <Icon size={16} className="text-sky-400" />
                  {action.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
