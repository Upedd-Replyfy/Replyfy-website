import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save, Settings2 } from 'lucide-react'
import ExpertPanel from '../../components/expert/ExpertPanel'
import ProfilePhotoPicker from '../../components/admin/ProfilePhotoPicker'
import { DetailListEditor, MultiSelectPanel } from '../../components/shared/ProfileEditors'
import {
  EMPTY_ACHIEVEMENT,
  EMPTY_CERTIFICATE,
  EMPTY_EDUCATION,
  cleanDetailList,
  idListFromRefs,
} from '../../components/shared/profileEditorUtils'
import { catalogApi, expertApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20'

export default function ExpertSettings() {
  const { user, loadProfile } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState(user?.name || '')
  const [form, setForm] = useState({ bio: '', experience: '', languages: '', skills: '' })
  const [photo, setPhoto] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [education, setEducation] = useState([EMPTY_EDUCATION])
  const [certificates, setCertificates] = useState([EMPTY_CERTIFICATE])
  const [achievements, setAchievements] = useState([EMPTY_ACHIEVEMENT])
  const [hydrated, setHydrated] = useState(false)

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['expert-profile'],
    queryFn: expertApi.getProfile,
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: catalogApi.getCategories,
  })
  const { data: typesData } = useQuery({
    queryKey: ['catalog-expert-types-all'],
    queryFn: () => catalogApi.getExpertTypes(),
  })

  const profile = profileData?.profile
  const categories = categoriesData?.categories || []
  const allTypes = typesData?.expertTypes || []

  useEffect(() => {
    if (!profile || hydrated) return
    setName(profile.name || user?.name || '')
    setForm({
      bio: profile.bio || '',
      experience: profile.experience || '',
      languages: (profile.languages || []).join(', '),
      skills: (profile.skills || []).join(', '),
    })
    setSelectedCategories(idListFromRefs(profile.categories, profile.category))
    setSelectedTypes(idListFromRefs(profile.expertTypes, profile.expertType))
    setEducation(profile.education?.length ? profile.education : [EMPTY_EDUCATION])
    setCertificates(profile.certificates?.length ? profile.certificates : [EMPTY_CERTIFICATE])
    setAchievements(profile.achievements?.length ? profile.achievements : [EMPTY_ACHIEVEMENT])
    setHydrated(true)
  }, [profile, user?.name, hydrated])

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

  const saveMutation = useMutation({
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
        name: name.trim(),
        ...form,
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
          fd.append(k, String(v))
        })
        fd.append('photo', photo)
        return expertApi.updateProfile(fd)
      }

      return expertApi.updateProfile(payload)
    },
    onSuccess: async () => {
      toast.success('Profile updated')
      setPhoto(null)
      setHydrated(false)
      queryClient.invalidateQueries({ queryKey: ['expert-profile'] })
      if (typeof loadProfile === 'function') await loadProfile()
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-luxury-sm)] sm:p-5">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
          <Settings2 size={11} />
          Settings
        </div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Edit your mentor profile
        </h1>
        <p className="mt-1 max-w-xl text-xs text-muted sm:text-sm">
          Update your bio, specialties, education, certificates, and achievements. These details appear on Find Mentors.
        </p>
      </section>

      <ExpertPanel title="Profile details">
        {isLoading && !hydrated ? (
          <div className="space-y-3 p-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <ProfilePhotoPicker
                value={photo}
                onChange={setPhoto}
                label={photo ? 'New profile photo' : 'Update profile photo'}
              />
              {profile?.profilePhoto && !photo ? (
                <img
                  src={profile.profilePhoto}
                  alt=""
                  className="mt-3 h-16 w-16 rounded-full object-cover ring-2 ring-border"
                />
              ) : null}
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name *"
              className={inputClass}
              required
            />
            <input
              value={form.experience}
              onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
              placeholder="Experience (e.g. 10+ years)"
              className={inputClass}
            />

            <div className="sm:col-span-2">
              <MultiSelectPanel
                label="Categories *"
                hint="Topics you can advise on"
                options={categoryOptions}
                selected={selectedCategories}
                onToggle={toggleCategory}
                emptyText="No categories available"
              />
            </div>

            <div className="sm:col-span-2">
              <MultiSelectPanel
                label="Mentor types *"
                hint={
                  selectedCategories.length
                    ? 'Types from your selected categories'
                    : 'Select a category first'
                }
                options={typeOptions}
                selected={selectedTypes}
                onToggle={toggleType}
                emptyText={
                  selectedCategories.length
                    ? 'No types for selected categories'
                    : 'Choose categories first'
                }
              />
            </div>

            <input
              value={form.languages}
              onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))}
              placeholder="Languages (comma separated)"
              className={inputClass}
            />
            <input
              value={form.skills}
              onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
              placeholder="Skills (comma separated)"
              className={inputClass}
            />
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Bio"
              rows={4}
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

            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
              >
                <Save size={15} />
                {saveMutation.isPending ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        )}
      </ExpertPanel>
    </div>
  )
}
