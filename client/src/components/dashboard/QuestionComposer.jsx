import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUp,
  Sparkles,
  X,
  FileText,
  Upload,
  Loader2,
  Link2,
  Paperclip,
} from 'lucide-react'
import { CategoryPills, ExpertTypeTabs } from '../catalog/CatalogSelectors'
import SuggestionCarousel from './SuggestionCarousel'

const FILE_TYPES = [
  { id: 'pdf', label: 'PDF', accept: '.pdf' },
  { id: 'resume', label: 'Resume', accept: '.pdf,.doc,.docx' },
  { id: 'pitch', label: 'Pitch Deck', accept: '.pdf,.ppt,.pptx' },
  { id: 'financial', label: 'Financial Docs', accept: '.pdf,.xls,.xlsx,.csv' },
]

const MAX_QUESTION_LENGTH = 2000

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
  query,
  onQueryChange,
  files,
  onFilesChange,
  links = [],
  onLinksChange,
  onSubmit,
  loading,
}) {
  const fileInputRef = useRef(null)
  const linkInputRef = useRef(null)
  const [activeFileType, setActiveFileType] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')

  const placeholder =
    selectedCategory?.placeholder ||
    selectedCategory?.description ||
    'Describe your question in detail...'

  const addFiles = (incoming) => {
    if (incoming.length) onFilesChange([...files, ...incoming])
  }

  const handleFileSelect = (e) => {
    addFiles(Array.from(e.target.files || []))
    e.target.value = ''
    setActiveFileType(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files || []))
  }

  const removeFile = (index) => onFilesChange(files.filter((_, i) => i !== index))

  const openFilePicker = (type) => {
    setActiveFileType(type)
    setTimeout(() => fileInputRef.current?.click(), 0)
  }

  const addLink = () => {
    const url = linkDraft.trim()
    if (!url) return
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    try {
      new URL(normalized)
      onLinksChange?.([...links, normalized])
      setLinkDraft('')
      setLinkOpen(false)
    } catch {
      setLinkDraft(url)
    }
  }

  const removeLink = (index) => onLinksChange?.(links.filter((_, i) => i !== index))

  const canSubmit = query.trim() && categoryId && expertTypeId

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="mb-6 text-center">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl">
          Your question,
          <br />
          <span className="font-light text-muted">answered by a human.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          Real experts — founders, CAs, mentors — read your question and reply personally. Within 24–48 hours.
        </p>
      </div>

      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
          <Sparkles size={16} strokeWidth={2} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
            What would you like help with today?
          </h1>
          <p className="mt-1 text-sm text-muted">
            Describe your question. A verified human expert — not AI — will respond.
          </p>
        </div>
      </div>

      <CategoryPills
        categories={categories}
        selectedId={categoryId}
        onSelect={onCategoryChange}
        loading={categoriesLoading}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-luxury-sm)]">
        <div className="p-3 md:p-4">
          <ExpertTypeTabs
            expertTypes={expertTypes}
            selectedId={expertTypeId}
            onSelect={onExpertTypeChange}
            loading={expertTypesLoading}
          />

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
            {(files.length > 0 || links.length > 0) && (
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
                      <FileText size={12} />
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} className="text-muted">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {links.map((url, index) => (
                    <span
                      key={`${url}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink"
                    >
                      <Link2 size={12} />
                      <span className="max-w-[140px] truncate">{url}</span>
                      <button type="button" onClick={() => removeLink(index)} className="text-muted">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {linkOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    ref={linkInputRef}
                    type="url"
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                    placeholder="https://..."
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs focus:border-charcoal focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="rounded-lg bg-ink px-3 py-2 text-xs font-medium text-white"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  activeFileType
                    ? FILE_TYPES.find((f) => f.id === activeFileType)?.accept
                    : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv'
                }
                onChange={handleFileSelect}
                multiple
              />
              <Paperclip size={15} className="shrink-0 text-muted" />
              {FILE_TYPES.map((ft) => (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => openFilePicker(ft.id)}
                  className="text-xs font-medium text-muted transition-colors hover:text-ink"
                >
                  {ft.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(true)
                  setTimeout(() => linkInputRef.current?.focus(), 50)
                }}
                className="text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                Link
              </button>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: canSubmit && !loading ? 1.01 : 1 }}
              whileTap={{ scale: canSubmit && !loading ? 0.99 : 1 }}
              onClick={onSubmit}
              disabled={!canSubmit || loading}
              className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Ask expert
                  <ArrowUp size={14} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <SuggestionCarousel category={selectedCategory} onSelect={onQueryChange} />
    </motion.div>
  )
}
