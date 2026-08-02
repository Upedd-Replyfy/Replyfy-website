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
  { label: 'Register Mentor', icon: UserPlus, to: '/admin/experts?register=1' },
  { label: 'Review Questions', icon: CircleHelp, to: '/admin/questions' },
  { label: 'Review Answers', icon: MessageSquare, to: '/admin/answers' },
  { label: 'Process Withdrawals', icon: Wallet, to: '/admin/withdrawals' },
  { label: 'Manage Categories', icon: FolderTree, to: '/admin/categories' },
  { label: 'Mentor Types', icon: Tags, to: '/admin/expert-types' },
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
        className="admin-btn-gradient inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white sm:px-4"
        aria-expanded={open}
        aria-haspopup="menu"
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
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,360px)] w-[min(15rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-border bg-white py-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
          >
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false)
                    if (action.to.includes('register=1') && onRegisterExpert) {
                      onRegisterExpert()
                    } else {
                      navigate(action.to)
                    }
                  }}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={15} />
                  </span>
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
