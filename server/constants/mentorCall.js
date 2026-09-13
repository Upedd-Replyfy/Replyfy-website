/** Mentor Call (plan slug expert_call) — configurable defaults. */
export const MENTOR_CALL_PLAN_SLUG = 'expert_call'
export const MENTOR_CALL_SERVICE_TYPE = 'mentor_call'
export const WRITTEN_ANSWER_SERVICE_TYPE = 'written_answer'

/** Default live-call duration in minutes (admin can override per booking). */
export const MENTOR_CALL_DURATION_MINUTES = Number(process.env.MENTOR_CALL_DURATION_MINUTES || 20)

export function isMentorCallPlan(plan) {
  return String(plan || '').toLowerCase() === MENTOR_CALL_PLAN_SLUG
}

export function isMentorCallQuestion(question) {
  if (!question) return false
  if (question.serviceType === MENTOR_CALL_SERVICE_TYPE) return true
  return isMentorCallPlan(question.plan)
}

export function serviceTypeForPlan(plan) {
  return isMentorCallPlan(plan) ? MENTOR_CALL_SERVICE_TYPE : WRITTEN_ANSWER_SERVICE_TYPE
}
