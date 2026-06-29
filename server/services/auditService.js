import AuditLog from '../models/AuditLog.js'
import { logger } from '../utils/logger.js'

export async function logAudit({ action, entityType, entityId, performedBy, metadata, ip }) {
  try {
    await AuditLog.create({ action, entityType, entityId, performedBy, metadata, ip })
  } catch (err) {
    logger.error('Audit log failed', err)
  }
}
