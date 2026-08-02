import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CircleHelp } from 'lucide-react'
import ExpertPageHeader from '../../components/expert/ExpertPageHeader'
import ExpertPanel from '../../components/expert/ExpertPanel'
import ExpertUserCard from '../../components/expert/ExpertUserCard'
import ExpertQuestionPreviewModal from '../../components/expert/ExpertQuestionPreviewModal'
import { expertApi } from '../../services/api'

export default function ExpertQuestions() {
  const [preview, setPreview] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['expert-questions'],
    queryFn: () => expertApi.getQuestions({ limit: 50 }),
  })

  const questions = data?.questions || []

  return (
    <div className="space-y-5 sm:space-y-8">
      <ExpertPageHeader
        title="Assigned Questions"
        description={`${questions.length} active assignment${questions.length !== 1 ? 's' : ''} requiring your attention.`}
        badge={
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-700 sm:px-4 sm:py-2 sm:text-sm dark:text-sky-300">
            {questions.length} total
          </span>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card sm:h-48" />
          ))}
        </div>
      ) : questions.length ? (
        <ExpertPanel
          title="Your assignments"
          subtitle="Tap a card to preview details, then open to answer"
        >
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {questions.map((q) => (
              <ExpertUserCard key={q._id} question={q} onOpen={setPreview} />
            ))}
          </div>
        </ExpertPanel>
      ) : (
        <ExpertPanel>
          <div className="py-14 text-center">
            <CircleHelp className="mx-auto text-muted" size={28} />
            <p className="mt-3 text-base font-medium text-ink">No assigned questions</p>
            <p className="mt-1 text-sm text-muted">Check back later for new assignments.</p>
          </div>
        </ExpertPanel>
      )}

      <ExpertQuestionPreviewModal
        open={!!preview}
        question={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  )
}
