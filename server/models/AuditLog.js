import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ip: String,
  },
  { timestamps: true }
)

auditLogSchema.index({ entityType: 1, entityId: 1 })
auditLogSchema.index({ performedBy: 1, createdAt: -1 })

export default mongoose.model('AuditLog', auditLogSchema)
