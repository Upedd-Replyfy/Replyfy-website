export const PLAN_IDS = ['basic', 'mentor', 'expert_call']

export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    tagline: 'Best expert chosen for you',
    price: 99,
    pricePaise: 9900,
    features: [
      'We choose the best expert for your query',
      'Guaranteed email reply',
      '12 hr turnaround',
    ],
  },
  mentor: {
    id: 'mentor',
    name: 'Choose Mentor',
    tagline: 'Pick your preferred expert',
    price: 199,
    pricePaise: 19900,
    popular: true,
    features: [
      'You select your preferred expert',
      'Guaranteed email reply',
      'Priority routing',
    ],
  },
  expert_call: {
    id: 'expert_call',
    name: 'Expert Call',
    tagline: 'Live 1-on-1 guidance',
    price: 999,
    pricePaise: 99900,
    features: [
      '20-minute live call with your expert',
      'Deep personalised guidance',
      'Choose any mentor',
    ],
  },
}

export function planRequiresExpertSelection(plan) {
  return plan === 'mentor' || plan === 'expert_call'
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
