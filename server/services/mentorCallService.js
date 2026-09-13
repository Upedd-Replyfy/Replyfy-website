import Question from '../models/Question.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { sendEmail, isEmailConfigured } from '../config/email.js'
import { createNotification } from './notificationService.js'
import { creditMentorPointsForQuestion } from './walletService.js'
import {
  isMentorCallQuestion,
  MENTOR_CALL_DURATION_MINUTES,
} from '../constants/mentorCall.js'
import { logger } from '../utils/logger.js'

function formatMeetingDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildMeetingEmailHtml({
  userName,
  mentorName,
  meetingDate,
  meetingTime,
  durationMinutes,
  question,
  meetingLink,
}) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8f63f4">Replyfy</p>
    <h2 style="margin:0 0 12px;color:#111111;font-size:22px;line-height:1.3">Your Mentor Call Has Been Scheduled</h2>
    <p style="margin:0 0 16px;color:#52525b;line-height:1.65;font-size:15px">Hello ${userName},</p>
    <p style="margin:0 0 16px;color:#52525b;line-height:1.65;font-size:15px">Your Mentor Call has been scheduled successfully.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3f3f46">
      <tr><td style="padding:8px 0;color:#71717a">Mentor</td><td style="padding:8px 0;font-weight:600">${mentorName}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Date</td><td style="padding:8px 0;font-weight:600">${meetingDate}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Time</td><td style="padding:8px 0;font-weight:600">${meetingTime}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Duration</td><td style="padding:8px 0;font-weight:600">${durationMinutes} minutes</td></tr>
      <tr><td style="padding:8px 0;color:#71717a;vertical-align:top">Your Question</td><td style="padding:8px 0">${question}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Meeting Link</td><td style="padding:8px 0"><a href="${meetingLink}" style="color:#4f46e5;word-break:break-all">${meetingLink}</a></td></tr>
    </table>
    <p style="margin:20px 0 0;color:#52525b;line-height:1.65;font-size:15px">Please join the meeting at the scheduled time.</p>
    <p style="margin:24px 0 0;color:#71717a;font-size:13px">Regards,<br/>Replyfy Team</p>
  </div>`
}

function buildMeetingEmailText({
  userName,
  mentorName,
  meetingDate,
  meetingTime,
  durationMinutes,
  meetingLink,
}) {
  return [
    `Hello ${userName},`,
    '',
    'Your Replyfy Mentor Call has been scheduled.',
    '',
    `Mentor: ${mentorName}`,
    `Date: ${meetingDate}`,
    `Time: ${meetingTime}`,
    `Duration: ${durationMinutes} minutes`,
    '',
    'Meeting Link:',
    meetingLink,
    '',
    'Please join at the scheduled time.',
    '',
    'Regards,',
    'Replyfy Team',
  ].join('\n')
}

/**
 * Persist schedule, then email the user (no WhatsApp automation).
 * Email failures do not roll back the schedule.
 */
export async function scheduleMentorCallMeeting({
  questionId,
  adminUserId,
  meetingDate,
  meetingTime,
  meetingLink,
  meetingDurationMinutes,
  forceNotify = false,
}) {
  const question = await Question.findById(questionId)
    .populate('user', 'name email')
    .populate('assignedExpert', 'name email')

  if (!question) throw new ApiError(404, 'Question not found')
  if (!isMentorCallQuestion(question)) {
    throw new ApiError(400, 'This question is not a Mentor Call request')
  }
  if (question.adminApprovalStatus === 'rejected' || question.status === 'rejected') {
    throw new ApiError(400, 'Cannot schedule a rejected request')
  }
  if (!question.assignedExpert) {
    throw new ApiError(400, 'Assign a mentor before scheduling')
  }
  if (!['sent', 'responded'].includes(question.mentorRequestStatus)) {
    throw new ApiError(400, 'Send the request to a mentor before scheduling')
  }

  const link = String(meetingLink || '').trim()
  if (!link || !/^https?:\/\//i.test(link)) {
    throw new ApiError(400, 'Enter a valid meeting link (https://…)')
  }
  const time = String(meetingTime || '').trim()
  if (!time) throw new ApiError(400, 'Meeting time is required')

  const dateObj = meetingDate ? new Date(meetingDate) : null
  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    throw new ApiError(400, 'Valid meeting date is required')
  }

  const duration =
    Number(meetingDurationMinutes) > 0
      ? Math.round(Number(meetingDurationMinutes))
      : MENTOR_CALL_DURATION_MINUTES

  const alreadyScheduled = question.meetingStatus === 'scheduled'
  const shouldNotifyEmail =
    forceNotify || question.emailNotificationStatus !== 'sent'

  question.meetingDate = dateObj
  question.meetingTime = time
  question.meetingLink = link
  question.meetingDurationMinutes = duration
  question.meetingStatus = 'scheduled'
  question.scheduledBy = adminUserId
  question.scheduledAt = new Date()
  if (question.status === 'assigned') question.status = 'in_progress'

  if (shouldNotifyEmail) question.emailNotificationStatus = 'pending'

  await question.save()

  const userName = question.user?.name || 'there'
  const mentorName = question.assignedExpert?.name || 'your mentor'
  const meetingDateLabel = formatMeetingDate(dateObj)
  const questionText = question.title || question.description?.slice(0, 200) || '—'

  const payload = {
    userName,
    mentorName,
    meetingDate: meetingDateLabel,
    meetingTime: time,
    durationMinutes: duration,
    question: questionText,
    meetingLink: link,
  }

  if (!alreadyScheduled || forceNotify) {
    await createNotification({
      userId: question.user._id,
      type: 'mentor_call_scheduled',
      title: 'Mentor Call Scheduled',
      message: `Your call with ${mentorName} is on ${meetingDateLabel} at ${time}.`,
      link: `/dashboard/questions/${question._id}`,
      email: question.user?.email,
      sendMail: false,
      metadata: { questionId: String(question._id) },
    })
  }

  if (shouldNotifyEmail) {
    try {
      if (!isEmailConfigured()) {
        question.emailNotificationStatus = 'failed'
        logger.warn('mentor_call_email_skipped_smtp', { questionId: String(question._id) })
      } else {
        const info = await sendEmail({
          to: question.user?.email,
          subject: 'Your Mentor Call Has Been Scheduled',
          html: buildMeetingEmailHtml(payload),
          text: buildMeetingEmailText(payload),
        })
        if (info) {
          question.emailNotificationStatus = 'sent'
          question.emailSentAt = new Date()
        } else {
          question.emailNotificationStatus = 'failed'
        }
      }
    } catch (err) {
      question.emailNotificationStatus = 'failed'
      logger.error('mentor_call_email_failed', {
        questionId: String(question._id),
        error: err?.message || String(err),
      })
    }
  }

  await question.save()

  return question
}

export async function submitMentorAvailability({
  questionId,
  expertUserId,
  slots,
  timelineNote,
}) {
  const question = await Question.findOne({
    _id: questionId,
    assignedExpert: expertUserId,
  })
  if (!question) throw new ApiError(404, 'Question not found')
  if (!isMentorCallQuestion(question)) {
    throw new ApiError(400, 'Availability is only for Mentor Call requests')
  }
  if (!['assigned', 'in_progress'].includes(question.status)) {
    throw new ApiError(400, 'This request is not open for availability')
  }
  if (question.meetingStatus === 'scheduled' || question.meetingStatus === 'completed') {
    throw new ApiError(400, 'Meeting already scheduled')
  }

  const normalizedSlots = Array.isArray(slots)
    ? slots
        .map((s) => ({
          date: s.date ? new Date(s.date) : undefined,
          time: String(s.time || '').trim(),
          label: String(s.label || '').trim(),
          note: String(s.note || '').trim(),
        }))
        .filter((s) => s.label || s.time || s.date)
    : []

  const note = String(timelineNote || '').trim()
  if (!normalizedSlots.length && !note) {
    throw new ApiError(400, 'Provide at least one available time or a timeline note')
  }

  question.mentorAvailability = {
    slots: normalizedSlots,
    timelineNote: note,
    submittedAt: new Date(),
  }
  question.mentorRequestStatus = 'responded'
  if (question.status === 'assigned') question.status = 'in_progress'
  await question.save()

  const admins = await User.find({ role: 'admin', isActive: true }).select('_id')
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type: 'mentor_call_availability',
        title: 'Mentor Availability Received',
        message: `Mentor shared availability for "${question.title}".`,
        link: `/admin/questions`,
        metadata: { questionId: String(question._id) },
      })
    )
  )

  return question
}

export async function completeMentorCall({ questionId, adminUserId }) {
  const question = await Question.findById(questionId)
  if (!question) throw new ApiError(404, 'Question not found')
  if (!isMentorCallQuestion(question)) {
    throw new ApiError(400, 'Not a Mentor Call request')
  }
  if (question.meetingStatus !== 'scheduled') {
    throw new ApiError(400, 'Only scheduled meetings can be marked completed')
  }

  question.meetingStatus = 'completed'
  question.status = 'completed'
  question.adminReviewedBy = adminUserId
  question.adminReviewedAt = new Date()
  await question.save()

  try {
    await creditMentorPointsForQuestion({
      question,
      expertId: question.assignedExpert,
    })
  } catch (err) {
    logger.error('mentor_call_points_credit_failed', {
      questionId: String(question._id),
      error: err?.message || String(err),
    })
  }

  if (question.assignedExpert) {
    try {
      const ExpertProfile = (await import('../models/ExpertProfile.js')).default
      const profile = await ExpertProfile.findOne({ user: question.assignedExpert })
      if (profile) {
        profile.activeAssignments = Math.max(0, (profile.activeAssignments || 0) - 1)
        await profile.save()
      }
    } catch (err) {
      logger.error('mentor_call_assignment_release_failed', {
        questionId: String(question._id),
        error: err?.message || String(err),
      })
    }
  }

  if (question.user) {
    await createNotification({
      userId: question.user,
      type: 'mentor_call_completed',
      title: 'Mentor Call Completed',
      message: 'Your mentor call has been marked as completed.',
      link: `/dashboard/questions/${question._id}`,
    })
  }

  return question
}
