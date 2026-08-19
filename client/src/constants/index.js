export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    tagline: 'Best mentor chosen for you',
    price: 99,
    pricePaise: 9900,
    requiresExpertSelection: false,
    features: [
      'We choose the best mentor for your query',
      'Guaranteed email reply',
      '12 hr turnaround',
    ],
  },
  mentor: {
    id: 'mentor',
    name: 'Choose Mentor',
    tagline: 'Pick your preferred mentor',
    price: 199,
    pricePaise: 19900,
    popular: true,
    requiresExpertSelection: true,
    features: [
      'You select your preferred mentor',
      'Guaranteed email reply',
      'Priority routing',
    ],
  },
  expert_call: {
    id: 'expert_call',
    name: 'Mentor Call',
    tagline: 'Live 1-on-1 guidance',
    price: 999,
    pricePaise: 99900,
    requiresExpertSelection: true,
    features: [
      '20-minute live call with your mentor',
      'Deep personalised guidance',
      'Choose any mentor',
    ],
  },
}

export function planListFrom(plans) {
  if (Array.isArray(plans) && plans.length) return plans
  if (plans && typeof plans === 'object' && !Array.isArray(plans)) {
    const values = Object.values(plans)
    if (values.length) return values
  }
  return Object.values(PLANS)
}

export function resolvePlan(planId, plans) {
  return planListFrom(plans).find((p) => p.id === planId || p.slug === planId) || PLANS[planId] || null
}

export function planRequiresExpertSelection(plan, plans) {
  const found = resolvePlan(plan, plans)
  if (found) return Boolean(found.requiresExpertSelection)
  return plan === 'mentor' || plan === 'expert_call'
}

export function planDisplayName(planId, plans) {
  return resolvePlan(planId, plans)?.name || String(planId || '').replace(/_/g, ' ')
}

/** Query vs live-call CTAs on mentor cards: prefer known slugs, then other pick-a-mentor plans. */
export function pickMentorCtaPlans(plans) {
  const list = planListFrom(plans)
  const map = Object.fromEntries(list.map((p) => [p.id, p]))
  const requiring = list.filter((p) => p.requiresExpertSelection)
  const queryPlan = map.mentor || requiring[0] || list[0]
  const callPlan =
    map.expert_call && map.expert_call.id !== queryPlan?.id
      ? map.expert_call
      : requiring.find((p) => p.id !== queryPlan?.id) || null
  return { queryPlan, callPlan }
}

export const DASHBOARD_ROUTES = {
  user: '/dashboard',
  expert: '/expert',
  admin: '/admin',
}

export const ROLES = {
  USER: 'user',
  EXPERT: 'expert',
  ADMIN: 'admin',
}

export const QUESTION_STATUS = {
  pending_payment: 'Pending Payment',
  pending_admin_review: 'Pending Review',
  rejected: 'Rejected',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting_admin_review: 'Answer Under Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
