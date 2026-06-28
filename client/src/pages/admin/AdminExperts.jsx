import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { adminApi } from '../../services/api'

const adminNav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/expert-types', label: 'Expert Types' },
  { to: '/admin/experts', label: 'Experts' },
  { to: '/admin/questions', label: 'Questions' },
  { to: '/admin/users', label: 'Users' },
]

const emptyForm = {
  name: '', email: '', password: '', bio: '', experience: '',
  languages: '', skills: '', category: '', expertType: '',
  responseTime: 48, questionPrice: 99900, hourlyPrice: 0,
  isVerified: false, availability: 'available',
}

export default function AdminExperts() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-experts'], queryFn: adminApi.getExperts })
  const { data: categoriesData } = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.getCategories })
  const { data: typesData } = useQuery({
    queryKey: ['admin-expert-types', form.category],
    queryFn: () => adminApi.getExpertTypes({ category: form.category }),
    enabled: !!form.category,
  })

  const categories = categoriesData?.categories || []
  const expertTypes = typesData?.expertTypes || []

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photo', photo)
      return adminApi.createExpert(fd)
    },
    onSuccess: () => {
      toast.success('Expert created')
      setShowForm(false)
      setForm(emptyForm)
      setPhoto(null)
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => adminApi.deleteExpert(id),
    onSuccess: () => {
      toast.success('Expert deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <DashboardShell title="Experts" nav={adminNav}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Manage Experts</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
          Create Expert
        </button>
      </div>

      {showForm && (
        <div className="luxury-card mt-6 grid gap-3 p-6 sm:grid-cols-2">
          {['name', 'email', 'password', 'experience', 'bio'].map((field) => (
            <input key={field} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} placeholder={field} type={field === 'password' ? 'password' : 'text'} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
          ))}
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, expertType: '' }))} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
            <option value="">Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={form.expertType} onChange={(e) => setForm((p) => ({ ...p, expertType: e.target.value }))} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" disabled={!form.category}>
            <option value="">Expert type</option>
            {expertTypes.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <input value={form.languages} onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))} placeholder="Languages (comma separated)" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
          <input value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} placeholder="Skills (comma separated)" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
          <input value={form.responseTime} onChange={(e) => setForm((p) => ({ ...p, responseTime: e.target.value }))} placeholder="Response time (hours)" type="number" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
          <input value={form.questionPrice} onChange={(e) => setForm((p) => ({ ...p, questionPrice: e.target.value }))} placeholder="Question price (paise)" type="number" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="text-sm sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))} />
            Mark as verified
          </label>
          <button type="button" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold sm:col-span-2">
            Create Expert Account
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? <div className="luxury-card h-20 animate-pulse bg-surface" /> : (data?.experts || []).map((e) => (
          <div key={e._id} className="luxury-card flex items-center justify-between p-5">
            <div>
              <p className="font-semibold text-ink">{e.user?.name} {e.isVerified && <span className="text-xs text-muted">✓ Verified</span>}</p>
              <p className="text-sm text-muted">{e.user?.email}</p>
              <p className="mt-1 text-xs text-muted-light">
                {e.category?.name} · {e.expertType?.name} · {e.experience} · ★ {e.averageRating}
              </p>
              <p className="text-xs text-muted-light">
                {(e.skills || []).join(', ')} · {e.availability} · ₹{(e.questionPrice || 0) / 100}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-center text-xs font-semibold ${e.status === 'active' && e.availability === 'available' ? 'bg-ink text-white' : 'bg-surface text-muted'}`}>
                {e.availability}
              </span>
              {e.status === 'active' && (
                <button type="button" onClick={() => deactivateMutation.mutate(e._id)} className="rounded-lg border border-border px-3 py-1 text-xs">Deactivate</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
