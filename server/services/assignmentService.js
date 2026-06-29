import ExpertProfile from '../models/ExpertProfile.js'
import QuestionAssignment from '../models/QuestionAssignment.js'
import { ApiError } from '../utils/ApiError.js'

export async function findAvailableExpert(categoryId, expertTypeId, excludeExpertId = null) {
  const query = {
    category: categoryId,
    expertType: expertTypeId,
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

export async function assignExpertToQuestion({ question, expertUserId, assignedBy, assignmentType, session }) {
  const profile = await ExpertProfile.findOne({ user: expertUserId }).session(session || null)
  if (!profile || profile.availability !== 'available' || profile.status !== 'active') {
    throw new ApiError(400, 'Expert is not available')
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

export async function releaseExpertAssignment(expertUserId, session) {
  const profile = await ExpertProfile.findOne({ user: expertUserId }).session(session || null)
  if (profile && profile.activeAssignments > 0) {
    profile.activeAssignments -= 1
    await profile.save({ session })
  }
}
