import { Router } from 'express'
import { body } from 'express-validator'
import { protect, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { upload } from '../middleware/upload.js'
import {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  createExpert,
  getExperts,
  updateExpert,
  deleteExpert,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getExpertTypes,
  createExpertType,
  updateExpertType,
  deleteExpertType,
  getPendingQuestions,
  getAllQuestions,
  approveQuestion,
  rejectQuestion,
  assignExpertManual,
  getPendingAnswers,
  approveAnswer,
  rejectAnswer,
  getPayments,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  sendNotification,
} from '../controllers/adminController.js'

const router = Router()

router.use(protect, authorize('admin'))

router.get('/dashboard', getDashboardStats)
router.get('/users', getUsers)
router.patch('/users/:id/toggle', toggleUserStatus)

router.post(
  '/experts',
  upload.single('photo'),
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('category').notEmpty(), body('expertType').notEmpty()],
  validate,
  createExpert
)
router.get('/experts', getExperts)
router.put('/experts/:id', upload.single('photo'), updateExpert)
router.delete('/experts/:id', deleteExpert)

router.post('/categories', body('name').notEmpty(), validate, createCategory)
router.get('/categories', getCategories)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/expert-types', getExpertTypes)
router.post('/expert-types', [body('name').notEmpty(), body('category').notEmpty()], validate, createExpertType)
router.put('/expert-types/:id', updateExpertType)
router.delete('/expert-types/:id', deleteExpertType)

router.get('/questions/pending', getPendingQuestions)
router.get('/questions', getAllQuestions)
router.post('/questions/:id/approve', approveQuestion)
router.post('/questions/:id/reject', body('reason').optional(), validate, rejectQuestion)
router.post('/questions/:id/assign', body('expertId').notEmpty(), validate, assignExpertManual)

router.get('/answers/pending', getPendingAnswers)
router.post('/answers/:id/approve', approveAnswer)
router.post('/answers/:id/reject', rejectAnswer)

router.get('/payments', getPayments)
router.get('/withdrawals', getWithdrawals)
router.post('/withdrawals/:id/approve', approveWithdrawal)
router.post('/withdrawals/:id/reject', rejectWithdrawal)

router.post('/notifications', sendNotification)

export default router
