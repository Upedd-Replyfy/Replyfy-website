import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import { fadeUp } from '../../utils/animations'

const faqs = [
  {
    question: 'How is this different from asking ChatGPT?',
    answer:
      'AI gives generic answers from public data. Replyfy connects you with a verified human expert who reviews your specific situation and writes a tailored response.',
  },
  {
    question: "What if I'm not satisfied with the answer?",
    answer:
      "Priority and Consultation plans include revision rounds. If the response doesn't address your question, request a clarification within your plan limits.",
  },
  {
    question: 'How are payments handled?',
    answer:
      'We use Razorpay for secure payment processing. Your payment is confirmed only after signature verification. We never store card details.',
  },
  {
    question: 'Can I choose a specific expert?',
    answer:
      'Experts are matched based on category and availability. Consultation-tier questions are assigned to senior experts in the relevant field.',
  },
  {
    question: 'What types of questions can I ask?',
    answer:
      "Business, finance, legal, product, engineering, and career questions are welcome. We don't handle medical diagnoses or emergency situations.",
  },
]

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-ink">{question}</span>
        <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-muted">
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted leading-relaxed pr-10">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="section-spacing relative w-full bg-card">
      <div className="page-container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeader
            eyebrow="FAQ"
            title="Questions,"
            highlight="answered"
            description="Everything you need to know before asking your first question."
            align="left"
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="luxury-card px-6 md:px-8"
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
