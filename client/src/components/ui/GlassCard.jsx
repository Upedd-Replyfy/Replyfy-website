import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', float = false, delay = 0 }) {
  return (
    <motion.div
      animate={
        float
          ? {
              y: [0, -10, 0],
              transition: {
                duration: 5 + delay,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              },
            }
          : undefined
      }
      className={`glass rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}
