import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'
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
  isVerified: true,
  availability: 'available',
}

const inputClass = 'admin-input'

function MultiSelectPanel({ label, hint, options, selected, onToggle, emptyText }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-ink">{label}</p>
        <p className="text-[11px] text-muted">{selected.length} selected</p>
      </div>
      {hint ? <p className="text-[11px] text-muted-light">{hint}</p> : null}
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border bg-surface p-2">
        {options.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-muted">{emptyText}</p>
        ) : (
          options.map((opt) => {
            const active = selected.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggle(opt.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                  active
                    ? 'bg-sky-500/15 text-ink ring-1 ring-sky-500/30'
                    : 'text-muted hover:bg-card hover:text-ink'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    active ? 'border-sky-500 bg-sky-500 text-white' : 'border-border bg-card'
                  }`}
                >
                  {active ? <Check size={10} strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{opt.label}</span>
                {opt.meta ? <span className="shrink-0 text-[10px] text-muted-light">{opt.meta}</span> : null}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function RegisterExpertModal({ open, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
    enabled: open,
  })
  const { data: typesData } = useQuery({
    queryKey: ['admin-expert-types-all'],
    queryFn: () => adminApi.getExpertTypes(),
    enabled: open,
  })

  const categories = categoriesData?.categories?.filter((c) => c.isActive !== false) || []
  const allTypes = typesData?.expertTypes?.filter((t) => t.isActive !== false) || []

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: String(c._id), label: c.name })),
    [categories]
  )

  const typeOptions = useMemo(() => {
    if (!selectedCategories.length) return []
    const set = new Set(selectedCategories.map(String))
    return allTypes
      .filter((t) => set.has(String(t.category?._id || t.category)))
      .map((t) => ({
        id: String(t._id),
        label: t.name,
        meta: t.category?.name,
      }))
  }, [allTypes, selectedCategories])

  const toggleCategory = (id) => {
    const key = String(id)
    setSelectedCategories((prev) => {
      const next = prev.map(String).includes(key)
        ? prev.map(String).filter((x) => x !== key)
        : [...prev.map(String), key]
      const nextSet = new Set(next)
      setSelectedTypes((types) =>
        types.map(String).filter((typeId) => {
          const t = allTypes.find((x) => String(x._id) === typeId)
          return t && nextSet.has(String(t.category?._id || t.category))
        })
      )
      return next
    })
  }

  const toggleType = (id) => {
    const key = String(id)
    setSelectedTypes((prev) => {
      const current = prev.map(String)
      if (current.includes(key)) {
        return current.filter((x) => x !== key)
      }
      const type = allTypes.find((x) => String(x._id) === key)
      const catId = String(type?.category?._id || type?.category || '')
      if (catId) {
        setSelectedCategories((cats) =>
          cats.map(String).includes(catId) ? cats.map(String) : [...cats.map(String), catId]
        )
      }
      return [...current, key]
    })
  }

  const reset = () => {
    setForm(emptyForm)
    setPhoto(null)
    setSelectedCategories([])
    setSelectedTypes([])
  }

  const createMutation = useMutation({
    mutationFn: () => {
      const categoryIds = [...selectedCategories.map(String)]
      const typeIds = selectedTypes.map(String)

      // Auto-include parent category for every selected type
      typeIds.forEach((typeId) => {
        const t = allTypes.find((x) => String(x._id) === typeId)
        const catId = String(t?.category?._id || t?.category || '')
        if (catId && !categoryIds.includes(catId)) categoryIds.push(catId)
      })

      const primaryType = allTypes.find((t) => String(t._id) === typeIds[0])
      const primaryCategory = String(
        primaryType?.category?._id || primaryType?.category || categoryIds[0] || ''
      )

      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'isVerified') fd.append(k, v ? 'true' : 'false')
        else fd.append(k, String(v))
      })
      // Send multi-select in several formats for reliable multipart parsing on all hosts
      fd.append('categoriesJson', JSON.stringify(categoryIds))
      fd.append('expertTypesJson', JSON.stringify(typeIds))
      fd.append('categoryIds', categoryIds.join(','))
      fd.append('expertTypeIds', typeIds.join(','))
      categoryIds.forEach((id) => fd.append('categories', id))
      typeIds.forEach((id) => fd.append('expertTypes', id))
      fd.append('category', primaryCategory)
      fd.append('expertType', typeIds[0] || '')
      if (photo) fd.append('photo', photo)
      return adminApi.createExpert(fd)
    },
    onSuccess: () => {
      toast.success('Mentor registered successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      reset()
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required')
      return
    }
    if (!selectedCategories.length || !selectedTypes.length) {
      toast.error('Select at least one category and mentor type')
      return
    }
    createMutation.mutate()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title="Register Mentor"
      description="Create a new mentor account with one or more categories and types"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name *" className={inputClass} />
        <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email *" className={inputClass} />
        <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password (min 6) *" className={inputClass} />
        <input value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} placeholder="Experience (e.g. 10+ years)" className={inputClass} />

        <div className="sm:col-span-2">
          <MultiSelectPanel
            label="Categories *"
            hint="Select all topics this mentor can answer"
            options={categoryOptions}
            selected={selectedCategories}
            onToggle={toggleCategory}
            emptyText="No active categories"
          />
        </div>

        <div className="sm:col-span-2">
          <MultiSelectPanel
            label="Mentor types *"
            hint={
              selectedCategories.length
                ? 'Types from the selected categories'
                : 'Select a category first'
            }
            options={typeOptions}
            selected={selectedTypes}
            onToggle={toggleType}
            emptyText={
              selectedCategories.length
                ? 'No mentor types for the selected categories'
                : 'Choose categories to see mentor types'
            }
          />
        </div>

        <input value={form.languages} onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))} placeholder="Languages (comma separated)" className={inputClass} />
        <input value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} placeholder="Skills (comma separated)" className={inputClass} />
        <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={3} className={`${inputClass} sm:col-span-2`} />
        <div className="sm:col-span-2">
          <ProfilePhotoPicker value={photo} onChange={setPhoto} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))} />
          Mark as verified mentor
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2 max-sm:flex-col-reverse">
          <button type="button" onClick={handleClose} className="admin-btn-secondary max-sm:w-full">
            Cancel
          </button>
          <button type="submit" disabled={createMutation.isPending} className="admin-btn-gradient rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50 max-sm:w-full">
            {createMutation.isPending ? 'Creating...' : 'Register Mentor'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
