import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock,
  Languages,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Video,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AuthPreviewModal from '../components/auth/AuthPreviewModal'
import { useCategories, useExpertTypes, useExperts } from '../hooks/useCatalog'

function avatarUrl(mentor) {
  return (
    mentor.profilePhoto ||
    mentor.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || 'M')}&background=4f46e5&color=fff`
  )
}

function Stars({ value, size = 12 }) {
  const rating = Number(value) || 0
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className="text-amber-400"
          fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function StatCell({ label, children }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">{label}</p>
      <div className="mt-1.5 text-sm font-semibold text-[#111827]">{children}</div>
    </div>
  )
}

function MentorProfileCard({ mentor, onAsk, index = 0 }) {
  const skills = mentor.skills || []
  const languages = mentor.languages || []
  const experience = mentor.experience?.trim() || 'Background on request'
  const reviewed = mentor.completedAnswers ?? 0
  const rating = mentor.averageRating ?? 0
  const reviews = mentor.totalRatings || mentor.reviewCount || 0
  const responseHrs = mentor.responseTime || 12

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:border-violet-200/80 md:hover:-translate-y-1 md:hover:shadow-[0_24px_60px_rgba(99,102,241,0.12)]"
    >
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img
          src={avatarUrl(mentor)}
          alt={mentor.name}
          className="h-full w-full object-cover object-top transition duration-500 md:group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {mentor.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#111827] shadow-sm">
              <Star size={11} className="text-violet-600" fill="currentColor" />
              Top Mentor
            </span>
          )}
          {mentor.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
              <BadgeCheck size={11} />
              Verified
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold tracking-tight text-white">{mentor.name}</h3>
            <p className="mt-1 truncate text-sm text-white/75">
              {mentor.expertType?.name || 'Mentor'}
              {mentor.category?.name ? ` · ${mentor.category.name}` : ''}
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-white px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Stars value={rating} size={11} />
              <span className="text-xs font-bold text-[#111827]">{rating || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-3 text-[15px] leading-relaxed text-[#6B7280]">
          {mentor.bio?.trim() ||
            'Experienced mentor ready to help with practical, situation-specific guidance.'}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <StatCell label="Background">{experience}</StatCell>
          <StatCell label="Reviewed">
            <span className="flex items-center gap-1.5">
              <MessageSquare size={13} className="text-violet-500" />
              {reviewed} questions
            </span>
          </StatCell>
          <StatCell label="Rating">
            {rating}
            <span className="font-medium text-[#9CA3AF]"> / 5 · {reviews} reviews</span>
          </StatCell>
          <StatCell label="Response">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-sky-500" />~{responseHrs}h
            </span>
          </StatCell>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600/80">
            Achievements & focus
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {mentor.videoCallAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                <Video size={11} />
                Live calls
              </span>
            )}
            {skills.length > 0 ? (
              skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-100"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-medium text-[#6B7280]">
                Specialty mentoring
              </span>
            )}
          </div>
        </div>

        {languages.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Languages size={12} />
            {languages.join(' · ')}
          </p>
        )}

        <button
          type="button"
          onClick={() => onAsk(mentor)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(99,102,241,0.28)] transition duration-200 hover:scale-[1.015] hover:shadow-[0_14px_36px_rgba(99,102,241,0.36)] active:scale-[0.99]"
        >
          Ask this mentor
          <ArrowRight size={15} />
        </button>
      </div>
    </motion.article>
  )
}

function CategoryPills({ categories, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="mb-5 flex flex-wrap gap-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-[#F3F4F6]" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-5 flex flex-wrap gap-2.5">
      {categories.map((cat) => {
        const active = selectedId === cat._id
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => onSelect(cat)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 hover:scale-[1.03] active:scale-[0.98] ${
              active
                ? 'bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,0.28)]'
                : 'border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-violet-200 hover:text-violet-700'
            }`}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

function MentorTypeSegment({ expertTypes, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="mb-5 flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-[#F3F4F6]" />
        ))}
      </div>
    )
  }

  if (!expertTypes.length) {
    return <p className="mb-5 text-sm text-[#9CA3AF]">No mentor types for this category</p>
  }

  return (
    <div className="mb-5">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600/80">
        Mentor type
      </p>
      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-1.5">
        {expertTypes.map((type) => {
          const active = selectedId === type._id
          return (
            <button
              key={type._id}
              type="button"
              onClick={() => onSelect(type)}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200 ${
                active
                  ? 'bg-violet-100 text-violet-800 shadow-sm'
                  : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'
              }`}
            >
              {type.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DisplayMentors() {
  const [authMode, setAuthMode] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [expertTypeId, setExpertTypeId] = useState(null)
  const [sort, setSort] = useState('rating')

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: expertTypes = [], isLoading: expertTypesLoading } = useExpertTypes(categoryId)

  const expertParams = useMemo(
    () =>
      categoryId
        ? {
            category: categoryId,
            expertType: expertTypeId || undefined,
            availability: 'available',
            search: search.trim() || undefined,
            limit: 48,
            sort,
          }
        : null,
    [categoryId, expertTypeId, search, sort]
  )

  const { data, isLoading } = useExperts(expertParams, !!expertParams)
  const mentors = data?.experts || []

  useEffect(() => {
    if (categories.length && !categoryId) {
      setCategoryId(categories[0]._id)
    }
  }, [categories, categoryId])

  useEffect(() => {
    if (!expertTypes.length) {
      setExpertTypeId(null)
      return
    }
    setExpertTypeId((prev) => (expertTypes.some((t) => t._id === prev) ? prev : expertTypes[0]._id))
  }, [expertTypes])

  const handleCategoryChange = (cat) => {
    setCategoryId(cat._id)
    setExpertTypeId(null)
  }

  const handleAsk = () => setAuthMode('signup')

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="relative overflow-hidden bg-[#0F1115]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_80%_10%,rgba(139,92,246,0.22),transparent_50%)]"
        />
        <Navbar onAuthOpen={setAuthMode} />

        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-20 sm:px-8 sm:pb-20 md:pb-24 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3"
          >
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65 backdrop-blur">
              <Sparkles size={12} className="text-sky-300" />
              Mentor directory
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
              Find the{' '}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                right mentor
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
              Browse verified mentors by category and specialty. Compare ratings, backgrounds, and
              questions reviewed — then ask with confidence.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1280px] px-4 pb-16 sm:px-8 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="-mt-12 rounded-[24px] border border-[#E5E7EB] bg-white/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:-mt-16 sm:p-8"
        >
          <CategoryPills
            categories={categories}
            selectedId={categoryId}
            onSelect={handleCategoryChange}
            loading={categoriesLoading}
          />

          <MentorTypeSegment
            expertTypes={expertTypes}
            selectedId={expertTypeId}
            onSelect={(type) => setExpertTypeId(type._id)}
            loading={expertTypesLoading}
          />

          <div className="relative max-w-2xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or background…"
              className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] py-3.5 pl-12 pr-4 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] transition focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-200/70"
            />
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 sm:mt-10">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#111827] sm:text-xl">
              {isLoading
                ? 'Finding mentors…'
                : `${mentors.length} Mentor${mentors.length === 1 ? '' : 's'} Found`}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">Showing verified mentors</p>
          </div>

          <label className="relative inline-flex items-center">
            <span className="sr-only">Sort mentors</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 appearance-none rounded-2xl border border-[#E5E7EB] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[#374151] shadow-sm transition hover:border-violet-200 focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-200/60"
            >
              <option value="rating">Sort: Top rated</option>
              <option value="experience">Sort: Most reviewed</option>
              <option value="response">Sort: Fastest response</option>
              <option value="price_asc">Sort: Price low → high</option>
              <option value="price_desc">Sort: Price high → low</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
          </label>
        </div>

        <div className="mt-6 sm:mt-8">
          {isLoading || categoriesLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[540px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white"
                />
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <p className="text-lg font-semibold text-[#111827]">No mentors in this filter</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
                Try another category, mentor type, or clear your search to see more profiles.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {mentors.map((mentor, index) => (
                <MentorProfileCard
                  key={mentor._id || mentor.userId || index}
                  mentor={mentor}
                  index={index}
                  onAsk={handleAsk}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <AuthPreviewModal mode={authMode} onClose={() => setAuthMode(null)} />
    </div>
  )
}
