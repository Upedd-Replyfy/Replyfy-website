import { motion } from 'framer-motion'

export default function GradientBlobs({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-neutral-200/40 blur-[80px]" />
      <div className="absolute top-[10%] right-[-5%] h-[50vh] w-[50vh] rounded-full bg-neutral-300/30 blur-[90px]" />
      <div className="absolute bottom-[5%] left-[20%] h-[40vh] w-[40vh] rounded-full bg-neutral-100/50 blur-[70px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-canvas via-transparent to-canvas-2" />
    </div>
  )
}
