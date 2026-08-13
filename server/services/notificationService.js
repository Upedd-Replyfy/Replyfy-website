import Notification from '../models/Notification.js'
import { sendEmail } from '../config/email.js'
import { emailTemplates } from './emailTemplates.js'
import { logger } from '../utils/logger.js'

function queueEmail({ type, title, message, link, email, cta, userId }) {
  if (!email) return

  const template = emailTemplates[type] || emailTemplates.general
  // Never block API responses on SMTP — Hostinger/outbound can hang for minutes.
  void sendEmail({
    to: email,
    subject: title,
    html: template({ title, message, link, cta }),
    text: `${message}${link ? `\n\nOpen: ${link}` : ''}`,
  }).catch((err) => {
    logger.error('notification_email_failed', {
      userId: String(userId),
      type,
      error: err?.message || String(err),
    })
  })
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
  sendMail = false,
  email,
  cta,
}) {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    metadata,
  })

  if (sendMail && email) {
    queueEmail({ type, title, message, link, email, cta, userId })
  }

  return notification
}

export async function notifyAdmins({ type, title, message, link, metadata, admins }) {
  return Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type,
        title,
        message,
        link,
        metadata,
      })
    )
  )
}
