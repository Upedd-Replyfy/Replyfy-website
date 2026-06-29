import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Clock, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import QuestionComposer from './QuestionComposer'
import PlanSelector from './PlanSelector'
import ExpertPicker from './ExpertPicker'
import PaymentStep from './PaymentStep'
import StepProgress from './StepProgress'
import RecommendedExperts from './RecommendedExperts'
import RecentQuestions from './RecentQuestions'
import { userApi } from '../../services/api'
import { PLANS, planRequiresExpertSelection } from '../../constants'
import { useCategories, useExpertTypes, useExperts, usePlatformStats } from '../../hooks/useCatalog'
import { fadeUp } from '../../utils/animations'

const trustIcons = [ShieldCheck, Clock, MessageSquare]

function formatRelativeTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins || 1}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function mapQuestionStatus(status) {
  const map = {
    completed: 'answered',
    in_progress: 'matched',
    assigned: 'matched',
    waiting_admin_review: 'in_review',
    pending_admin_review: 'in_review',
    pending_payment: 'draft',
    rejected: 'draft',
    cancelled: 'draft',
  }
  return map[status] || 'draft'
}

function mapApiQuestion(q) {
  return {
    id: q._id,
    title: q.title,
    preview: q.description?.slice(0, 120) || '',
    categoryLabel: q.category?.name,
    expertTypeLabel: q.expertType?.name,
    status: mapQuestionStatus(q.status),
    time: formatRelativeTime(q.createdAt),
  }
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState('compose')
  const [categoryId, setCategoryId] = useState(null)
  const [expertTypeId, setExpertTypeId] = useState(null)
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState([])
  const [links, setLinks] = useState([])
  const [plan, setPlan] = useState('basic')
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [paying, setPaying] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: expertTypes = [], isLoading: expertTypesLoading } = useExpertTypes(categoryId)
  const { data: stats } = usePlatformStats()

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === categoryId),
    [categories, categoryId]
  )
  const selectedExpertType = useMemo(
    () => expertTypes.find((t) => t._id === expertTypeId),
    [expertTypes, expertTypeId]
  )

  const { data: questionsData, refetch: refetchQuestions } = useQuery({
    queryKey: ['my-questions'],
    queryFn: () => userApi.getQuestions({ limit: 6 }),
  })

  const premiumExpertParams = useMemo(
    () =>
      categoryId && expertTypeId
        ? { category: categoryId, expertType: expertTypeId, availability: 'available', limit: 20, sort: 'rating' }
        : null,
    [categoryId, expertTypeId]
  )

  const {
    data: premiumExpertsData,
    isLoading: premiumExpertsLoading,
    error: premiumExpertsError,
    refetch: refetchPremiumExperts,
  } = useExperts(premiumExpertParams, step === 'expert' && planRequiresExpertSelection(plan) && !!premiumExpertParams)

  const recommendedParams = useMemo(
    () =>
      categoryId && expertTypeId
        ? { category: categoryId, expertType: expertTypeId, availability: 'available', limit: 4, sort: 'rating' }
        : null,
    [categoryId, expertTypeId]
  )

  const { data: recommendedData, isLoading: recommendedLoading } = useExperts(
    recommendedParams,
    step === 'compose' && !!recommendedParams
  )

  const recentQuestions = useMemo(
    () => (questionsData?.questions || []).map(mapApiQuestion),
    [questionsData]
  )

  const trustIndicators = useMemo(() => {
    if (!stats) return null
    return [
      { value: `${stats.experts}+`, label: 'Verified experts' },
      { value: `${stats.avgResponseHours}h`, label: 'Avg response' },
      { value: `${stats.answers.toLocaleString()}+`, label: 'Questions answered' },
    ]
  }, [stats])

  useEffect(() => {
    if (categories.length && !categoryId) {
      setCategoryId(categories[0]._id)
    }
  }, [categories, categoryId])

  useEffect(() => {
    if (expertTypes.length) {
      setExpertTypeId((prev) => (expertTypes.some((t) => t._id === prev) ? prev : expertTypes[0]._id))
    } else {
      setExpertTypeId(null)
    }
  }, [expertTypes])

  useEffect(() => {
    if (location.state?.reset) {
      setStep('compose')
      setQuery('')
      setFiles([])
      setLinks([])
      setPlan('basic')
      setSelectedExpert(null)
      setAppliedCoupon(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate('/dashboard', { replace: true, state: {} })
    }
  }, [location.state?.reset, navigate])

  useEffect(() => {
    setAppliedCoupon(null)
  }, [plan])

  const handleCategoryChange = (cat) => {
    setCategoryId(cat._id)
    setExpertTypeId(null)
    setSelectedExpert(null)
  }

  const handleComposeSubmit = () => {
    if (!query.trim()) return toast.error('Please describe your question')
    if (!categoryId) return toast.error('Please select a category')
    if (!expertTypeId) return toast.error('Please select an expert type')
    setStep('plan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlanContinue = () => {
    setStep(planRequiresExpertSelection(plan) ? 'expert' : 'payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExpertContinue = () => {
    if (!selectedExpert) return toast.error('Please select an expert')
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (step === 'plan') setStep('compose')
    else if (step === 'expert') setStep('plan')
    else if (step === 'payment') setStep(planRequiresExpertSelection(plan) ? 'expert' : 'plan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePayment = async () => {
    setPaying(true)
    try {
      const title = query.split('\n')[0].slice(0, 120)
      if (!categoryId || !expertTypeId) return toast.error('Missing category or expert type')

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', query)
      formData.append('category', categoryId)
      formData.append('expertType', expertTypeId)
      formData.append('priority', 'standard')
      formData.append('plan', plan)
      if (planRequiresExpertSelection(plan) && selectedExpert) {
        formData.append('selectedExpert', selectedExpert.userId)
      }
      files.forEach((f) => formData.append('files', f))

      const { question } = await userApi.createQuestion(formData)
      const order = await userApi.createPaymentOrder(question._id, appliedCoupon?.code)

      if (order.devMode) {
        await userApi.verifyPayment({
          razorpayOrderId: order.orderId,
          razorpayPaymentId: 'dev_payment',
          razorpaySignature: 'dev_sig',
          questionId: question._id,
        })
        toast.success('Question submitted successfully')
        await refetchQuestions()
        navigate(`/dashboard/questions/${question._id}`)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'Replyfy',
          description: `${PLANS[plan].name} Plan Question`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              await userApi.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                questionId: question._id,
              })
              toast.success('Payment successful!')
              await refetchQuestions()
              navigate(`/dashboard/questions/${question._id}`)
            } catch (err) {
              toast.error(err.message)
            }
          },
          theme: { color: '#111111' },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPaying(false)
    }
  }

  if (step !== 'compose') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex w-full flex-1 flex-col px-6 py-8 lg:px-10 xl:px-12"
      >
        <div className="w-full">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <StepProgress current={step} plan={plan} />

          {step === 'plan' && (
            <PlanSelector plan={plan} onSelect={setPlan} onContinue={handlePlanContinue} />
          )}
          {step === 'expert' && (
            <ExpertPicker
              experts={premiumExpertsData?.experts || []}
              selected={selectedExpert}
              onSelect={setSelectedExpert}
              onContinue={handleExpertContinue}
              loading={premiumExpertsLoading}
              error={premiumExpertsError?.message}
              onRetry={refetchPremiumExperts}
            />
          )}
          {step === 'payment' && (
            <PaymentStep
              plan={plan}
              category={selectedCategory}
              expertType={selectedExpertType}
              selectedExpert={selectedExpert}
              paying={paying}
              appliedCoupon={appliedCoupon}
              onCouponChange={setAppliedCoupon}
              onPay={handlePayment}
            />
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex w-full flex-1 flex-col px-6 py-4 lg:px-10 xl:px-12"
    >
      <QuestionComposer
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoryId={categoryId}
        onCategoryChange={handleCategoryChange}
        expertTypes={expertTypes}
        expertTypesLoading={expertTypesLoading}
        expertTypeId={expertTypeId}
        onExpertTypeChange={(type) => setExpertTypeId(type._id)}
        selectedCategory={selectedCategory}
        query={query}
        onQueryChange={setQuery}
        files={files}
        onFilesChange={setFiles}
        links={links}
        onLinksChange={setLinks}
        onSubmit={handleComposeSubmit}
        loading={false}
      />

      {trustIndicators && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-12 flex w-full flex-wrap items-center justify-center gap-3 border-t border-border pt-10"
        >
          {trustIndicators.map((item, i) => {
            const Icon = trustIcons[i]
            return (
              <div key={item.label} className="luxury-card flex items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-ink">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.value}</p>
                  <p className="text-[11px] text-muted-light">{item.label}</p>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}

      <div className="w-full">
        <RecommendedExperts
          experts={recommendedData?.experts || []}
          loading={recommendedLoading}
          categoryName={selectedCategory?.name}
          expertTypeName={selectedExpertType?.name}
        />

        {recentQuestions.length > 0 && (
          <RecentQuestions
            questions={recentQuestions}
            onSelect={(q) => navigate(`/dashboard/questions/${q.id}`)}
          />
        )}
      </div>
    </motion.div>
  )
}
