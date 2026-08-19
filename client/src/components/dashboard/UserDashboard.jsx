import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import QuestionComposer from './QuestionComposer'
import PlanSelector from './PlanSelector'
import ExpertPicker from './ExpertPicker'
import PaymentStep from './PaymentStep'
import StepProgress from './StepProgress'
import RecommendedExperts from './RecommendedExperts'
import RecentQuestions from './RecentQuestions'
import { userApi } from '../../services/api'
import { PLANS, planRequiresExpertSelection, resolvePlan } from '../../constants'
import { useCategories, useExpertTypes, useExperts, usePlatformSettings, usePlans } from '../../hooks/useCatalog'
import { clearQuestionDraft, loadQuestionDraft, namesMatch } from '../../utils/questionDraft'
import { payForQuestion } from '../../utils/payForQuestion'

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
    answered: Boolean(q.answered || q.status === 'completed'),
    time: formatRelativeTime(q.createdAt),
  }
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState('compose')
  const [categoryId, setCategoryId] = useState(null)
  const [expertTypeId, setExpertTypeId] = useState(null)
  const [query, setQuery] = useState(() => {
    const draft = loadQuestionDraft()
    return draft?.query?.trim() ? draft.query : ''
  })
  const [files, setFiles] = useState([])
  const [links, setLinks] = useState([])
  const [plan, setPlan] = useState('basic')
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [paying, setPaying] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const pendingDraftRef = useRef(null)
  const draftHydratedRef = useRef(false)
  const draftInitRef = useRef(false)

  if (!draftInitRef.current) {
    draftInitRef.current = true
    const draft = loadQuestionDraft()
    if (draft?.query?.trim()) {
      pendingDraftRef.current = {
        categoryName: draft.categoryName,
        expertTypeName: draft.expertTypeName,
      }
    } else {
      draftHydratedRef.current = true
    }
  }

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: plans = Object.values(PLANS), isSuccess: plansLoaded } = usePlans()
  const needsMentor = planRequiresExpertSelection(plan, plans)
  const { data: platformSettings } = usePlatformSettings()
  const mentorTypesEnabled = platformSettings?.mentorTypesEnabled !== false
  const { data: expertTypes = [], isLoading: expertTypesLoading } = useExpertTypes(
    categoryId,
    mentorTypesEnabled
  )

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
    queryFn: () => userApi.getQuestions({ limit: 24 }),
  })

  const premiumExpertParams = useMemo(
    () =>
      categoryId
        ? {
            category: categoryId,
            expertType: mentorTypesEnabled ? expertTypeId || undefined : undefined,
            availability: 'available',
            limit: 20,
            sort: 'rating',
          }
        : null,
    [categoryId, expertTypeId, mentorTypesEnabled]
  )

  const {
    data: premiumExpertsData,
    isLoading: premiumExpertsLoading,
    error: premiumExpertsError,
    refetch: refetchPremiumExperts,
  } = useExperts(premiumExpertParams, step === 'expert' && needsMentor && !!premiumExpertParams)

  const recommendedParams = useMemo(
    () =>
      categoryId
        ? {
            category: categoryId,
            expertType: mentorTypesEnabled ? expertTypeId || undefined : undefined,
            availability: 'available',
            limit: 12,
            sort: 'rating',
          }
        : null,
    [categoryId, expertTypeId, mentorTypesEnabled]
  )

  const { data: recommendedData, isLoading: recommendedLoading } = useExperts(
    recommendedParams,
    step === 'compose' && !!recommendedParams
  )

  const recentQuestions = useMemo(
    () => (questionsData?.questions || []).map(mapApiQuestion),
    [questionsData]
  )

  useEffect(() => {
    if (!categories.length) return

    const pending = pendingDraftRef.current
    if (pending?.categoryName && !draftHydratedRef.current) {
      const match = categories.find((c) => namesMatch(c.name, pending.categoryName))
      setCategoryId(match?._id || categories[0]._id)
      return
    }

    if (!categoryId) {
      setCategoryId(categories[0]._id)
    }
  }, [categories, categoryId])

  useEffect(() => {
    if (!mentorTypesEnabled) {
      setExpertTypeId(null)
      return
    }
    if (!categoryId || expertTypesLoading) return

    if (!expertTypes.length) {
      setExpertTypeId(null)
      if (pendingDraftRef.current && !draftHydratedRef.current) {
        clearQuestionDraft()
        pendingDraftRef.current = null
        draftHydratedRef.current = true
      }
      return
    }

    const pending = pendingDraftRef.current
    if (pending && !draftHydratedRef.current) {
      const match = pending.expertTypeName
        ? expertTypes.find((t) => namesMatch(t.name, pending.expertTypeName))
        : null
      setExpertTypeId(match?._id || null)
      clearQuestionDraft()
      pendingDraftRef.current = null
      draftHydratedRef.current = true
      return
    }

    setExpertTypeId((prev) => (prev && expertTypes.some((t) => t._id === prev) ? prev : null))
  }, [categoryId, expertTypes, expertTypesLoading, mentorTypesEnabled])

  useEffect(() => {
    if (location.state?.reset) {
      const preferredPlan = location.state.selectedPlan
      const preferredExpertId = location.state.selectedExpertId
      const preferredExpertName = location.state.selectedExpertName

      clearQuestionDraft()
      pendingDraftRef.current = null
      draftHydratedRef.current = true
      setStep('compose')
      setQuery('')
      setFiles([])
      setLinks([])
      setPlan(preferredPlan || 'mentor')
      setSelectedExpert(
        preferredExpertId
          ? { userId: preferredExpertId, name: preferredExpertName || 'Mentor' }
          : null
      )
      setAppliedCoupon(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate('/dashboard', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!plansLoaded || !plans.length) return
    if (resolvePlan(plan, plans)) return
    setPlan(plans.find((p) => p.popular)?.id || plans[0].id)
  }, [plansLoaded, plans, plan])

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
    setStep('plan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlanContinue = () => {
    setStep(needsMentor ? 'expert' : 'payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExpertContinue = () => {
    if (!selectedExpert) return toast.error('Please select a mentor')
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (step === 'plan') setStep('compose')
    else if (step === 'expert') setStep('plan')
    else if (step === 'payment') setStep(needsMentor ? 'expert' : 'plan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePayment = async () => {
    if (paying) return
    setPaying(true)
    try {
      const title = query.split('\n')[0].slice(0, 120).trim()
      if (!title) {
        toast.error('Enter a question before paying')
        return
      }
      if (!categoryId) {
        toast.error('Missing category')
        return
      }

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', query)
      if (links.length) {
        formData.append('links', JSON.stringify(links))
      }
      formData.append('category', categoryId)
      if (mentorTypesEnabled && expertTypeId) {
        formData.append('expertType', expertTypeId)
      }
      formData.append('priority', 'standard')
      formData.append('plan', plan)
      if (needsMentor && selectedExpert) {
        formData.append('selectedExpert', selectedExpert.userId)
      }
      files.forEach((f) => formData.append('files', f))

      const { question } = await userApi.createQuestion(formData)
      const result = await payForQuestion(question, {
        couponCode: appliedCoupon?.code,
        planName: resolvePlan(plan, plans)?.name,
      })

      toast.success(result.mode === 'dev' ? 'Question submitted successfully' : 'Payment successful!')
      await refetchQuestions()
      navigate(`/dashboard/questions/${question._id}`)
    } catch (err) {
      if (err?.message && err.message !== 'Payment cancelled') {
        toast.error(err.message)
      }
    } finally {
      setPaying(false)
    }
  }

  if (step !== 'compose') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="dashboard-original-style flex w-full flex-1 flex-col px-6 py-8 lg:px-10 xl:px-12"
      >
        <div className="w-full">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <StepProgress current={step} plan={plan} plans={plans} />

          {step === 'plan' && (
            <PlanSelector plan={plan} plans={plans} onSelect={setPlan} onContinue={handlePlanContinue} />
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
              plans={plans}
              category={selectedCategory}
              expertType={selectedExpertType}
              mentorTypesEnabled={mentorTypesEnabled}
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
      className="flex w-full flex-1 flex-col items-center px-6 pb-4 pt-2 lg:px-10 xl:px-12"
    >
      <div className="dashboard-original-style w-full">
        <QuestionComposer
          categories={categories}
          categoriesLoading={categoriesLoading}
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          expertTypes={expertTypes}
          expertTypesLoading={expertTypesLoading}
          expertTypeId={expertTypeId}
          onExpertTypeChange={(type) => setExpertTypeId(type?._id || null)}
          mentorTypesEnabled={mentorTypesEnabled}
          selectedCategory={selectedCategory}
          selectedExpertType={selectedExpertType}
          query={query}
          onQueryChange={setQuery}
          files={files}
          onFilesChange={setFiles}
          links={links}
          onLinksChange={setLinks}
          onSubmit={handleComposeSubmit}
          loading={false}
        />
      </div>

      <div className="mt-8 w-full space-y-5 pb-8">
        <RecommendedExperts
          experts={recommendedData?.experts || []}
          loading={recommendedLoading}
          categoryName={selectedCategory?.name}
          expertTypeName={mentorTypesEnabled ? selectedExpertType?.name : undefined}
          onSelectExpert={(mentor, planId) => {
            if (planId) setPlan(planId)
            setSelectedExpert(mentor)
            toast.success(
              planId === 'expert_call'
                ? `Mentor Call selected with ${mentor.name}`
                : `${mentor.name} selected — continue to ask`
            )
          }}
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
