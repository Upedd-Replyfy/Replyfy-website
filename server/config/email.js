import nodemailer from 'nodemailer'
import { env } from './env.js'
import { logger } from '../utils/logger.js'

let transporter = null

function getTransporter() {
  if (!transporter && env.smtp.host && env.smtp.user && env.smtp.pass) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  }
  return transporter
}

export function isEmailConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass)
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to) return null

  const transport = getTransporter()
  if (!transport) {
    logger.warn('email_skipped_smtp_not_configured', { to, subject })
    return null
  }

  try {
    const info = await transport.sendMail({
      from: `"Replyfy" <${env.smtp.user}>`,
      to,
      subject,
      html,
      text,
    })
    logger.info('email_sent', { to, subject, messageId: info.messageId })
    return info
  } catch (err) {
    logger.error('email_send_failed', {
      to,
      subject,
      error: err?.message || String(err),
    })
    return null
  }
}
