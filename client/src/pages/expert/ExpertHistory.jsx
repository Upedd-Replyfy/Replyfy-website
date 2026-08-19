import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, History } from 'lucide-react'
import ExpertPageHeader from '../../components/expert/ExpertPageHeader'
import ExpertPanel from '../../components/expert/ExpertPanel'
import ExpertUserCard from '../../components/expert/ExpertUserCard'
import { expertApi } from '../../services/api'

export default function ExpertHistory() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['expert-history'],
    queryFn: () => expertApi.getQuestions({ status: 'completed', limit: 100 }),
  })

  const questions = data?.questions || []

  return (
    <div className="space-y-5">
      <ExpertPageHeader
        title="History"
        description="Questions you answered that were approved and delivered to the user."
        badge={
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:px-4 sm:py-2 sm:text-sm dark:text-emerald-300">
            {questions.length} solved
          </span>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : questions.length ? (
        <ExpertPanel
          title="Previous solved answers"
          subtitle="Open a card to read the question and the answer you delivered"
          noPadding
        >
          <div className="grid items-stretch gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {questions.map((q) => (
              <ExpertUserCard
                key={q._id}
                question={q}
                onOpen={(question) => navigate(`/expert/questions/${question._id}`)}
              />
            ))}
          </div>
        </ExpertPanel>
      ) : (
        <ExpertPanel>
          <div className="py-10 text-center">
            <History className="mx-auto text-muted" size={28} />
            <p className="mt-3 text-base font-medium text-ink">No solved answers yet</p>
            <p className="mt-1 text-sm text-muted">
              After admin approves your answer, it will show up in history.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={14} />
              Completed work stays here for later review
            </p>
          </div>
        </ExpertPanel>
      )}
    </div>
  )
}
