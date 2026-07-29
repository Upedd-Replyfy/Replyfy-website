import { Router } from 'express'
import { PLAN_IDS } from '../constants/pricing.js'
import { body } from 'express-validator'
import { protect, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { upload } from '../middleware/upload.js'
import { paymentLimiter } from '../middleware/rateLimiter.js'
import {
  initiateQuestion,
  createPaymentOrder,
  verifyPayment,
  validateCouponCode,
  getMyQuestions,
  getQuestionById,
  getPaymentHistory,
} from '../controllers/userController.js'
import { submitRating, getQuestionRating } from '../controllers/ratingController.js'

const router = Router()

router.use(protect, authorize('user'))

router.post(
  '/questions',
  upload.array('files', 5),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').notEmpty(),
    body('expertType').notEmpty(),
    body('plan').isIn(PLAN_IDS),
  ],
  validate,
  initiateQuestion
)

router.post(
  '/payments/validate-coupon',
  paymentLimiter,
  [body('code').trim().notEmpty(), body('plan').isIn(PLAN_IDS)],
  validate,
  validateCouponCode
)
router.post(
  '/payments/create-order',
  paymentLimiter,
  body('questionId').notEmpty(),
  validate,
  createPaymentOrder
)
router.post(
  '/payments/verify',
  paymentLimiter,
  [
    body('razorpayOrderId').trim().notEmpty(),
    body('razorpayPaymentId').optional().isString(),
    body('razorpaySignature').optional().isString(),
    body('questionId').optional().isString(),
  ],
  validate,
  verifyPayment
)
router.get('/questions', getMyQuestions)
router.get('/questions/:id', getQuestionById)
router.get('/payments', getPaymentHistory)
router.post('/ratings', body('questionId').notEmpty(), body('stars').isInt({ min: 1, max: 5 }), validate, submitRating)
router.get('/ratings/:questionId', getQuestionRating)

export default router
