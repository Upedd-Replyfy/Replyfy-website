import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Pencil, UserPlus, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminModal from '../../components/admin/AdminModal'
import ProfilePhotoPicker from '../../components/admin/ProfilePhotoPicker'
import { adminApi } from '../../services/api'

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#1A1C1C] px-4 py-2.5 text-sm text-ink focus:border-sky-500/40 focus:outline-none'

function ExpertAvatar({ expert }) {
  const src = expert.user?.avatar || expert.profilePhoto
  const initials = expert.user?.name?.charAt(0)?.toUpperCase() || '?'

  if (src) {
    return <img src={src} alt="" className="h-10 w-10 rounded-full object-cover" />
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
      {initials}
    </span>
  )
}

export default function AdminExperts() {
  const { openRegisterExpert } = useOutletContext() || {}
  const queryClient = useQueryClient()
  const [editExpert, setEditExpert] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editPhoto, setEditPhoto] = useState(null)
  const [deleteExpert, setDeleteExpert] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-experts'], queryFn: adminApi.getExperts })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteExpert(id),
    onSuccess: () => {
      toast.success('Expert profile deleted')
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
      toast.success('Expert updated')
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
        title="Experts"
        description="Register, verify, and manage expert accounts"
        actions={
          <button
            type="button"
            onClick={openRegisterExpert}
            className="admin-btn-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            <UserPlus size={16} /> Register Expert
          </button>
        }
      />

      <div className="admin-panel overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#202323]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#242727]">
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-muted-light">
                <th className="px-5 py-3">Expert</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading...</td></tr>
              ) : (data?.experts || []).length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No experts yet. Register one to get started.</td></tr>
              ) : (
                data.experts.map((e) => (
                  <tr key={e._id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ExpertAvatar expert={e} />
                        <div>
                          <p className="font-medium text-ink">
                            {e.user?.name}
                            {e.isVerified && <span className="ml-1 text-[10px] text-sky-400">✓</span>}
                          </p>
                          <p className="text-xs text-muted">{e.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{e.category?.name} · {e.expertType?.name}</td>
                    <td className="px-5 py-4 text-ink">★ {e.averageRating || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        e.availability === 'available'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/[0.08] text-muted'
                      }`}>
                        {e.availability}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openEdit(e)} className="rounded-lg border border-white/[0.08] p-2 text-muted hover:text-ink" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteExpert(e)}
                          className="rounded-lg border border-white/[0.08] p-2 text-muted hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal open={!!editExpert} onClose={() => { setEditExpert(null); setEditPhoto(null) }} title="Edit Expert" size="md">
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editForm.isVerified} onChange={(ev) => setEditForm((p) => ({ ...p, isVerified: ev.target.checked }))} />
            Verified expert
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editForm.isActive} onChange={(ev) => setEditForm((p) => ({ ...p, isActive: ev.target.checked }))} />
            Account active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditExpert(null)} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={updateMutation.isPending} className="admin-btn-gradient rounded-xl px-4 py-2 text-sm font-semibold">
              Save Changes
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={!!deleteExpert}
        onClose={() => setDeleteExpert(null)}
        title="Delete Expert Profile"
        description={`Permanently delete ${deleteExpert?.user?.name}'s profile and account? This cannot be undone.`}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setDeleteExpert(null)} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(deleteExpert._id)}
            disabled={deleteMutation.isPending}
            className="admin-btn-danger rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Profile'}
          </button>
        </div>
      </AdminModal>
    </div>
  )
}
