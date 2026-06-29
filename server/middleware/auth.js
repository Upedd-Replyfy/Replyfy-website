import User from '../models/User.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/generateToken.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token = null
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) throw new ApiError(401, 'Not authorized, token missing')

  try {
    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) throw new ApiError(401, 'User not found or deactivated')
    req.user = user
    next()
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(401, 'Not authorized, token invalid')
  }
})

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action')
    }
    next()
  })
