import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  Check,
  Clock,
  GraduationCap,
  Heart,
  MessageSquare,
  ScrollText,
  Share2,
  Star,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { PLANS, planRequiresExpertSelection } from '../../constants'
import { formatRupee } from '../../utils/currency'

function avatarUrl(mentor) {
  return (
    mentor?.profilePhoto ||
    mentor?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor?.name || 'M')}&background=635BFF&color=fff`
  )
}

function labelsFrom(multi, primary) {
  const names = [...(multi || []), primary]
    .map((item) => (typeof item === 'object' ? item?.name : null))
    .filter(Boolean)
  return [...new Set(names)]
}

function credentialLine(mentor, types, education, achievements, skills) {
  const parts = [
    ...types.slice(0, 2),
    ...education
      .map((e) => [e.degree, e.school].filter(Boolean).join(', '))
      .filter(Boolean)
      .slice(0, 2),
    ...achievements.map((a) => a.title).filter(Boolean).slice(0, 2),
    ...skills.slice(0, 2),
    mentor.experience?.trim(),
  ].filter(Boolean)
  return [...new Set(parts)].slice(0, 5).join(' | ')
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'education', label: 'Education' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'skills', label: 'Skills' },
]

/** Plans that let the user keep this mentor selected. */
const MENTOR_PLANS = [PLANS.mentor, PLANS.expert_call]

function SectionCard({ children }) {
  return (
    <div className="rounded-2xl border border-[#5B4CFF]/20 bg-[#5B4CFF]/10 p-3.5">
      {children}
    </div>
  )
}

function SoftChip({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-[#7C6CFF] shadow-sm">
      {Icon ? <Icon size={11} /> : null}
      {children}
    </span>
  )
}

export default function MentorDetailModal({ mentor, open, onClose, onAsk }) {
  const [tab, setTab] = useState('profile')
  const [filter, setFilter] = useState('all')
  const [knowMore, setKnowMore] = useState(false)
  const [saved, setSaved] = useState(false)
  const [planId, setPlanId] = useState('mentor')

  useEffect(() => {
    if (!open) return undefined
    setTab('profile')
    setFilter('all')
    setKnowMore(false)
    setPlanId(mentor?.videoCallAvailable ? 'expert_call' : 'mentor')
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, mentor])

  const shareProfile = async () => {
    if (!mentor) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `Check out ${mentor.name} on Replyfy`
    try {
      if (navigator.share) {
        await navigator.share({ title: mentor.name, text, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      /* user cancelled */
    }
  }

  if (!open || !mentor) return null

  const selectedPlan = PLANS[planId] || PLANS.mentor
  const priceLabel = formatRupee(selectedPlan.pricePaise)

  const handleAsk = () => onAsk?.(mentor, planId)

  const categories = labelsFrom(mentor.categories, mentor.category)
  const types = labelsFrom(mentor.expertTypes, mentor.expertType)
  const education = mentor.education || []
  const certificates = mentor.certificates || []
  const achievements = mentor.achievements || []
  const skills = mentor.skills || []
  const languages = mentor.languages || []
  const rating = Number(mentor.averageRating) || 0
  const reviews = mentor.totalRatings || mentor.reviewCount || 0
  const answered = mentor.completedAnswers || 0
  const responseHrs = mentor.responseTime || 48
  const available = mentor.availability === 'available' || mentor.isAvailable
  const isTop = mentor.isVerified || rating >= 4.5
  const credentials = credentialLine(mentor, types, education, achievements, skills)
  const bio =
    mentor.bio?.trim() ||
    'Experienced mentor ready to help with practical, situation-specific guidance.'
  const categoryBadge = categories[0] || types[0] || 'Mentor'
  const categoryInitial = categoryBadge.slice(0, 1).toUpperCase()
  const show = (id) => filter === 'all' || filter === id
  const planTag = planId === 'expert_call' ? '1:1 Call' : 'Query'
  const PlanTagIcon = planId === 'expert_call' ? Video : MessageSquare

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close mentor details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${mentor.name} profile`}
        className="relative z-10 flex max-h-[94vh] w-full max-w-[400px] flex-col overflow-hidden rounded-t-[28px] border border-border bg-card text-ink shadow-2xl sm:max-h-[90vh] sm:rounded-[28px]"
      >
        <div className="relative shrink-0 bg-gradient-to-br from-[#5B4CFF] to-[#7C6CFF] px-4 pb-14 pt-3">
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{mentor.name}</p>
          </div>

          {isTop && (
            <div className="absolute right-4 top-14 flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-lg ring-2 ring-white/40">
                <Trophy size={20} />
              </span>
              <span className="mt-1 rounded-md bg-amber-400/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-950">
                Top Mentor
              </span>
            </div>
          )}
        </div>

        <div className="relative z-10 -mt-12 px-5">
          <div className="relative inline-block">
            <img
              src={avatarUrl(mentor)}
              alt=""
              className="h-[88px] w-[88px] rounded-full object-cover shadow-md ring-[3px] ring-card"
            />
            {available && (
              <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                <Zap size={10} fill="currentColor" />
                Available
              </span>
            )}
            <span
              className="absolute -bottom-0.5 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-[#7C6CFF] shadow ring-2 ring-card"
              title={categoryBadge}
            >
              {categoryInitial}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-ink">{mentor.name}</h3>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {rating ? rating.toFixed(1) : '—'}
            </span>
            {mentor.isVerified && <BadgeCheck size={16} className="text-[#7C6CFF]" />}
          </div>

          {credentials ? (
            <p className="mt-1.5 text-[13px] leading-snug text-muted">{credentials}</p>
          ) : null}

          <button
            type="button"
            onClick={() => setKnowMore((v) => !v)}
            className="mt-1.5 text-[13px] font-semibold text-[#a5a0ff]"
          >
            {knowMore ? 'Show less' : 'Know more'}
          </button>
          {knowMore && <p className="mt-2 text-[13px] leading-relaxed text-muted">{bio}</p>}

          <ul className="mt-4 space-y-2.5">
            <li className="flex items-center gap-2.5 text-[13px] text-ink">
              <Briefcase size={16} className="shrink-0 text-muted-light" />
              <span>{mentor.experience?.trim() || 'Experience on request'}</span>
            </li>
            <li className="flex items-center gap-2.5 text-[13px] text-ink">
              <Users size={16} className="shrink-0 text-muted-light" />
              <span>{answered} mentee engagements</span>
            </li>
            <li className="flex items-center gap-2.5 text-[13px] text-ink">
              <CalendarCheck size={16} className="shrink-0 text-muted-light" />
              <span>~{responseHrs}h avg response</span>
            </li>
          </ul>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={shareProfile}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface hover:text-ink"
              aria-label="Share"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className={`ml-auto flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                saved
                  ? 'border-rose-500/30 bg-rose-500/15 text-rose-400'
                  : 'border-border text-muted hover:bg-surface hover:text-ink'
              }`}
              aria-label="Save mentor"
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-5 flex gap-6 border-b border-border">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'reviews', label: 'Reviews' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative pb-2.5 text-sm font-semibold transition ${
                  tab === t.id ? 'text-[#a5a0ff]' : 'text-muted-light'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#7C6CFF]" />
                )}
              </button>
            ))}
          </div>

          {tab === 'profile' ? (
            <>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                      filter === f.id
                        ? 'bg-[#5B4CFF] text-white'
                        : 'border border-border bg-surface text-muted'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-3">
                {(filter === 'all' || filter === 'skills') && (
                  <SectionCard>
                    <SoftChip icon={PlanTagIcon}>{planTag}</SoftChip>
                    <p className="mt-2.5 text-[15px] font-bold text-ink">
                      Ask {mentor.name?.split(' ')[0] || 'this mentor'}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[12px] text-muted">
                      <Clock size={12} />
                      {planId === 'expert_call' ? '20 Min live call' : `~${responseHrs}h response`}
                    </p>
                    {(categories.length > 0 || types.length > 0) && (
                      <p className="mt-2 line-clamp-2 text-[11px] text-muted">
                        {[...categories, ...types].slice(0, 4).join(' · ')}
                      </p>
                    )}

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                      Choose plan
                    </p>
                    <div className="mt-2 space-y-2">
                      {MENTOR_PLANS.map((p) => {
                        const active = planId === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPlanId(p.id)}
                            className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                              active
                                ? 'border-[#5B4CFF] bg-card shadow-sm ring-1 ring-[#5B4CFF]/30'
                                : 'border-border bg-surface/60 hover:bg-surface'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                active
                                  ? 'border-[#5B4CFF] bg-[#5B4CFF] text-white'
                                  : 'border-border bg-card text-transparent'
                              }`}
                            >
                              <Check size={11} strokeWidth={3} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-semibold text-ink">
                                {p.name}
                              </span>
                              <span className="block text-[11px] text-muted">{p.tagline}</span>
                            </span>
                            <span className="shrink-0 text-[13px] font-bold text-[#a5a0ff]">
                              {formatRupee(p.pricePaise)}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {typeof onAsk === 'function' ? (
                      <button
                        type="button"
                        onClick={handleAsk}
                        className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-ink shadow-sm"
                      >
                        <span>Ask Now</span>
                        <span className="font-bold text-[#a5a0ff]">{priceLabel}</span>
                      </button>
                    ) : null}
                  </SectionCard>
                )}

                {education.map((item, i) =>
                  show('education') ? (
                    <SectionCard key={`edu-${i}`}>
                      <SoftChip icon={GraduationCap}>Education</SoftChip>
                      <p className="mt-2.5 text-[15px] font-bold text-ink">
                        {[item.degree, item.field].filter(Boolean).join(' · ') || item.school}
                      </p>
                      <p className="mt-1 text-[12px] text-muted">
                        {[item.school, item.year].filter(Boolean).join(' · ')}
                      </p>
                    </SectionCard>
                  ) : null
                )}

                {certificates.map((item, i) =>
                  show('certificates') ? (
                    <SectionCard key={`cert-${i}`}>
                      <SoftChip icon={ScrollText}>Certificate</SoftChip>
                      <p className="mt-2.5 text-[15px] font-bold text-ink">{item.title}</p>
                      <p className="mt-1 text-[12px] text-muted">
                        {[item.issuer, item.year].filter(Boolean).join(' · ')}
                      </p>
                    </SectionCard>
                  ) : null
                )}

                {achievements.map((item, i) =>
                  show('achievements') ? (
                    <SectionCard key={`ach-${i}`}>
                      <SoftChip icon={Trophy}>Achievement</SoftChip>
                      <p className="mt-2.5 text-[15px] font-bold text-ink">{item.title}</p>
                      {(item.description || item.year) && (
                        <p className="mt-1 text-[12px] text-muted">
                          {[item.description, item.year].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </SectionCard>
                  ) : null
                )}

                {filter === 'skills' && skills.length > 0 && (
                  <SectionCard>
                    <SoftChip>Skills</SoftChip>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {languages.length > 0 && (
                      <p className="mt-2 text-[12px] text-muted">
                        Languages: {languages.join(', ')}
                      </p>
                    )}
                  </SectionCard>
                )}
              </div>
            </>
          ) : (
            <div className="mt-6 text-center">
              <Star size={28} className="mx-auto text-amber-400" fill="currentColor" />
              <p className="mt-2 text-2xl font-bold text-ink">
                {rating ? rating.toFixed(1) : '—'}
              </p>
              <p className="mt-1 text-sm text-muted">
                {reviews} review{reviews === 1 ? '' : 's'} · {answered} questions answered
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-card p-4">
          {typeof onAsk === 'function' ? (
            <>
              <button
                type="button"
                onClick={handleAsk}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B4CFF] to-[#7C6CFF] px-4 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(91,76,255,0.35)]"
              >
                Ask with {selectedPlan.name} · {priceLabel}
              </button>
              {planRequiresExpertSelection(planId) ? (
                <p className="mt-2 text-center text-[11px] text-muted-light">
                  {selectedPlan.tagline}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-center text-[12px] text-muted">Mentor profile preview</p>
          )}
        </div>
      </div>
    </div>
  )
}
