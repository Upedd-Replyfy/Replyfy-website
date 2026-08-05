import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import QuestionDetailModal from '../../components/questions/QuestionDetailModal'

/** Deep-link route: opens the same popup card used on My Questions. */
export default function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="px-4 py-10 text-center text-sm text-muted">Opening question…</div>
      <QuestionDetailModal
        open={!!id}
        questionId={id}
        onClose={() => navigate('/dashboard/questions', { replace: true })}
      />
    </DashboardLayout>
  )
}
