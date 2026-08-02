import { Link } from 'react-router-dom'
import InfoPage from '../../components/layout/InfoPage'

export default function Refund() {
  return (
    <InfoPage
      theme="light"
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      lead="Effective Date: August 2, 2026. Replyfy provides digital, experience-based services. Please read this policy before making a purchase."
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Order Confirmation</h2>
        <p>An order is confirmed once payment has been successfully received.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Refund Eligibility</h2>
        <p>Refunds may be considered only in the following situations:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Duplicate payment</li>
          <li>Payment deducted but order not created</li>
          <li>Technical failure preventing service delivery</li>
          <li>Replyfy is unable to process your request</li>
        </ul>
        <p>Approved refunds will be processed through the original payment method.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Non-Refundable Situations</h2>
        <p>Refunds will generally not be provided if:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your question has already been reviewed or assigned for processing.</li>
          <li>An expert has begun working on your request.</li>
          <li>You disagree with or dislike the expert&apos;s opinion or recommendation.</li>
          <li>Your expectations differ from the response provided.</li>
        </ul>
        <p>
          Replyfy delivers experience-based guidance. Different experts may reasonably offer different
          perspectives.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Quality Commitment</h2>
        <p>
          Our priority is the quality of the response, not simply speed or convenience. We carefully review and
          assign questions to deliver thoughtful, experience-based guidance.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Cancellation</h2>
        <p>Requests may only be cancelled before processing begins.</p>
        <p>
          Once a question has entered our review or assignment process, cancellation may no longer be
          possible.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Failed Transactions</h2>
        <p>
          If payment fails but money is deducted, the amount is generally reversed automatically by your
          bank or payment provider according to their policies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Contact</h2>
        <p>
          For payment-related queries, contact:{' '}
          <a href="mailto:connect@upedd.org" className="font-medium text-sky-600 underline-offset-2 hover:underline">
            connect@upedd.org
          </a>
        </p>
      </section>

      <p className="text-slate-500">
        Related:{' '}
        <Link to="/privacy" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Privacy Policy
        </Link>{' '}
        ·{' '}
        <Link to="/terms" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Terms of Service
        </Link>{' '}
        ·{' '}
        <Link to="/legal" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Legal
        </Link>
      </p>
    </InfoPage>
  )
}
