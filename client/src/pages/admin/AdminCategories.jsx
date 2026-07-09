import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { adminApi } from '../../services/api'

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', placeholder: '', suggestions: '', sortOrder: 0,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        suggestions: form.suggestions.split('\n').map((s) => s.trim()).filter(Boolean),
        sortOrder: Number(form.sortOrder) || 0,
      }
      return editing
        ? adminApi.updateCategory(editing, payload)
        : adminApi.createCategory(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created')
      setEditing(null)
      setForm({ name: '', description: '', placeholder: '', suggestions: '', sortOrder: 0 })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category disabled')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const startEdit = (cat) => {
    setEditing(cat._id)
    setForm({
      name: cat.name,
      description: cat.description || '',
      placeholder: cat.placeholder || '',
      suggestions: (cat.suggestions || []).join('\n'),
      sortOrder: cat.sortOrder || 0,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Manage question categories and suggestions"
        actions={
          <button
            type="button"
            onClick={() => { setEditing(null); setForm({ name: '', description: '', placeholder: '', suggestions: '', sortOrder: 0 }) }}
            className="admin-btn-gradient rounded-xl px-4 py-2 text-sm font-semibold"
          >
            New Category
          </button>
        }
      />

      <div className="admin-panel grid gap-3 rounded-[20px] border border-white/[0.08] bg-[#202323] p-6 sm:grid-cols-2">
        <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
        <input value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} placeholder="Sort order" type="number" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm" />
        <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm sm:col-span-2" />
        <input value={form.placeholder} onChange={(e) => setForm((p) => ({ ...p, placeholder: e.target.value }))} placeholder="Question placeholder" className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm sm:col-span-2" />
        <textarea value={form.suggestions} onChange={(e) => setForm((p) => ({ ...p, suggestions: e.target.value }))} placeholder="Suggestions (one per line)" rows={3} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm sm:col-span-2" />
        <button type="button" onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold sm:col-span-2">
          {editing ? 'Update Category' : 'Create Category'}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? <div className="luxury-card h-20 animate-pulse bg-surface" /> : (data?.categories || []).map((cat) => (
          <div key={cat._id} className="admin-panel flex items-center justify-between rounded-[20px] border border-white/[0.08] bg-[#202323] p-5">
            <div>
              <p className="font-semibold text-ink">{cat.name} <span className="text-xs text-muted">({cat.slug})</span></p>
              <p className="text-sm text-muted">{cat.description}</p>
              <p className="mt-1 text-xs text-muted-light">{(cat.suggestions || []).length} suggestions · order {cat.sortOrder}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(cat)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Edit</button>
              <button type="button" onClick={() => toggleMutation.mutate(cat._id)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-charcoal">
                {cat.isActive ? 'Disable' : 'Active'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
