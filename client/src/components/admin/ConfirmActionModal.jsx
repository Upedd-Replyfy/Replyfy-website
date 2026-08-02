import AdminModal from './AdminModal'
import AdminButton from './ui/AdminButton'

export default function ConfirmActionModal({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
}) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <AdminButton variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </AdminButton>
        <AdminButton variant={variant} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </AdminButton>
      </div>
    </AdminModal>
  )
}
