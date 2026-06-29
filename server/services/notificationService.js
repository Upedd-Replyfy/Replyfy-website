import Notification from '../models/Notification.js'
import { sendEmail } from '../config/email.js'
import { emailTemplates } from './emailTemplates.js'

export async function createNotification({ userId, type, title, message, link, metadata, sendMail = true, email }) {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    metadata,
  })

  if (sendMail && email) {
    const template = emailTemplates[type] || emailTemplates.general
    await sendEmail({
      to: email,
      subject: title,
      html: template({ title, message, link }),
      text: message,
    })
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
        email: admin.email,
      })
    )
  )
}
