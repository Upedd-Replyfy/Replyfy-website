import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Auth from '../../pages/Auth'

const FRAME_W = 1080
const FRAME_H = 680

function usePreviewScale(open) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!open) return undefined

    const update = () => {
      const padding = 48
      const maxW = window.innerWidth - padding * 2
      const maxH = window.innerHeight - padding * 2 - 56
      setScale(Math.min(maxW / FRAME_W, maxH / FRAME_H, 1.15))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [open])

  return scale
}

function stopPropagation(e) {
  e.stopPropagation()
}

export default function AuthPreviewModal({ mode, onClose }) {
  const open = Boolean(mode)
  const scale = usePreviewScale(open)

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/92 px-4 py-6 backdrop-blur-md sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'signup' ? 'Sign up' : 'Log in'}
          onClick={onClose}
        >
          <div className="mb-4 flex w-full max-w-md items-center justify-between gap-4 lg:max-w-6xl">
            <p className="text-sm text-white/55">Replyfy account</p>
            <button
              type="button"
              onClick={(e) => {
                stopPropagation(e)
                onClose()
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <X size={16} />
              Close
            </button>
          </div>

          {/* Mobile / tablet: form-only card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={stopPropagation}
            className="flex max-h-[min(90dvh,720px)] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#EEF0F3] shadow-[0_40px_120px_rgba(0,0,0,0.75)] lg:hidden"
          >
            <div className="w-full overflow-y-auto">
              <Auth key={mode} initialMode={mode} embedded onClose={onClose} />
            </div>
          </motion.div>

          {/* Desktop: scaled preview frame with split layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={stopPropagation}
            className="hidden overflow-hidden rounded-2xl border border-white/15 bg-[#171818] shadow-[0_40px_120px_rgba(0,0,0,0.75)] lg:block"
            style={{
              width: FRAME_W * scale,
              height: FRAME_H * scale,
            }}
          >
            <div
              className="flex origin-top-left flex-col bg-[#171818]"
              style={{
                width: FRAME_W,
                height: FRAME_H,
                transform: `scale(${scale})`,
              }}
            >
              <div className="flex h-[34px] shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#171818] px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[10px] text-white/35">replyfy.app/{mode}</span>
              </div>
              <Auth key={mode} initialMode={mode} embedded onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
