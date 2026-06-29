export const PLAN_IDS = ['basic', 'mentor', 'expert_call']

export const PLAN_PRICING = {
  basic: 9900,
  mentor: 19900,
  expert_call: 99900,
}

export function planRequiresExpertSelection(plan) {
  return plan === 'mentor' || plan === 'expert_call'
}

export function getPlanAmount(plan) {
  return PLAN_PRICING[plan] ?? PLAN_PRICING.basic
}
