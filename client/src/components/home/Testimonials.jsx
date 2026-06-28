import { motion } from 'framer-motion'
import SectionHeader from '../ui/SectionHeader'
import { fadeUp, staggerContainer } from '../../utils/animations'

const testimonials = [
  {
    quote:
      'I spent weeks researching incorporation options. One answer from Replyfy gave me more clarity than 20 blog posts.',
    name: 'Ananya R.',
    role: 'Founder, pre-seed startup',
    initials: 'AR',
    tone: 'bg-charcoal',
  },
  {
    quote:
      'The expert actually read my full question and addressed my specific situation. Felt like a $500 consultation for a fraction of the price.',
    name: 'Rahul M.',
    role: 'Product Manager',
    initials: 'RM',
    tone: 'bg-muted',
  },
  {
    quote:
      'We used Replyfy before our Series A to sanity-check our cap table. The response was detailed, practical, and actionable.',
    name: 'Sarah K.',
    role: 'COO, Series A startup',
    initials: 'SK',
    tone: 'bg-ink',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-spacing relative w-full overflow-hidden bg-canvas">
      <div className="page-container">
        <SectionHeader
          eyebrow="Testimonials"
          title="Founders trust"
          highlight="real answers"
          description="Thousands of professionals use Replyfy when they need clarity, not more noise."
          className="mx-auto mb-12 md:mb-16"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.name}
              variants={fadeUp}
              custom={index * 0.1}
              whileHover={{ y: -4 }}
              className="luxury-card luxury-card-hover flex flex-col p-6 md:p-7"
            >
              <p className="text-sm md:text-base leading-relaxed text-ink flex-1">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tone} text-[10px] font-bold text-white`}
                >
                  {item.initials}
                </div>
                <div>
                  <cite className="not-italic text-sm font-semibold text-ink">{item.name}</cite>
                  <p className="text-xs text-muted-light">{item.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
