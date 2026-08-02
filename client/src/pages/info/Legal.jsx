import { Link } from 'react-router-dom'
import InfoPage from '../../components/layout/InfoPage'

const docs = [
  {
    to: '/privacy',
    title: 'Privacy Policy',
    blurb: 'How we collect, use, and protect your information.',
  },
  {
    to: '/terms',
    title: 'Terms of Service',
    blurb: 'Rules for using Replyfy as a seeker or mentor.',
  },
  {
    to: '/refund',
    title: 'Refund & Cancellation Policy',
    blurb: 'When refunds and cancellations apply to purchases.',
  },
]

export default function Legal() {
  return (
    <InfoPage
      theme="light"
      eyebrow="Legal"
      title="Legal"
      lead="Policies and agreements that govern your use of Replyfy."
    >
      <div className="space-y-3">
        {docs.map((doc) => (
          <Link
            key={doc.to}
            to={doc.to}
            className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/40"
          >
            <h2 className="text-base font-semibold text-slate-900">{doc.title}</h2>
            <p className="mt-1 text-slate-500">{doc.blurb}</p>
          </Link>
        ))}
      </div>
      <p>
        For legal inquiries, email{' '}
        <a href="mailto:connect@upedd.org" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          connect@upedd.org
        </a>
        .
      </p>
    </InfoPage>
  )
}
