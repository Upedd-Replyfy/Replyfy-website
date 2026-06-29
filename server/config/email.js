import nodemailer from 'nodemailer'
import { env } from './env.js'

let transporter = null

function getTransporter() {
  if (!transporter && env.smtp.host && env.smtp.user) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter()
  if (!transport) return null
  return transport.sendMail({
    from: env.smtp.user,
    to,
    subject,
    html,
    text,
  })
}
