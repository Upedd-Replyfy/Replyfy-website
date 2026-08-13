import ExpertProfile from '../models/ExpertProfile.js'
import QuestionAssignment from '../models/QuestionAssignment.js'
import { ApiError } from '../utils/ApiError.js'
import { expertMatchesCategoryType } from '../utils/expertMatch.js'

export async function findAvailableExpert(categoryId, expertTypeId = null, excludeExpertId = null) {
  const query = {
    ...expertMatchesCategoryType(categoryId, expertTypeId || null),
    availability: 'available',
    status: 'active',
  }

  const profiles = await ExpertProfile.find(query)
    .populate('user', 'name email isActive')
    .sort({ activeAssignments: 1, averageRating: -1, responseTime: 1 })

  const available = profiles.filter(
    (p) => p.user?.isActive && (!excludeExpertId || p.user._id.toString() !== excludeExpertId.toString())
  )

  // Prefer mentors under their soft capacity, but still assign if everyone is busy.
  const underCapacity = available.filter(
    (p) => (p.activeAssignments || 0) < (p.maxAssignments || 50)
  )

  return underCapacity[0] || available[0] || null
}

export async function assignExpertToQuestion({
  question,
  expertUserId,
  assignedBy,
  assignmentType,
  session,
  relaxAvailability = false,
}) {
  const profileQuery = ExpertProfile.findOne({ user: expertUserId })
  if (session) profileQuery.session(session)
  const profile = await profileQuery
  if (!profile || profile.status !== 'active') {
    throw new ApiError(400, 'Mentor profile is not active')
  }
  if (!relaxAvailability && profile.availability !== 'available') {
    throw new ApiError(400, 'Mentor is not available')
  }

  const User = (await import('../models/User.js')).default
  const userQuery = User.findById(expertUserId)
  if (session) userQuery.session(session)
  const user = await userQuery
  if (!user || !user.isActive || user.role !== 'expert') {
    throw new ApiError(400, 'Mentor account is not active')
  }

  question.assignedExpert = expertUserId
  question.status = 'assigned'
  question.assignedAt = new Date()
  question.assignedBy = assignedBy
  question.deadline = new Date(Date.now() + (profile.responseTime || 48) * 60 * 60 * 1000)

  const saveOpts = session ? { session } : undefined
  await question.save(saveOpts)

  profile.activeAssignments = (profile.activeAssignments || 0) + 1
  await profile.save(saveOpts)

  const assignmentPayload = {
    question: question._id,
    expert: expertUserId,
    assignedBy,
    assignmentType,
  }

  if (session) {
    await QuestionAssignment.create([assignmentPayload], { session })
  } else {
    await QuestionAssignment.create(assignmentPayload)
  }

  return question
}
