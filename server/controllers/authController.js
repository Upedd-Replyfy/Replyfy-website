import { body } from 'express-validator'
import User from '../models/User.js'
import ExpertProfile from '../models/ExpertProfile.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/generateToken.js'
import { logAudit } from '../services/auditService.js'

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  isActive: user.isActive,
  createdAt: user.createdAt,
})

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) throw new ApiError(400, 'Email already registered')

  const user = await User.create({ name, email, password, role: 'user' })

  const token = signAccessToken(user._id, user.role)
  const refreshToken = signRefreshToken(user._id)
  user.refreshToken = refreshToken
  await user.save()

  await logAudit({
    action: 'user_registered',
    entityType: 'User',
    entityId: user._id,
    performedBy: user._id,
    ip: req.ip,
  })

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    refreshToken,
    user: sanitizeUser(user),
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password +refreshToken')
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password')
  }
  if (!user.isActive) throw new ApiError(403, 'Account deactivated')

  user.lastLogin = new Date()
  const token = signAccessToken(user._id, user.role)
  const refreshToken = signRefreshToken(user._id)
  user.refreshToken = refreshToken
  await user.save()

  let expertProfile = null
  if (user.role === 'expert') {
    expertProfile = await ExpertProfile.findOne({ user: user._id })
  }

  res.json({
    success: true,
    message: 'Login successful',
    token,
    refreshToken,
    user: sanitizeUser(user),
    expertProfile,
  })
})

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) throw new ApiError(400, 'Refresh token required')

  const decoded = verifyRefreshToken(refreshToken)
  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const token = signAccessToken(user._id, user.role)
  const newRefresh = signRefreshToken(user._id)
  user.refreshToken = newRefresh
  await user.save()

  res.json({ success: true, token, refreshToken: newRefresh })
})

export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshToken')
  user.refreshToken = undefined
  await user.save()
  res.json({ success: true, message: 'Logged out' })
})

export const getProfile = asyncHandler(async (req, res) => {
  let expertProfile = null
  if (req.user.role === 'expert') {
    expertProfile = await ExpertProfile.findOne({ user: req.user._id })
      .populate('category', 'name slug')
      .populate('expertType', 'name slug')
  }
  res.json({ success: true, user: sanitizeUser(req.user), expertProfile })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body
  const user = await User.findById(req.user._id)
  if (name) user.name = name
  if (phone !== undefined) user.phone = phone
  if (avatar !== undefined) user.avatar = avatar
  await user.save()
  res.json({ success: true, user: sanitizeUser(user) })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect')
  }
  user.password = newPassword
  await user.save()
  res.json({ success: true, message: 'Password updated' })
})

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
]
