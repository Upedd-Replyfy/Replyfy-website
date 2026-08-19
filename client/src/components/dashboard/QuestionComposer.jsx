import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowUp,
  Sparkles,
  X,
  FileText,
  FileImage,
  Upload,
  Loader2,
  Link2,
  Paperclip,
} from 'lucide-react'
import { CategoryPills, ExpertTypeTabs } from '../catalog/CatalogSelectors'
import SuggestionCarousel from './SuggestionCarousel'
import { useAuth } from '../../context/AuthContext'
import { getQuestionPlaceholder } from '../../utils/questionPrompts'

const FILE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt'

const ALLOWED_EXT = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'txt',
])

const MAX_QUESTION_LENGTH = 2000
const MAX_FILES = 5

function isImageFile(file) {
  return file?.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(file?.name || '')
}

function LinkChips({ links, onRemove }) {
  if (!links.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((url, index) => (
        <span
          key={`${url}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
        >
          <Link2 size={12} />
          <span className="max-w-[160px] truncate">{url}</span>
          <button type="button" onClick={() => onRemove(index)} className="text-muted">
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  )
}
function isAllowedFile(file) {
  const ext = String(file?.name || '')
    .split('.')
    .pop()
    ?.toLowerCase()
  if (ALLOWED_EXT.has(ext)) return true
  return Boolean(file?.type && (file.type.startsWith('image/') || file.type === 'application/pdf'))
}

export default function QuestionComposer({
  categories,
  categoriesLoading,
  categoryId,
  onCategoryChange,
  expertTypes,
  expertTypesLoading,
  expertTypeId,
  onExpertTypeChange,
  selectedCategory,
  selectedExpertType,
  mentorTypesEnabled = true,
  query,
  onQueryChange,
  files,
  onFilesChange,
  links = [],
  onLinksChange,
  onSubmit,
  loading,
}) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const linkInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')

  const placeholder = getQuestionPlaceholder(selectedCategory, selectedExpertType)

  useEffect(() => {
    if (!linkOpen) return undefined
    const frame = window.requestAnimationFrame(() => linkInputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [linkOpen])

  const addFiles = (incoming) => {
    const selected = Array.from(incoming || [])
    if (!selected.length) return

    const valid = []
    let rejected = false
    for (const file of selected) {
      if (!isAllowedFile(file)) {
        rejected = true
        continue
      }
      valid.push(file)
    }
    if (rejected) toast.error('Use images, PDF, or Word/Excel/PowerPoint files')

    const remaining = Math.max(0, MAX_FILES - files.length)
    if (!remaining) {
      toast.error(`You can attach up to ${MAX_FILES} files`)
      return
    }
    const next = valid.slice(0, remaining)
    if (valid.length > remaining) toast.error(`You can attach up to ${MAX_FILES} files`)
    if (next.length) onFilesChange([...files, ...next])
  }

  const handleFileSelect = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files || []))
  }

  const removeFile = (index) => onFilesChange(files.filter((_, i) => i !== index))

  const openFilePicker = () => fileInputRef.current?.click()

  const addLink = () => {
    const url = linkDraft.trim()
    if (!url) return
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    try {
      new URL(normalized)
    } catch {
      toast.error('Enter a valid link')
      return
    }
    if (links.some((existing) => existing.toLowerCase() === normalized.toLowerCase())) {
      toast.error('That link is already added')
      return
    }
    onLinksChange?.([...links, normalized])
    setLinkDraft('')
    setTimeout(() => linkInputRef.current?.focus(), 50)
  }

  const removeLink = (index) => onLinksChange?.(links.filter((_, i) => i !== index))

  const canSubmit = Boolean(query.trim() && categoryId)
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="mb-7 mt-4 text-center md:mt-8">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl">
          Your question,
          <br />
          <span className="font-light text-muted">answered </span>
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text font-semibold text-transparent">
            by a human.
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-sm leading-relaxed text-muted md:text-base">
          Real mentors — founders, CAs, advisors — read your question and reply personally.
          <span className="mt-1 block">Within 12 hrs.</span>
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl lg:text-4xl">
            Hey!{' '}
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="mt-2 text-base text-muted md:text-lg lg:text-xl">
            AI Gives Information. Humans Give Judgment.
          </p>
        </div>

        <CategoryPills
          categories={categories}
          selectedId={categoryId}
          onSelect={onCategoryChange}
          loading={categoriesLoading}
        />

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-luxury-sm)]">
        <div className="p-3 md:p-4">
          {mentorTypesEnabled ? (
            <ExpertTypeTabs
              expertTypes={expertTypes}
              selectedId={expertTypeId}
              onSelect={onExpertTypeChange}
              loading={expertTypesLoading}
            />
          ) : null}

          <div
            className="relative"
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={query}
              onChange={(e) => onQueryChange(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
              rows={4}
              placeholder={placeholder}
              className="min-h-[88px] w-full resize-none rounded-lg bg-transparent text-sm leading-relaxed text-ink placeholder:text-muted-light focus:outline-none md:min-h-[100px] md:text-base"
              autoFocus
            />
            {dragOver && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-surface/90">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Upload size={16} />
                  Drop files to attach
                </p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <span
                      key={`${file.name}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
                    >
                      {isImageFile(file) ? <FileImage size={12} /> : <FileText size={12} />}
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} className="text-muted">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {linkOpen ? (
            <div className="relative z-10 mt-3">
              <div className="flex items-center gap-2">
                <input
                  ref={linkInputRef}
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      addLink()
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      setLinkDraft('')
                      setLinkOpen(false)
                    }
                  }}
                  placeholder="https://example.com"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-muted-light focus:border-charcoal focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkDraft('')
                    setLinkOpen(false)
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-card hover:text-ink"
                  aria-label="Close links"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={FILE_ACCEPT}
                onChange={handleFileSelect}
                multiple
              />
              <button
                type="button"
                onClick={openFilePicker}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                <Paperclip size={15} className="shrink-0" />
                Files
              </button>
              <button
                type="button"
                onClick={() => setLinkOpen((open) => !open)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-ink ${
                  linkOpen ? 'text-ink' : 'text-muted'
                }`}
              >
                <Link2 size={15} className="shrink-0" />
                Links
              </button>
              <LinkChips links={links} onRemove={removeLink} />
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: canSubmit && !loading ? 1.01 : 1 }}
              whileTap={{ scale: canSubmit && !loading ? 0.99 : 1 }}
              onClick={onSubmit}
              disabled={!canSubmit || loading}
              className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Ask mentor
                  <ArrowUp size={14} />
                </>
              )}
            </motion.button>
          </div>
        </div>
        </div>

        <SuggestionCarousel
          category={selectedCategory}
          expertType={selectedExpertType}
          onSelect={onQueryChange}
        />
      </div>
    </motion.div>
  )
}
