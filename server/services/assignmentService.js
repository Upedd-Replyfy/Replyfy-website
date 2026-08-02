import ExpertProfile from '../models/ExpertProfile.js'
import QuestionAssignment from '../models/QuestionAssignment.js'
import { ApiError } from '../utils/ApiError.js'
import { expertMatchesCategoryType } from '../utils/expertMatch.js'

export async function findAvailableExpert(categoryId, expertTypeId, excludeExpertId = null) {
  const query = {
    ...expertMatchesCategoryType(categoryId, expertTypeId),
    availability: 'available',
    status: 'active',
    $expr: { $lt: ['$activeAssignments', '$maxAssignments'] },
  }

  const profiles = await ExpertProfile.find(query)
    .populate('user', 'name email isActive')
    .sort({ activeAssignments: 1, averageRating: -1, responseTime: 1 })

  const available = profiles.filter(
    (p) => p.user?.isActive && (!excludeExpertId || p.user._id.toString() !== excludeExpertId.toString())
  )

  return available[0] || null
}

export async function assignExpertToQuestion({
  question,
  expertUserId,
  assignedBy,
  assignmentType,
  session,
  relaxAvailability = false,
}) {
  const profile = await ExpertProfile.findOne({ user: expertUserId }).session(session || null)
  if (!profile || profile.status !== 'active') {
    throw new ApiError(400, 'Mentor profile is not active')
  }
  if (!relaxAvailability && profile.availability !== 'available') {
    throw new ApiError(400, 'Mentor is not available')
  }

  const User = (await import('../models/User.js')).default
  const user = await User.findById(expertUserId).session(session || null)
  if (!user || !user.isActive || user.role !== 'expert') {
    throw new ApiError(400, 'Mentor account is not active')
  }

  question.assignedExpert = expertUserId
  question.status = 'assigned'
  question.assignedAt = new Date()
  question.assignedBy = assignedBy
  question.deadline = new Date(Date.now() + profile.responseTime * 60 * 60 * 1000)

  await question.save({ session })

  profile.activeAssignments += 1
  await profile.save({ session })

  await QuestionAssignment.create(
    [
      {
        question: question._id,
        expert: expertUserId,
        assignedBy,
        assignmentType,
      },
    ],
    { session }
  )

  return question
}
