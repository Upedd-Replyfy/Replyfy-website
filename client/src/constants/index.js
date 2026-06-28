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

export const PLANS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    tagline: 'Affordable · Auto-assigned',
    price: 499,
    pricePaise: 49900,
    features: [
      'Random available expert by specialization',
      'Faster automatic assignment',
      'Affordable pricing',
      'Ideal for general questions',
    ],
    note: 'You cannot choose the expert — we match the best available expert for your category.',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Choose your expert',
    price: 999,
    pricePaise: 99900,
    features: [
      'Choose your preferred expert',
      'View profile, experience & reviews',
      'See response time & consultation price',
      'Premium support',
    ],
    note: 'Compare experts, select one, review total price, then pay.',
  },
}

export const DASHBOARD_ROUTES = {
  user: '/dashboard',
  expert: '/expert',
  admin: '/admin',
}
