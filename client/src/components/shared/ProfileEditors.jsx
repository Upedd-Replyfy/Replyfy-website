import { Check, Plus, Trash2 } from 'lucide-react'

export function MultiSelectPanel({
  label,
  hint,
  options,
  selected,
  onToggle,
  emptyText,
  className = '',
}) {
  return (
    <div className={`space-y-2 ${className}`}>
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

/**
 * Editable list of object rows (education / certificates / achievements).
 * fields: [{ key, placeholder, span?, className? }]
 */
export function DetailListEditor({
  label,
  items,
  onChange,
  fields,
  emptyItem,
  addLabel = 'Add',
  inputClass = 'admin-input',
}) {
  const rows = Array.isArray(items) && items.length ? items : [emptyItem]

  const updateRow = (index, key, value) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    onChange(next)
  }

  const addRow = () => onChange([...rows, { ...emptyItem }])

  const removeRow = (index) => {
    const next = rows.filter((_, i) => i !== index)
    onChange(next.length ? next : [{ ...emptyItem }])
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink">{label}</p>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-surface"
        >
          <Plus size={12} />
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-2.5">
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((field) => (
                <input
                  key={field.key}
                  value={row[field.key] || ''}
                  onChange={(e) => updateRow(index, field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`${inputClass} ${field.span === 2 ? 'sm:col-span-2' : ''} ${field.className || ''}`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-500 hover:bg-rose-50"
                aria-label="Remove row"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
