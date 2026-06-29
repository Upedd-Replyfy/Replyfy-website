import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/ApiError.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query
  const query = { user: req.user._id }
  if (unreadOnly === 'true') query.isRead = false

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ])

  res.json({ success: true, notifications, unreadCount, pagination: { page: Number(page), total } })
})

export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { _id: { $in: req.body.ids || [req.params.id] }, user: req.user._id },
    { isRead: true }
  )
  res.json({ success: true, message: 'Marked as read' })
})

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
  res.json({ success: true, message: 'All marked as read' })
})
