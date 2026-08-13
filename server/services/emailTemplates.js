import { env } from '../config/env.js'

function absoluteLink(link) {
  if (!link) return ''
  if (/^https?:\/\//i.test(link)) return link
  const base = String(env.clientUrl || '').replace(/\/$/, '')
  return `${base}${link.startsWith('/') ? link : `/${link}`}`
}

const baseTemplate = ({ title, message, link, cta = 'View Details' }) => {
  const href = absoluteLink(link)
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8f63f4">Replyfy</p>
    <h2 style="margin:0 0 12px;color:#111111;font-size:22px;line-height:1.3">${title}</h2>
    <p style="margin:0;color:#52525b;line-height:1.65;font-size:15px">${message}</p>
    ${
      href
        ? `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 22px;background:#111111;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px">${cta}</a>`
        : ''
    }
    <p style="margin:28px 0 0;color:#a1a1aa;font-size:12px;line-height:1.5">
      If the button does not work, copy this link into your browser:<br/>
      <span style="color:#71717a;word-break:break-all">${href || '—'}</span>
    </p>
  </div>
`
}

export const emailTemplates = {
  general: baseTemplate,
  payment_success: baseTemplate,
  question_submitted: baseTemplate,
  question_approved: baseTemplate,
  question_rejected: baseTemplate,
  expert_assigned: baseTemplate,
  deadline_reminder: baseTemplate,
  answer_submitted: baseTemplate,
  answer_approved: (props) =>
    baseTemplate({ ...props, cta: props.cta || 'Read your answer' }),
  answer_delivered: (props) =>
    baseTemplate({
      ...props,
      cta: props.cta || 'Read your answer',
    }),
  rating_reminder: (props) =>
    baseTemplate({ ...props, cta: props.cta || 'Rate mentor' }),
  wallet_credited: baseTemplate,
}
