import mongoose from 'mongoose'

const questionAssignmentSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentType: { type: String, enum: ['auto', 'manual', 'user_selected'], default: 'auto' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('QuestionAssignment', questionAssignmentSchema)
