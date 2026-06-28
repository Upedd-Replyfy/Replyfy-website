import { Navigate } from 'react-router-dom'

export default function AskQuestion() {
  return <Navigate to="/dashboard" replace state={{ reset: true }} />
}
