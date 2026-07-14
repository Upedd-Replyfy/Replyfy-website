import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DisplayMentors from './pages/DisplayMentors'
import Dashboard from './pages/Dashboard'
import AskQuestion from './pages/user/AskQuestion'
import UserQuestions from './pages/user/UserQuestions'
import QuestionDetail from './pages/user/QuestionDetail'
import UserExperts from './pages/user/UserExperts'
import UserSaved from './pages/user/UserSaved'
import UserBilling from './pages/user/UserBilling'
import UserSettings from './pages/user/UserSettings'
import ExpertLayout from './layouts/ExpertLayout'
import ExpertDashboard from './pages/expert/ExpertDashboard'
import ExpertQuestions from './pages/expert/ExpertQuestions'
import ExpertQuestionDetail from './pages/expert/ExpertQuestionDetail'
import ExpertWallet from './pages/expert/ExpertWallet'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminAnswers from './pages/admin/AdminAnswers'
import AdminExperts from './pages/admin/AdminExperts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminExpertTypes from './pages/admin/AdminExpertTypes'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPayments from './pages/admin/AdminPayments'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'
import AdminSettings from './pages/admin/AdminSettings'
import AdminNotifications from './pages/admin/AdminNotifications'
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute'
import { ROLES } from './constants'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mentors" element={<DisplayMentors />} />
        <Route path="/displaymentor" element={<Navigate to="/mentors" replace />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/ask" element={<AskQuestion />} />
          <Route path="/dashboard/questions" element={<UserQuestions />} />
          <Route path="/dashboard/questions/:id" element={<QuestionDetail />} />
          <Route path="/dashboard/experts" element={<UserExperts />} />
          <Route path="/dashboard/saved" element={<UserSaved />} />
          <Route path="/dashboard/billing" element={<UserBilling />} />
          <Route path="/dashboard/settings" element={<UserSettings />} />
        </Route>

        <Route element={<ProtectedRoute roles={[ROLES.EXPERT]} />}>
          <Route path="/expert" element={<ExpertLayout />}>
            <Route index element={<ExpertDashboard />} />
            <Route path="questions" element={<ExpertQuestions />} />
            <Route path="questions/:id" element={<ExpertQuestionDetail />} />
            <Route path="wallet" element={<ExpertWallet />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="answers" element={<AdminAnswers />} />
            <Route path="experts" element={<AdminExperts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="expert-types" element={<AdminExpertTypes />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
