import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminModal from './AdminModal'
import ProfilePhotoPicker from './ProfilePhotoPicker'
import { DetailListEditor, MultiSelectPanel } from '../shared/ProfileEditors'
import {
  EMPTY_ACHIEVEMENT,
  EMPTY_CERTIFICATE,
  EMPTY_EDUCATION,
  cleanDetailList,
  idListFromRefs,
} from '../shared/profileEditorUtils'
import { adminApi } from '../../services/api'

const inputClass = 'admin-input'

function buildInitialState(expert) {
  return {
    form: {
      bio: expert.bio || '',
      experience: expert.experience || '',
      languages: (expert.languages || []).join(', '),
      skills: (expert.skills || []).join(', '),
      availability: expert.availability || 'available',
      isVerified: !!expert.isVerified,
      status: expert.status || 'active',
      isActive: expert.user?.isActive !== false,
      responseTime: expert.responseTime ?? 48,
      maxAssignments: expert.maxAssignments ?? 5,
    },
    selectedCategories: idListFromRefs(expert.categories, expert.category),
    selectedTypes: idListFromRefs(expert.expertTypes, expert.expertType),
    education: expert.education?.length ? expert.education : [EMPTY_EDUCATION],
    certificates: expert.certificates?.length ? expert.certificates : [EMPTY_CERTIFICATE],
    achievements: expert.achievements?.length ? expert.achievements : [EMPTY_ACHIEVEMENT],
  }
}

function EditExpertForm({ expert, onClose }) {
  const queryClient = useQueryClient()
  const initial = useMemo(() => buildInitialState(expert), [expert])
  const [form, setForm] = useState(initial.form)
  const [photo, setPhoto] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(initial.selectedCategories)
  const [selectedTypes, setSelectedTypes] = useState(initial.selectedTypes)
  const [education, setEducation] = useState(initial.education)
  const [certificates, setCertificates] = useState(initial.certificates)
  const [achievements, setAchievements] = useState(initial.achievements)

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  })
  const { data: typesData } = useQuery({
    queryKey: ['admin-expert-types-all'],
    queryFn: () => adminApi.getExpertTypes(),
  })

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.categories || [])
        .filter((c) => c.isActive !== false)
        .map((c) => ({ id: String(c._id), label: c.name })),
    [categoriesData]
  )

  const allTypes = useMemo(
    () => (typesData?.expertTypes || []).filter((t) => t.isActive !== false),
    [typesData]
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
      if (current.includes(key)) return current.filter((x) => x !== key)
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

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedCategories.length || !selectedTypes.length) {
        throw new Error('Select at least one category and mentor type')
      }

      const categoryIds = [...selectedCategories.map(String)]
      const typeIds = selectedTypes.map(String)
      typeIds.forEach((typeId) => {
        const t = allTypes.find((x) => String(x._id) === typeId)
        const catId = String(t?.category?._id || t?.category || '')
        if (catId && !categoryIds.includes(catId)) categoryIds.push(catId)
      })

      const primaryType = allTypes.find((t) => String(t._id) === typeIds[0])
      const primaryCategory = String(
        primaryType?.category?._id || primaryType?.category || categoryIds[0] || ''
      )

      const edu = cleanDetailList(education, ['school', 'degree', 'field'])
      const certs = cleanDetailList(certificates, ['title'])
      const ach = cleanDetailList(achievements, ['title'])

      const payload = {
        ...form,
        isVerified: !!form.isVerified,
        isActive: !!form.isActive,
        categories: categoryIds,
        expertTypes: typeIds,
        categoriesJson: JSON.stringify(categoryIds),
        expertTypesJson: JSON.stringify(typeIds),
        categoryIds: categoryIds.join(','),
        expertTypeIds: typeIds.join(','),
        category: primaryCategory,
        expertType: typeIds[0] || '',
        education: edu,
        certificates: certs,
        achievements: ach,
        educationJson: JSON.stringify(edu),
        certificatesJson: JSON.stringify(certs),
        achievementsJson: JSON.stringify(ach),
      }

      if (photo) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return
          if (Array.isArray(v)) {
            fd.append(`${k}Json`, JSON.stringify(v))
            if (k === 'categories') fd.append('categoryIds', v.join(','))
            else if (k === 'expertTypes') fd.append('expertTypeIds', v.join(','))
            return
          }
          if (typeof v === 'boolean') fd.append(k, v ? 'true' : 'false')
          else fd.append(k, String(v))
        })
        fd.append('photo', photo)
        return adminApi.updateExpert(expert._id, fd)
      }

      return adminApi.updateExpert(expert._id, payload)
    },
    onSuccess: () => {
      toast.success('Mentor updated')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        updateMutation.mutate()
      }}
      className="grid max-h-[min(70vh,720px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <ProfilePhotoPicker
          value={photo}
          onChange={setPhoto}
          label={photo ? 'New profile photo' : 'Update profile photo'}
        />
      </div>

      <input
        value={form.experience || ''}
        onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
        placeholder="Experience (e.g. 10+ years)"
        className={inputClass}
      />
      <select
        value={form.availability || 'available'}
        onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
        className={inputClass}
      >
        <option value="available">Available</option>
        <option value="busy">Busy</option>
        <option value="unavailable">Unavailable</option>
      </select>

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

      <input
        value={form.languages || ''}
        onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))}
        placeholder="Languages (comma separated)"
        className={inputClass}
      />
      <input
        value={form.skills || ''}
        onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
        placeholder="Skills (comma separated)"
        className={inputClass}
      />
      <input
        type="number"
        min={1}
        value={form.responseTime ?? 48}
        onChange={(e) => setForm((p) => ({ ...p, responseTime: e.target.value }))}
        placeholder="Response time (hours)"
        className={inputClass}
      />
      <input
        type="number"
        min={1}
        value={form.maxAssignments ?? 5}
        onChange={(e) => setForm((p) => ({ ...p, maxAssignments: e.target.value }))}
        placeholder="Max assignments"
        className={inputClass}
      />

      <textarea
        value={form.bio || ''}
        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
        placeholder="Bio"
        rows={3}
        className={`${inputClass} sm:col-span-2`}
      />

      <DetailListEditor
        label="Education"
        items={education}
        onChange={setEducation}
        emptyItem={EMPTY_EDUCATION}
        addLabel="Add education"
        inputClass={inputClass}
        fields={[
          { key: 'school', placeholder: 'School / University', span: 2 },
          { key: 'degree', placeholder: 'Degree' },
          { key: 'field', placeholder: 'Field of study' },
          { key: 'year', placeholder: 'Year' },
        ]}
      />

      <DetailListEditor
        label="Certificates"
        items={certificates}
        onChange={setCertificates}
        emptyItem={EMPTY_CERTIFICATE}
        addLabel="Add certificate"
        inputClass={inputClass}
        fields={[
          { key: 'title', placeholder: 'Certificate title', span: 2 },
          { key: 'issuer', placeholder: 'Issuer' },
          { key: 'year', placeholder: 'Year' },
        ]}
      />

      <DetailListEditor
        label="Achievements"
        items={achievements}
        onChange={setAchievements}
        emptyItem={EMPTY_ACHIEVEMENT}
        addLabel="Add achievement"
        inputClass={inputClass}
        fields={[
          { key: 'title', placeholder: 'Achievement title', span: 2 },
          { key: 'description', placeholder: 'Short description', span: 2 },
          { key: 'year', placeholder: 'Year' },
        ]}
      />

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={!!form.isVerified}
          onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))}
        />
        Verified mentor
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={!!form.isActive}
          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
        />
        Account active
      </label>

      <div className="flex justify-end gap-2 pt-2 sm:col-span-2 max-sm:flex-col-reverse">
        <button type="button" onClick={onClose} className="admin-btn-secondary max-sm:w-full">
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="admin-btn-gradient rounded-xl px-4 py-2 text-sm font-semibold max-sm:w-full"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export default function EditExpertModal({ expert, open, onClose }) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Edit Mentor"
      description={`Update ${expert?.user?.name || 'mentor'} profile, types, and credentials`}
      size="lg"
    >
      {open && expert ? (
        <EditExpertForm key={expert._id} expert={expert} onClose={onClose} />
      ) : null}
    </AdminModal>
  )
}
