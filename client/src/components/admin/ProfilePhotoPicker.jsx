import { useRef, useState, useEffect } from 'react'
import { Camera, X } from 'lucide-react'

export default function ProfilePhotoPicker({ value, onChange, label = 'Profile photo' }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!value) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(value)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    onChange(file)
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface transition-colors hover:border-sky-500/40 hover:bg-sky-500/5"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <Camera size={28} className="text-muted transition-colors group-hover:text-sky-400" />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Upload
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="admin-btn-secondary"
          >
            Choose photo
          </button>
          <p className="mt-2 text-xs text-muted-light">JPG, PNG or WebP. Max 5MB.</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-2 flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
            >
              <X size={12} /> Remove photo
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
    </div>
  )
}
