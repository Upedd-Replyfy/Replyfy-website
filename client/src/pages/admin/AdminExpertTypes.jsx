import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { adminApi } from '../../services/api'

export default function AdminExpertTypes() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', category: '', sortOrder: 0 })

  const { data: categoriesData } = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.getCategories })
  const { data, isLoading } = useQuery({ queryKey: ['admin-expert-types'], queryFn: () => adminApi.getExpertTypes() })

  const categories = categoriesData?.categories || []

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
      return editing ? adminApi.updateExpertType(editing, payload) : adminApi.createExpertType(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Mentor type updated' : 'Mentor type created')
      setEditing(null)
      setForm({ name: '', description: '', category: '', sortOrder: 0 })
      queryClient.invalidateQueries({ queryKey: ['admin-expert-types'] })
      queryClient.invalidateQueries({ queryKey: ['expert-types'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const disableMutation = useMutation({
    mutationFn: (id) => adminApi.deleteExpertType(id),
    onSuccess: () => {
      toast.success('Mentor type disabled')
      queryClient.invalidateQueries({ queryKey: ['admin-expert-types'] })
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Mentor Types"
        description="Define mentor roles within each category"
      />

      <div className="admin-panel grid gap-3 rounded-[20px] border border-white/[0.08] bg-[#202323] p-6 sm:grid-cols-2">
        <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. Founder)" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
          <option value="">Select category</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} placeholder="Sort order" type="number" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
        <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm sm:col-span-2" />
        <button type="button" onClick={() => saveMutation.mutate()} disabled={!form.name || !form.category || saveMutation.isPending} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold sm:col-span-2">
          {editing ? 'Update Mentor Type' : 'Create Mentor Type'}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? <div className="luxury-card h-20 animate-pulse bg-surface" /> : (data?.expertTypes || []).map((type) => (
          <div key={type._id} className="admin-panel flex items-center justify-between rounded-[20px] border border-white/[0.08] bg-[#202323] p-5">
            <div>
              <p className="font-semibold text-ink">{type.name}</p>
              <p className="text-sm text-muted">{type.category?.name} · {type.slug}</p>
              <p className="text-xs text-muted-light">{type.description}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEditing(type._id); setForm({ name: type.name, description: type.description || '', category: type.category?._id || type.category, sortOrder: type.sortOrder || 0 }) }} className="rounded-lg border border-border px-3 py-1.5 text-xs">Edit</button>
              <button type="button" onClick={() => disableMutation.mutate(type._id)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Disable</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
