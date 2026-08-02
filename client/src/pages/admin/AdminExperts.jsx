import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import ProfilePhotoPicker from '../../components/admin/ProfilePhotoPicker'
import SendNotificationModal from '../../components/admin/SendNotificationModal'
import AdminAvatar from '../../components/admin/ui/AdminAvatar'
import AdminBadge from '../../components/admin/ui/AdminBadge'
import AdminButton from '../../components/admin/ui/AdminButton'
import { adminApi } from '../../services/api'

const inputClass = 'admin-input'

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
            className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function AdminExperts() {
  const { openRegisterExpert } = useOutletContext() || {}
  const queryClient = useQueryClient()
  const [editExpert, setEditExpert] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editPhoto, setEditPhoto] = useState(null)
  const [deleteExpert, setDeleteExpert] = useState(null)
  const [query, setQuery] = useState('')
  const [notifyRecipient, setNotifyRecipient] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-experts'], queryFn: adminApi.getExperts })

  const experts = data?.experts || []
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return experts
    return experts.filter((e) => {
      const hay = [e.user?.name, e.user?.email, e.category?.name, e.expertType?.name]
        .concat((e.categories || []).map((c) => c?.name))
        .concat((e.expertTypes || []).map((t) => t?.name))
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [experts, query])

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

  const updateMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(editForm).forEach(([k, v]) => {
        if (k === 'isVerified' || k === 'isActive') fd.append(k, v ? 'true' : 'false')
        else if (v !== undefined && v !== null) fd.append(k, String(v))
      })
      if (editPhoto) fd.append('photo', editPhoto)
      return adminApi.updateExpert(editExpert._id, fd)
    },
    onSuccess: () => {
      toast.success('Mentor updated')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      setEditExpert(null)
      setEditPhoto(null)
    },
    onError: (err) => toast.error(err.message),
  })

  const openEdit = (e) => {
    setEditExpert(e)
    setEditPhoto(null)
    setEditForm({
      bio: e.bio || '',
      experience: e.experience || '',
      availability: e.availability || 'available',
      isVerified: e.isVerified || false,
      status: e.status || 'active',
      isActive: e.user?.isActive !== false,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Directory"
        title="Mentors"
        description="Register, verify, and manage mentor accounts"
        actions={
          <AdminButton icon={UserPlus} onClick={openRegisterExpert}>
            Register Mentor
          </AdminButton>
        }
      />

      <AdminStatStrip items={stats} />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Mentor directory</p>
            <p className="text-xs text-slate-500">{filtered.length} shown</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mentors..."
              className="admin-input py-2 pl-9"
            />
          </label>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-12 text-center text-slate-500">No mentors match your search.</p>
          ) : (
            <div className="divide-y divide-border">
              {                filtered.map((e) => {
                const categories = labelList(e.categories, e.category)
                const types = labelList(e.expertTypes, e.expertType)

                return (
                  <div key={e._id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <AdminAvatar
                        src={e.user?.avatar || e.profilePhoto}
                        name={e.user?.name}
                        size="lg"
                        verified={!!e.isVerified}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-slate-900">{e.user?.name}</p>
                        <p className="truncate text-xs text-slate-500">{e.user?.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <AdminBadge tone={availabilityTone(e.availability)} dot>
                            {e.availability || 'offline'}
                          </AdminBadge>
                          <RatingStars value={e.averageRating || 0} />
                        </div>
                        <p className="mt-2 text-xs font-medium text-slate-700">
                          {categories.join(', ') || '—'}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                          {types.join(', ') || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="soft"
                        size="icon"
                        aria-label="Send notification"
                        onClick={() => {
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
                        }}
                      >
                        <Bell size={14} />
                      </AdminButton>
                      <AdminButton
                        variant="secondary"
                        size="icon"
                        aria-label="Edit mentor"
                        onClick={() => openEdit(e)}
                      >
                        <Pencil size={14} />
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        size="icon"
                        aria-label="Delete mentor"
                        onClick={() => setDeleteExpert(e)}
                      >
                        <Trash2 size={14} />
                      </AdminButton>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="hidden max-h-[min(70vh,760px)] overflow-auto md:block">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-slate-400">
                <th className="px-5 py-3.5 font-semibold">Mentor</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Rating</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading mentors...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">No mentors match your search.</td></tr>
              ) : (
                filtered.map((e, index) => {
                  const categories = labelList(e.categories, e.category)
                  const types = labelList(e.expertTypes, e.expertType)

                  return (
                    <tr
                      key={e._id}
                      className={`border-b border-border/80 transition-colors hover:bg-indigo-50/40 ${
                        index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <AdminAvatar
                            src={e.user?.avatar || e.profilePhoto}
                            name={e.user?.name}
                            size="lg"
                            verified={!!e.isVerified}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-slate-900">
                              {e.user?.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">{e.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <FolderTree size={13} />
                          </span>
                          <div className="min-w-0 max-w-[280px]">
                            <p className="font-medium leading-snug text-slate-800">
                              {categories.join(', ') || '—'}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              {types.join(', ') || '—'}
                            </p>
                            {(categories.length > 1 || types.length > 1) && (
                              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                                {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} · {types.length} type
                                {types.length === 1 ? '' : 's'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RatingStars value={e.averageRating || 0} />
                      </td>
                      <td className="px-5 py-4">
                        <AdminBadge tone={availabilityTone(e.availability)} dot>
                          {e.availability || 'offline'}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <AdminButton
                            variant="soft"
                            size="icon"
                            aria-label="Send notification"
                            title="Send notification"
                            onClick={() => {
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
                            }}
                          >
                            <Bell size={14} />
                          </AdminButton>
                          <AdminButton
                            variant="secondary"
                            size="icon"
                            aria-label="Edit mentor"
                            title="Edit"
                            onClick={() => openEdit(e)}
                          >
                            <Pencil size={14} />
                          </AdminButton>
                          <AdminButton
                            variant="danger"
                            size="icon"
                            aria-label="Delete mentor"
                            title="Delete profile"
                            onClick={() => setDeleteExpert(e)}
                          >
                            <Trash2 size={14} />
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal open={!!editExpert} onClose={() => { setEditExpert(null); setEditPhoto(null) }} title="Edit Mentor" size="md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
          className="space-y-3"
        >
          <ProfilePhotoPicker
            value={editPhoto}
            onChange={setEditPhoto}
            label={editPhoto ? 'New profile photo' : 'Update profile photo'}
          />
          <input value={editForm.experience} onChange={(ev) => setEditForm((p) => ({ ...p, experience: ev.target.value }))} placeholder="Experience" className={inputClass} />
          <textarea value={editForm.bio} onChange={(ev) => setEditForm((p) => ({ ...p, bio: ev.target.value }))} placeholder="Bio" rows={3} className={inputClass} />
          <select value={editForm.availability} onChange={(ev) => setEditForm((p) => ({ ...p, availability: ev.target.value }))} className={inputClass}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={editForm.isVerified} onChange={(ev) => setEditForm((p) => ({ ...p, isVerified: ev.target.checked }))} />
            Verified mentor
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={editForm.isActive} onChange={(ev) => setEditForm((p) => ({ ...p, isActive: ev.target.checked }))} />
            Account active
          </label>
          <div className="flex justify-end gap-2 pt-2 max-sm:flex-col-reverse">
            <button type="button" onClick={() => setEditExpert(null)} className="admin-btn-secondary max-sm:w-full">Cancel</button>
            <button type="submit" disabled={updateMutation.isPending} className="admin-btn-gradient rounded-xl px-4 py-2 text-sm font-semibold max-sm:w-full">
              Save Changes
            </button>
          </div>
        </form>
      </AdminModal>

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
