import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Clock, Search, Star } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { catalogApi } from '../../services/api'
import { useCategories } from '../../hooks/useCatalog'

function avatarUrl(expert) {
  return (
    expert.profilePhoto ||
    expert.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=111&color=fff`
  )
}

export default function UserExperts() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(initialSearch)
  const [categoryId, setCategoryId] = useState('')
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-experts', categoryId, search],
    queryFn: () =>
      catalogApi.getExperts({
        category: categoryId || undefined,
        search: search.trim() || undefined,
        limit: 24,
      }),
  })

  const experts = data?.experts || []

  const categoryOptions = useMemo(
    () => [{ _id: '', name: 'All categories' }, ...categories],
    [categories]
  )

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink">Experts</h1>
          <p className="mt-1 text-sm text-muted">Browse verified experts and start a question with your preferred mentor.</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or expertise..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-light focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={categoriesLoading}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink focus:border-charcoal focus:outline-none"
          >
            {categoryOptions.map((cat) => (
              <option key={cat._id || 'all'} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="luxury-card h-56 animate-pulse bg-surface" />
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="luxury-card py-16 text-center">
            <p className="text-muted">No experts found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <article key={expert._id} className="luxury-card luxury-card-hover flex flex-col p-5">
                <div className="relative mb-4 inline-block">
                  <img src={avatarUrl(expert)} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-surface" />
                  {expert.isVerified && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-fg ring-2 ring-card">
                      <BadgeCheck size={11} />
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-ink">{expert.name}</p>
                <p className="text-xs text-muted">{expert.expertType?.name}</p>
                <p className="mt-2 line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-light">{expert.bio}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1 text-xs font-semibold text-ink">
                    <Star size={11} fill="currentColor" />
                    {expert.averageRating}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-light">
                    <Clock size={10} />
                    {expert.completedAnswers} answers
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard', { state: { reset: true } })}
                  className="btn-primary mt-4 w-full rounded-xl py-2.5 text-sm font-semibold"
                >
                  Ask this expert
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
