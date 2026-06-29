import { Router } from 'express'
import authRoutes from './authRoutes.js'
import publicRoutes from './publicRoutes.js'
import userRoutes from './userRoutes.js'
import expertRoutes from './expertRoutes.js'
import adminRoutes from './adminRoutes.js'
import notificationRoutes from './notificationRoutes.js'
import {
  getCategories,
  getExpertTypes,
  getExperts,
  getPlatformStats,
} from '../controllers/publicController.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/expert-types', getExpertTypes)
router.get('/experts', getExperts)
router.get('/stats', getPlatformStats)

router.use('/auth', authRoutes)
router.use('/public', publicRoutes)
router.use('/users', userRoutes)
router.use('/expert', expertRoutes)
router.use('/admin', adminRoutes)
router.use('/notifications', notificationRoutes)

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Replyfy API is running', timestamp: new Date().toISOString() })
})

export default router
