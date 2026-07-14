import Question from '../models/Question.js'
import Payment from '../models/Payment.js'
import Category from '../models/Category.js'
import User from '../models/User.js'
import { ApiError, asyncHandler } from '../utils/ApiError.js'
import { getPlanAmount, planRequiresExpertSelection } from '../constants/pricing.js'
import { env } from '../config/env.js'
import { getRazorpay, verifyPaymentSignature } from '../config/razorpay.js'
import { uploadFiles } from '../utils/uploadFiles.js'
import { createNotification, notifyAdmins } from '../services/notificationService.js'
import { logAudit } from '../services/auditService.js'
import { validateCoupon, incrementCouponUsage } from '../services/couponService.js'

export const initiateQuestion = asyncHandler(async (req, res) => {
  const { title, description, category, expertType, priority, plan, selectedExpert } = req.body

  const cat = await Category.findById(category)
  if (!cat || !cat.isActive) throw new ApiError(400, 'Invalid category')

  const ExpertType = (await import('../models/ExpertType.js')).default
  const type = await ExpertType.findById(expertType)
  if (!type || !type.isActive || type.category.toString() !== category.toString()) {
    throw new ApiError(400, 'Invalid mentor type for this category')
  }

  if (planRequiresExpertSelection(plan) && !selectedExpert) {
    throw new ApiError(400, 'This plan requires mentor selection')
  }

  if (planRequiresExpertSelection(plan) && selectedExpert) {
    const ExpertProfile = (await import('../models/ExpertProfile.js')).default
    const profile = await ExpertProfile.findOne({
      user: selectedExpert,
      category,
      expertType,
      availability: 'available',
      status: 'active',
    })
    if (!profile) throw new ApiError(400, 'Selected mentor is not available for this category and type')
  }

  const amount = getPlanAmount(plan)
  const attachments = await uploadFiles(req.files, 'replyfy/questions')

  const question = await Question.create({
    user: req.user._id,
    title,
    description,
    category,
    expertType,
    priority: priority || 'standard',
    plan,
    selectedExpert: planRequiresExpertSelection(plan) ? selectedExpert : undefined,
    attachments,
    status: 'pending_payment',
    amount,
  })

  res.status(201).json({ success: true, question })
})

export const validateCouponCode = asyncHandler(async (req, res) => {
  const { code, plan } = req.body
  if (!plan) throw new ApiError(400, 'Plan is required')

  const result = await validateCoupon({ code, plan })
  res.json({ success: true, coupon: result })
})

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { questionId, couponCode } = req.body
  const question = await Question.findOne({ _id: questionId, user: req.user._id })
  if (!question) throw new ApiError(404, 'Question not found')
  if (question.status !== 'pending_payment') {
    throw new ApiError(400, 'Question is not pending payment')
  }

  let payableAmount = question.amount
  let discountAmount = 0
  let appliedCouponCode = ''

  if (couponCode) {
    const coupon = await validateCoupon({
      code: couponCode,
      plan: question.plan,
      amountPaise: question.amount,
    })
    payableAmount = coupon.finalAmount
    discountAmount = coupon.discountAmount
    appliedCouponCode = coupon.code

    question.originalAmount = question.amount
    question.discountAmount = discountAmount
    question.couponCode = appliedCouponCode
    question.amount = payableAmount
    await question.save()
  }

  const razorpay = getRazorpay()
  if (!razorpay) {
    // Dev mode without Razorpay keys
    const payment = await Payment.create({
      user: req.user._id,
      question: question._id,
      plan: question.plan,
      amount: payableAmount,
      originalAmount: question.originalAmount || question.amount,
      discountAmount,
      couponCode: appliedCouponCode,
      razorpayOrderId: `dev_order_${question._id}`,
      status: 'created',
    })
    return res.json({
      success: true,
      devMode: true,
      orderId: payment.razorpayOrderId,
      amount: payableAmount,
      discountAmount,
      currency: 'INR',
      key: 'dev',
      paymentId: payment._id,
    })
  }

  const order = await razorpay.orders.create({
    amount: payableAmount,
    currency: 'INR',
    receipt: `q_${question._id}`,
    notes: { questionId: question._id.toString(), userId: req.user._id.toString() },
  })

  const payment = await Payment.create({
    user: req.user._id,
    question: question._id,
    plan: question.plan,
    amount: payableAmount,
    originalAmount: question.originalAmount || payableAmount,
    discountAmount,
    couponCode: appliedCouponCode,
    razorpayOrderId: order.id,
    status: 'created',
  })

  res.json({
    success: true,
    orderId: order.id,
    amount: payableAmount,
    discountAmount,
    currency: 'INR',
    key: env.razorpay.keyId,
    paymentId: payment._id,
  })
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, questionId } = req.body

  const payment = await Payment.findOne({ razorpayOrderId, user: req.user._id })
  if (!payment) throw new ApiError(404, 'Payment not found')

  const razorpay = getRazorpay()
  if (razorpay) {
    const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!valid) throw new ApiError(400, 'Invalid payment signature')
  }

  payment.razorpayPaymentId = razorpayPaymentId || 'dev_payment'
  payment.razorpaySignature = razorpaySignature || 'dev_sig'
  payment.status = 'paid'

  const question = await Question.findById(questionId || payment.question)
  if (!question || question.user.toString() !== req.user._id.toString()) {
    throw new ApiError(404, 'Question not found')
  }

  question.status = 'pending_admin_review'
  question.payment = payment._id
  await question.save()
  payment.question = question._id
  await payment.save()

  if (payment.couponCode) {
    await incrementCouponUsage(payment.couponCode)
  }

  await createNotification({
    userId: req.user._id,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Your payment of ₹${question.amount / 100} was successful. Question is pending admin review.`,
    link: `/dashboard/questions/${question._id}`,
    email: req.user.email,
  })

  await createNotification({
    userId: req.user._id,
    type: 'question_submitted',
    title: 'Question Submitted',
    message: 'Your question has been submitted and is awaiting admin review.',
    link: `/dashboard/questions/${question._id}`,
    email: req.user.email,
  })

  const admins = await User.find({ role: 'admin', isActive: true })
  await notifyAdmins({
    type: 'question_submitted',
    title: 'New Question for Review',
    message: `New question "${question.title}" requires admin review.`,
    link: `/admin/questions/${question._id}`,
    admins,
  })

  await logAudit({
    action: 'payment_verified',
    entityType: 'Payment',
    entityId: payment._id,
    performedBy: req.user._id,
    metadata: { questionId: question._id },
    ip: req.ip,
  })

  res.json({ success: true, message: 'Payment verified', question, payment })
})

export const getMyQuestions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const query = { user: req.user._id }
  if (status) query.status = status

  const [questions, total] = await Promise.all([
    Question.find(query)
      .populate('category', 'name slug')
      .populate('expertType', 'name slug')
      .populate('assignedExpert', 'name avatar')
      .populate('selectedExpert', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Question.countDocuments(query),
  ])

  res.json({
    success: true,
    questions,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  })
})

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, user: req.user._id })
    .populate('category')
    .populate('assignedExpert', 'name avatar')
    .populate('selectedExpert', 'name avatar')
    .populate('payment')

  if (!question) throw new ApiError(404, 'Question not found')

  let answer = null
  if (question.status === 'completed') {
    const Answer = (await import('../models/Answer.js')).default
    answer = await Answer.findOne({ question: question._id, status: 'approved' })
  }

  res.json({ success: true, question, answer })
})

export const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('question', 'title status')
    .sort({ createdAt: -1 })
  res.json({ success: true, payments })
})
