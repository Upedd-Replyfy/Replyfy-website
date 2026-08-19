export const PLAN_IDS = ['basic', 'mentor', 'expert_call']

export const DEFAULT_PLANS = [
  {
    slug: 'basic',
    name: 'Basic',
    tagline: 'Best mentor chosen for you',
    pricePaise: 9900,
    mentorPointsPaise: 4000,
    features: [
      'We choose the best mentor for your query',
      'Guaranteed email reply',
      '12 hr turnaround',
    ],
    requiresExpertSelection: false,
    popular: false,
    sortOrder: 0,
  },
  {
    slug: 'mentor',
    name: 'Choose Mentor',
    tagline: 'Pick your preferred mentor',
    pricePaise: 19900,
    mentorPointsPaise: 8000,
    features: [
      'You select your preferred mentor',
      'Guaranteed email reply',
      'Priority routing',
    ],
    requiresExpertSelection: true,
    popular: true,
    sortOrder: 1,
  },
  {
    slug: 'expert_call',
    name: 'Mentor Call',
    tagline: 'Live 1-on-1 guidance',
    pricePaise: 99900,
    mentorPointsPaise: 40000,
    features: [
      '20-minute live call with your mentor',
      'Deep personalised guidance',
      'Choose any mentor',
    ],
    requiresExpertSelection: true,
    popular: false,
    sortOrder: 2,
  },
]

export const PLAN_PRICING = Object.fromEntries(
  DEFAULT_PLANS.map((plan) => [plan.slug, plan.pricePaise])
)

export function fallbackPlanRequiresExpertSelection(plan) {
  const def = DEFAULT_PLANS.find((p) => p.slug === plan)
  if (def) return Boolean(def.requiresExpertSelection)
  return plan === 'mentor' || plan === 'expert_call'
}

export function getFallbackPlanAmount(plan) {
  return PLAN_PRICING[plan] ?? PLAN_PRICING.basic
}

/** @deprecated Use planService.getPlanAmount — kept as sync fallback for callers that have not migrated yet. */
export function getPlanAmount(plan) {
  return getFallbackPlanAmount(plan)
}

/** @deprecated Use planService.planRequiresExpertSelection for live plan flags. */
export function planRequiresExpertSelection(plan) {
  return fallbackPlanRequiresExpertSelection(plan)
}

export function formatPlanPublic(doc, { includeAdmin = false } = {}) {
  const o = typeof doc?.toObject === 'function' ? doc.toObject() : doc
  const payload = {
    id: o.slug,
    slug: o.slug,
    name: o.name,
    tagline: o.tagline || '',
    price: Math.round((o.pricePaise || 0) / 100),
    pricePaise: o.pricePaise,
    features: o.features || [],
    popular: Boolean(o.popular),
    requiresExpertSelection: Boolean(o.requiresExpertSelection),
  }
  if (includeAdmin) {
    payload._id = o._id
    payload.isActive = o.isActive !== false
    payload.sortOrder = o.sortOrder ?? 0
    payload.mentorPoints = Math.round((o.mentorPointsPaise || 0) / 100)
    payload.mentorPointsPaise = o.mentorPointsPaise || 0
    payload.createdAt = o.createdAt
    payload.updatedAt = o.updatedAt
  }
  return payload
}
