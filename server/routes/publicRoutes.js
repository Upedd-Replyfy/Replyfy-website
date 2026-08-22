import { Router } from 'express'
import {
  getCategories,
  getExpertTypes,
  getExperts,
  getExpertById,
  getPlatformStats,
  getPlatformSettings,
} from '../controllers/publicController.js'
import { listPublicPlans } from '../controllers/planController.js'
import { listPublicBlogs, getPublicBlog } from '../controllers/blogController.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/expert-types', getExpertTypes)
router.get('/experts', getExperts)
router.get('/experts/:id', getExpertById)
router.get('/stats', getPlatformStats)
router.get('/settings', getPlatformSettings)
router.get('/plans', listPublicPlans)
router.get('/blogs', listPublicBlogs)
router.get('/blogs/:slug', getPublicBlog)

export default router
