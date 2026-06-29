import { Router } from 'express'
import {
  getCategories,
  getExpertTypes,
  getExperts,
  getExpertById,
  getPlatformStats,
} from '../controllers/publicController.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/expert-types', getExpertTypes)
router.get('/experts', getExperts)
router.get('/experts/:id', getExpertById)
router.get('/stats', getPlatformStats)

export default router
