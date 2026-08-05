import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Pencil,
  UserPlus,
  Trash2,
  Search,
  Star,
  ShieldCheck,
  Users,
  Bell,
  FolderTree,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import AdminStatStrip from '../../components/admin/AdminStatStrip'
import EditExpertModal from '../../components/admin/EditExpertModal'
import SendNotificationModal from '../../components/admin/SendNotificationModal'
import MentorDetailModal from '../../components/mentors/MentorDetailModal'
import AdminAvatar from '../../components/admin/ui/AdminAvatar'
import AdminBadge from '../../components/admin/ui/AdminBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import { adminApi } from '../../services/api'

function availabilityTone(availability) {
  if (availability === 'available') return 'available'
  if (availability === 'busy') return 'busy'
  return 'offline'
}

/** Prefer populated `.name`; never show raw Mongo ids in the UI. */
function labelList(multi, primary, key = 'name') {
  const fromMulti = (Array.isArray(multi) ? multi : [])
    .map((item) => {
      if (item && typeof item === 'object') return item[key] || null
      return null
    })
    .filter(Boolean)
  if (fromMulti.length) return fromMulti

  if (primary && typeof primary === 'object') {
    const name = primary[key]
    return name ? [name] : []
  }
  return []
}

function RatingStars({ value = 0 }) {
  const rating = Number(value) || 0
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={12}
            className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-light'}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink">{rating.toFixed(1)}</span>
    </div>
  )
}

function toMentorProfile(expert) {
  if (!expert) return null
  const photo = expert.profilePhoto || expert.user?.avatar || expert.avatar || ''
  return {
    ...expert,
    name: expert.user?.name || expert.name,
    email: expert.user?.email || expert.email,
    profilePhoto: photo,
    avatar: photo,
    bio: expert.bio,
    experience: expert.experience,
    languages: expert.languages || [],
    skills: expert.skills || [],
    education: expert.education || [],
    certificates: expert.certificates || [],
    achievements: expert.achievements || [],
    completedAnswers: expert.completedAnswers,
    averageRating: expert.averageRating,
    totalRatings: expert.totalRatings,
    reviewCount: expert.totalRatings || expert.reviewCount,
    responseTime: expert.responseTime,
    availability: expert.availability,
    isAvailable: expert.availability === 'available',
    videoCallAvailable: expert.videoCallAvailable ?? false,
    isVerified: expert.isVerified,
    category: expert.category,
    expertType: expert.expertType,
    categories: expert.categories || [],
    expertTypes: expert.expertTypes || [],
  }
}

function MentorAdminCard({ expert, index, onOpen, onEdit, onDelete, onNotify }) {
  const categories = labelList(expert.categories, expert.category)
  const types = labelList(expert.expertTypes, expert.expertType)
  const rating = Number(expert.averageRating) || 0
  const meta = [categories.slice(0, 2).join(', '), types.slice(0, 2).join(', ')]
    .filter(Boolean)
    .join(' · ')

  return (
    <motion.article
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen?.(expert)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(expert)
        }
      }}
      className="premium-surface group relative cursor-pointer rounded-[14px] px-3 py-2.5 transition hover:border-[#5B4CFF]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4CFF]/40"
    >
      <div className="relative z-[1] flex items-center gap-2.5">
        <AdminAvatar
          src={expert.user?.avatar || expert.profilePhoto}
          name={expert.user?.name}
          size="md"
          verified={!!expert.isVerified}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-ink">
              {expert.user?.name}
            </h3>
            <AdminBadge tone={availabilityTone(expert.availability)} dot className="shrink-0">
              {expert.availability || 'offline'}
            </AdminBadge>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted">{expert.user?.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <RatingStars value={rating} />
            {meta ? (
              <span className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] text-muted">
                <FolderTree size={10} className="shrink-0 text-[#7C6CFF]" />
                <span className="truncate">{meta}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <AdminButton
            variant="soft"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Send notification"
            title="Send notification"
            onClick={() => onNotify(expert)}
          >
            <Bell size={13} />
          </AdminButton>
          <AdminButton
            variant="secondary"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Edit mentor"
            title="Edit"
            onClick={() => onEdit(expert)}
          >
            <Pencil size={13} />
          </AdminButton>
          <AdminButton
            variant="danger"
            size="icon"
            className="!h-8 !w-8"
            aria-label="Delete mentor"
            title="Delete profile"
            onClick={() => onDelete(expert)}
          >
            <Trash2 size={13} />
          </AdminButton>
        </div>
      </div>
    </motion.article>
  )
}

export default function AdminExperts() {
  const { openRegisterExpert } = useOutletContext() || {}
  const queryClient = useQueryClient()
  const [editExpert, setEditExpert] = useState(null)
  const [deleteExpert, setDeleteExpert] = useState(null)
  const [profileExpert, setProfileExpert] = useState(null)
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [notifyRecipient, setNotifyRecipient] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-experts'], queryFn: adminApi.getExperts })
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  })
  const { data: typesData } = useQuery({
    queryKey: ['admin-expert-types'],
    queryFn: () => adminApi.getExpertTypes(),
  })

  const experts = data?.experts || []
  const categories = categoriesData?.categories || []
  const expertTypes = typesData?.expertTypes || []

  const typesForFilter = useMemo(() => {
    if (!categoryId) return expertTypes
    return expertTypes.filter((t) => String(t.category?._id || t.category) === String(categoryId))
  }, [expertTypes, categoryId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return experts.filter((e) => {
      if (categoryId) {
        const catIds = [e.category?._id || e.category]
          .concat((e.categories || []).map((c) => c?._id || c))
          .filter(Boolean)
          .map(String)
        if (!catIds.includes(String(categoryId))) return false
      }
      if (typeId) {
        const typeIds = [e.expertType?._id || e.expertType]
          .concat((e.expertTypes || []).map((t) => t?._id || t))
          .filter(Boolean)
          .map(String)
        if (!typeIds.includes(String(typeId))) return false
      }
      if (!q) return true
      const hay = [e.user?.name, e.user?.email, e.category?.name, e.expertType?.name]
        .concat((e.categories || []).map((c) => c?.name))
        .concat((e.expertTypes || []).map((t) => t?.name))
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [experts, query, categoryId, typeId])

  const stats = useMemo(() => {
    const verified = experts.filter((e) => e.isVerified).length
    const available = experts.filter((e) => e.availability === 'available').length
    return [
      { label: 'Total mentors', value: experts.length, icon: Users },
      { label: 'Verified', value: verified, icon: ShieldCheck },
      { label: 'Available', value: available, icon: UserPlus },
      {
        label: 'Avg rating',
        value: experts.length
          ? (experts.reduce((s, e) => s + (e.averageRating || 0), 0) / experts.length).toFixed(1)
          : '—',
        icon: Star,
      },
    ]
  }, [experts])

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteExpert(id),
    onSuccess: () => {
      toast.success('Mentor profile deleted')
      setDeleteExpert(null)
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const handleNotify = (e) => {
    const userId = e.user?._id || e.user
    if (!userId) {
      toast.error('Mentor has no linked account')
      return
    }
    setNotifyRecipient({
      userId,
      name: e.user?.name,
      email: e.user?.email,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Directory"
        title="Mentors"
        description="Register, verify, and manage mentor accounts"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              variant="secondary"
              onClick={async () => {
                try {
                  const res = await adminApi.syncExpertCatalog()
                  toast.success(res.message || 'Catalog synced')
                  queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
                } catch (err) {
                  const msg = err.message || 'Sync failed'
                  toast.error(
                    /Route not found/i.test(msg)
                      ? 'Sync API missing on server — redeploy the backend, then try again'
                      : msg
                  )
                }
              }}
            >
              Sync catalog
            </AdminButton>
            <AdminButton icon={UserPlus} onClick={openRegisterExpert}>
              Register Mentor
            </AdminButton>
          </div>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="premium-filter flex flex-col gap-2.5 rounded-[16px] px-3.5 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Mentor directory</p>
            <p className="text-xs text-muted">{filtered.length} shown</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mentors..."
              className="h-9 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted-light focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setTypeId('')
            }}
            className="h-9 rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="h-9 rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-[#5B4CFF]/40 focus:ring-4 focus:ring-[#5B4CFF]/10"
            aria-label="Filter by mentor type"
          >
            <option value="">All types</option>
            {typesForFilter.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
                {t.category?.name ? ` · ${t.category.name}` : ''}
              </option>
            ))}
          </select>
          {(categoryId || typeId || query) && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCategoryId('')
                setTypeId('')
              }}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-muted transition hover:border-[#5B4CFF]/30 hover:text-[#7C6CFF]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="premium-surface h-[68px] animate-pulse rounded-[14px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B4CFF]/15 text-[#7C6CFF]">
            <Users size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">No mentors match</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted">
            Try another search or register a new mentor.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e, index) => (
            <MentorAdminCard
              key={e._id}
              expert={e}
              index={index}
              onOpen={setProfileExpert}
              onEdit={setEditExpert}
              onDelete={setDeleteExpert}
              onNotify={handleNotify}
            />
          ))}
        </div>
      )}

      <MentorDetailModal
        open={!!profileExpert}
        mentor={toMentorProfile(profileExpert)}
        onClose={() => setProfileExpert(null)}
      />

      <EditExpertModal
        open={!!editExpert}
        expert={editExpert}
        onClose={() => setEditExpert(null)}
      />

      <AdminModal
        open={!!deleteExpert}
        onClose={() => setDeleteExpert(null)}
        title="Delete Mentor Profile"
        description={`Permanently delete ${deleteExpert?.user?.name}'s profile and account? This cannot be undone.`}
        size="sm"
      >
        <div className="flex justify-end gap-2 max-sm:flex-col-reverse">
          <button type="button" onClick={() => setDeleteExpert(null)} className="admin-btn-secondary max-sm:w-full">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(deleteExpert._id)}
            disabled={deleteMutation.isPending}
            className="admin-btn-danger rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 max-sm:w-full"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Profile'}
          </button>
        </div>
      </AdminModal>

      <SendNotificationModal
        open={!!notifyRecipient}
        onClose={() => setNotifyRecipient(null)}
        recipient={notifyRecipient}
      />
    </div>
  )
}
