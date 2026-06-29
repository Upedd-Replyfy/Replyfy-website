import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminModal from './AdminModal'
import ProfilePhotoPicker from './ProfilePhotoPicker'
import { adminApi } from '../../services/api'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  bio: '',
  experience: '',
  languages: '',
  skills: '',
  category: '',
  expertType: '',
  isVerified: true,
  availability: 'available',
}

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#090909] px-4 py-2.5 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none'

export default function RegisterExpertModal({ open, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
    enabled: open,
  })
  const { data: typesData } = useQuery({
    queryKey: ['admin-expert-types', form.category],
    queryFn: () => adminApi.getExpertTypes({ category: form.category }),
    enabled: open && !!form.category,
  })

  const categories = categoriesData?.categories?.filter((c) => c.isActive !== false) || []
  const expertTypes = typesData?.expertTypes?.filter((t) => t.isActive !== false) || []

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'isVerified') fd.append(k, v ? 'true' : 'false')
        else fd.append(k, String(v))
      })
      if (photo) fd.append('photo', photo)
      return adminApi.createExpert(fd)
    },
    onSuccess: () => {
      toast.success('Expert registered successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setForm(emptyForm)
      setPhoto(null)
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.category || !form.expertType) {
      toast.error('Fill all required fields')
      return
    }
    createMutation.mutate()
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Register Expert"
      description="Create a new expert account with profile"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name *" className={inputClass} />
        <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email *" className={inputClass} />
        <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password (min 6) *" className={inputClass} />
        <input value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} placeholder="Experience (e.g. 10+ years)" className={inputClass} />
        <select required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, expertType: '' }))} className={inputClass}>
          <option value="">Select category *</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select required value={form.expertType} onChange={(e) => setForm((p) => ({ ...p, expertType: e.target.value }))} disabled={!form.category} className={inputClass}>
          <option value="">Select expert type *</option>
          {expertTypes.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <input value={form.languages} onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))} placeholder="Languages (comma separated)" className={inputClass} />
        <input value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} placeholder="Skills (comma separated)" className={inputClass} />
        <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={3} className={`${inputClass} sm:col-span-2`} />
        <div className="sm:col-span-2">
          <ProfilePhotoPicker value={photo} onChange={setPhoto} />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))} />
          Mark as verified expert
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-ink">
            Cancel
          </button>
          <button type="submit" disabled={createMutation.isPending} className="admin-btn-gradient rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50">
            {createMutation.isPending ? 'Creating...' : 'Register Expert'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
