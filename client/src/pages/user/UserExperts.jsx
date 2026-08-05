import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchX, Users } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import MentorDetailModal from '../../components/mentors/MentorDetailModal'
import MentorCard, { MentorCardSkeleton } from '../../components/mentors/MentorCard'
import MentorFilterBar from '../../components/mentors/MentorFilterBar'
import MentorPageHeader from '../../components/mentors/MentorPageHeader'
import { catalogApi } from '../../services/api'
import { useCategories } from '../../hooks/useCatalog'

function parseExperienceYears(text = '') {
  const nums = String(text).match(/\d+(\.\d+)?/g)
  if (!nums?.length) return null
  return Math.max(...nums.map(Number))
}

function matchesExperience(expert, band) {
  if (!band) return true
  const years = parseExperienceYears(expert.experience)
  if (years == null) return band === ''
  if (band === 'junior') return years <= 3
  if (band === 'mid') return years > 3 && years <= 7
  if (band === 'senior') return years > 7
  return true
}

export default function UserExperts() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [search, setSearch] = useState(initialSearch)
  const [categoryId, setCategoryId] = useState('')
  const [experience, setExperience] = useState('')
  const [minRating, setMinRating] = useState('')
  const [availability, setAvailability] = useState('')
  const [sort, setSort] = useState('rating')
  const [selected, setSelected] = useState(null)
  const [favorites, setFavorites] = useState(() => new Set())
  const [bookmarks, setBookmarks] = useState(() => new Set())

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-experts', categoryId, search],
    queryFn: () =>
      catalogApi.getExperts({
        category: categoryId || undefined,
        search: search.trim() || undefined,
        limit: 48,
      }),
  })

  const categoryOptions = useMemo(
    () => [{ _id: '', name: 'All categories' }, ...categories],
    [categories]
  )

  const experts = data?.experts || []

  const filtered = useMemo(() => {
    let list = [...experts]

    if (minRating) {
      const min = Number(minRating)
      list = list.filter((e) => (Number(e.averageRating) || 0) >= min)
    }

    if (availability === 'available') {
      list = list.filter((e) => e.availability === 'available' || e.isAvailable)
    }

    if (experience) {
      list = list.filter((e) => matchesExperience(e, experience))
    }

    list.sort((a, b) => {
      if (sort === 'name') return String(a.name || '').localeCompare(String(b.name || ''))
      if (sort === 'answers') return (b.completedAnswers || 0) - (a.completedAnswers || 0)
      if (sort === 'response') return (a.responseTime || 99) - (b.responseTime || 99)
      return (b.averageRating || 0) - (a.averageRating || 0)
    })

    return list
  }, [experts, minRating, availability, experience, sort])

  const stats = useMemo(() => {
    const verified = filtered.filter((e) => e.isVerified).length
    const available = filtered.filter((e) => e.availability === 'available' || e.isAvailable).length
    return { total: filtered.length, verified, available }
  }, [filtered])

  const resetFilters = () => {
    setSearch('')
    setCategoryId('')
    setExperience('')
    setMinRating('')
    setAvailability('')
    setSort('rating')
  }

  const toggleSet = (setter) => (expert) => {
    const id = expert._id
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const goAsk = (mentor, planId) => {
    navigate('/dashboard', {
      state: {
        reset: true,
        selectedPlan: planId || 'mentor',
        selectedExpertId: mentor?.userId || mentor?.user?._id,
        selectedExpertName: mentor?.name,
      },
    })
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 lg:py-10"
      >
        <MentorPageHeader
          total={stats.total}
          verified={stats.verified}
          available={stats.available}
        />

        <div className="mt-8">
          <MentorFilterBar
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categories={categoryOptions}
            categoriesLoading={categoriesLoading}
            experience={experience}
            onExperienceChange={setExperience}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            availability={availability}
            onAvailabilityChange={setAvailability}
            sort={sort}
            onSortChange={setSort}
            onReset={resetFilters}
          />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <MentorCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-[24px] border border-dashed border-border bg-card px-6 py-20 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
                {search || categoryId || experience || minRating || availability ? (
                  <SearchX size={24} />
                ) : (
                  <Users size={24} />
                )}
              </span>
              <h2 className="mt-5 text-xl font-semibold text-ink">No mentors match</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Try another search, clear a filter, or reset to browse the full mentor directory.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-[#5B4CFF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(91,76,255,0.28)] transition hover:brightness-110"
              >
                Reset filters
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                {filtered.map((expert, index) => (
                  <MentorCard
                    key={expert._id}
                    expert={expert}
                    index={index}
                    onOpen={setSelected}
                    onAsk={(m, planId) => goAsk(m, planId || 'mentor')}
                    favorited={favorites.has(expert._id)}
                    bookmarked={bookmarks.has(expert._id)}
                    onToggleFavorite={toggleSet(setFavorites)}
                    onToggleBookmark={toggleSet(setBookmarks)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <MentorDetailModal
        open={!!selected}
        mentor={selected}
        onClose={() => setSelected(null)}
        onAsk={(mentor, planId) => {
          setSelected(null)
          goAsk(mentor, planId)
        }}
      />
    </DashboardLayout>
  )
}
