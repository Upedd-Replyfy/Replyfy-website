import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AskQuestion from './pages/user/AskQuestion'
import UserQuestions from './pages/user/UserQuestions'
import QuestionDetail from './pages/user/QuestionDetail'
import ExpertDashboard from './pages/expert/ExpertDashboard'
import ExpertQuestions from './pages/expert/ExpertQuestions'
import ExpertQuestionDetail from './pages/expert/ExpertQuestionDetail'
import ExpertWallet from './pages/expert/ExpertWallet'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminAnswers from './pages/admin/AdminAnswers'
import AdminExperts from './pages/admin/AdminExperts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminExpertTypes from './pages/admin/AdminExpertTypes'
import AdminUsers from './pages/admin/AdminUsers'
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute'
import { ROLES } from './constants'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/ask" element={<AskQuestion />} />
          <Route path="/dashboard/questions" element={<UserQuestions />} />
          <Route path="/dashboard/questions/:id" element={<QuestionDetail />} />
        </Route>

        <Route element={<ProtectedRoute roles={[ROLES.EXPERT]} />}>
          <Route path="/expert" element={<ExpertDashboard />} />
          <Route path="/expert/questions" element={<ExpertQuestions />} />
          <Route path="/expert/questions/:id" element={<ExpertQuestionDetail />} />
          <Route path="/expert/wallet" element={<ExpertWallet />} />
        </Route>

        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/questions" element={<AdminQuestions />} />
          <Route path="/admin/answers" element={<AdminAnswers />} />
          <Route path="/admin/experts" element={<AdminExperts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/expert-types" element={<AdminExpertTypes />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
