import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { protect } from '../middleware/auth.js'
import { loginRegisterLimiter } from '../middleware/rateLimiter.js'
import {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  registerValidation,
  loginValidation,
} from '../controllers/authController.js'

const router = Router()

router.post('/register', loginRegisterLimiter, registerValidation, validate, register)
router.post('/login', loginRegisterLimiter, loginValidation, validate, login)
router.post('/refresh', refresh)
router.post('/logout', protect, logout)
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, changePassword)

export default router
