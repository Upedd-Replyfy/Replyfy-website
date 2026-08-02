import { useState } from 'react'
import { Mail, Clock, Send } from 'lucide-react'
import InfoPage from '../../components/layout/InfoPage'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <InfoPage
      theme="light"
      eyebrow="Company"
      title="Contact Us"
      lead="Have a question, feedback, or partnership inquiry? We'd love to hear from you. Whether you need support, want to become an expert, or simply have a suggestion, our team is here to help."
      wide
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
        <aside className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Get in Touch</h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p>
                <a
                  href="mailto:connect@upedd.org"
                  className="mt-1 block text-base font-medium text-sky-600 underline-offset-2 hover:underline"
                >
                  connect@upedd.org
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Clock size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Response Time
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  We typically respond within 1–2 business days.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Send Us a Message</h2>

          {sent ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
              Thanks — your message was noted. For a guaranteed reply, email us at{' '}
              <a href="mailto:connect@upedd.org" className="font-medium underline underline-offset-2">
                connect@upedd.org
              </a>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-slate-600">
                Full Name <span className="text-rose-500">*</span>
                <input required name="name" placeholder="Your name" className={inputClass} />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                Email Address <span className="text-rose-500">*</span>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                Subject
                <input name="subject" placeholder="What is this about?" className={inputClass} />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                Message <span className="text-rose-500">*</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  placeholder="Write your message…"
                  className={`${inputClass} resize-y`}
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 sm:w-auto"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </InfoPage>
  )
}
