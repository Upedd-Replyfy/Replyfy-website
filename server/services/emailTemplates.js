const baseTemplate = ({ title, message, link }) => `
  <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px">
    <h2 style="color:#111">${title}</h2>
    <p style="color:#71717a;line-height:1.6">${message}</p>
    ${link ? `<a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:8px">View Details</a>` : ''}
  </div>
`

export const emailTemplates = {
  general: baseTemplate,
  payment_success: baseTemplate,
  question_submitted: baseTemplate,
  question_approved: baseTemplate,
  question_rejected: baseTemplate,
  expert_assigned: baseTemplate,
  deadline_reminder: baseTemplate,
  answer_submitted: baseTemplate,
  answer_approved: baseTemplate,
  answer_delivered: baseTemplate,
  rating_reminder: baseTemplate,
  wallet_credited: baseTemplate,
}
