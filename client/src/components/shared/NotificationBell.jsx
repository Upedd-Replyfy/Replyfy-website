import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { notificationApi } from '../../services/api'
import { formatDistanceToNow } from '../../utils/date'

const QUERY_KEY = ['notifications-inbox']

/**
 * Bell + dropdown. Opening the panel marks all notifications as read
 * so the badge resets to zero (user / mentor / admin).
 */
export default function NotificationBell({
  className = '',
  buttonClassName = '',
  panelClassName = '',
  badgeClassName = '',
  limit = 10,
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => notificationApi.getAll({ limit }),
    refetchInterval: 60000,
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          unreadCount: 0,
          notifications: (old.notifications || []).map((n) => ({ ...n, isRead: true })),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEY, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] })
    },
  })

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openPanel = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0 && !markAllMutation.isPending) {
      markAllMutation.mutate()
    }
  }

  const handleItemClick = (notification) => {
    setOpen(false)
    if (notification.link) navigate(notification.link)
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openPanel}
        className={
          buttonClassName ||
          'relative rounded-xl p-2.5 text-muted transition-colors hover:bg-surface hover:text-ink'
        }
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className={
              badgeClassName ||
              'absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-fg ring-2 ring-card'
            }
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={
              panelClassName ||
              'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-luxury-lg)]'
            }
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-muted-light">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface ${
                      !n.isRead ? 'bg-surface' : ''
                    }`}
                  >
                    <p className="text-xs font-medium text-ink">{n.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-light">
                      {formatDistanceToNow(n.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
