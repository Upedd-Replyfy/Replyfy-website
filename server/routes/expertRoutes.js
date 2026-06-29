import { Router } from 'express'
import { body } from 'express-validator'
import { protect, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { upload } from '../middleware/upload.js'
import {
  getDashboard,
  getAssignedQuestions,
  getQuestionDetail,
  startQuestion,
  submitAnswer,
  updateExpertProfile,
  getWallet,
  requestWithdrawal,
  getRatings,
} from '../controllers/expertController.js'

const router = Router()

router.use(protect, authorize('expert'))

router.get('/dashboard', getDashboard)
router.get('/questions', getAssignedQuestions)
router.get('/questions/:id', getQuestionDetail)
router.patch('/questions/:id/start', startQuestion)
router.post('/questions/:id/answer', upload.array('files', 5), body('content').trim().notEmpty(), validate, submitAnswer)
router.put('/profile', updateExpertProfile)
router.get('/wallet', getWallet)
router.post('/wallet/withdraw', body('amount').isInt({ min: 1 }), validate, requestWithdrawal)
router.get('/ratings', getRatings)

export default router
