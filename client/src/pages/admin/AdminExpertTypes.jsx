import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Tags, Pencil, Power } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { adminApi } from '../../services/api'

const fieldClass =
  'rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted-light focus:border-sky-500/40 focus:outline-none'

export default function AdminExpertTypes() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', category: '', sortOrder: 0 })

  const { data: categoriesData } = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.getCategories })
  const { data, isLoading } = useQuery({ queryKey: ['admin-expert-types'], queryFn: () => adminApi.getExpertTypes() })

  const categories = categoriesData?.categories || []
  const types = data?.expertTypes || []

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

      <div className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Tags size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{editing ? 'Edit mentor type' : 'Create mentor type'}</p>
            <p className="text-xs text-muted">Link a role to a category</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. Founder)" className={fieldClass} />
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={fieldClass}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} placeholder="Sort order" type="number" className={fieldClass} />
          <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className={`${fieldClass} sm:col-span-2`} />
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!form.name || !form.category || saveMutation.isPending}
            className="admin-btn-gradient rounded-xl px-4 py-2.5 text-sm font-semibold sm:col-span-2 disabled:opacity-50"
          >
            {editing ? 'Update Mentor Type' : 'Create Mentor Type'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <div className="admin-panel h-24 animate-pulse rounded-[20px] bg-[#202323] sm:col-span-2" />
        ) : types.length === 0 ? (
          <div className="admin-panel rounded-[20px] border border-white/[0.08] bg-[#202323] py-12 text-center text-muted sm:col-span-2">
            No mentor types yet
          </div>
        ) : (
          types.map((type) => (
            <div
              key={type._id}
              className="admin-panel flex flex-col justify-between rounded-[20px] border border-white/[0.08] bg-[#202323] p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{type.name}</p>
                  <AdminStatusBadge tone="violet">{type.category?.name || 'Uncategorized'}</AdminStatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-light">{type.slug}</p>
                <p className="mt-2 text-sm text-muted">{type.description || 'No description'}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(type._id)
                    setForm({
                      name: type.name,
                      description: type.description || '',
                      category: type.category?._id || type.category,
                      sortOrder: type.sortOrder || 0,
                    })
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-ink transition hover:border-sky-500/30 hover:bg-sky-500/10"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => disableMutation.mutate(type._id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600"
                >
                  <Power size={13} /> Disable
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
