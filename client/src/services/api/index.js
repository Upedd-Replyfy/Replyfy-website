import api from './client'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const catalogApi = {
  getCategories: () => api.get('/categories'),
  getExpertTypes: (categoryId) => api.get('/expert-types', { params: { category: categoryId } }),
  getExperts: (params) => api.get('/experts', { params }),
  getExpert: (id) => api.get(`/public/experts/${id}`),
  getStats: () => api.get('/stats'),
}

export const userApi = {
  createQuestion: (formData) =>
    api.post('/users/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createPaymentOrder: (questionId) => api.post('/users/payments/create-order', { questionId }),
  verifyPayment: (data) => api.post('/users/payments/verify', data),
  getQuestions: (params) => api.get('/users/questions', { params }),
  getQuestion: (id) => api.get(`/users/questions/${id}`),
  getPayments: () => api.get('/users/payments'),
  submitRating: (data) => api.post('/users/ratings', data),
}

export const expertApi = {
  getDashboard: () => api.get('/expert/dashboard'),
  getQuestions: (params) => api.get('/expert/questions', { params }),
  getQuestion: (id) => api.get(`/expert/questions/${id}`),
  startQuestion: (id) => api.patch(`/expert/questions/${id}/start`),
  submitAnswer: (id, formData) =>
    api.post(`/expert/questions/${id}/answer`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getWallet: () => api.get('/expert/wallet'),
  withdraw: (data) => api.post('/expert/wallet/withdraw', data),
  getRatings: () => api.get('/expert/ratings'),
  updateProfile: (data) => api.put('/expert/profile', data),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  createExpert: (formData) =>
    api.post('/admin/experts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getExperts: () => api.get('/admin/experts'),
  updateExpert: (id, formData) =>
    api.put(`/admin/experts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteExpert: (id) => api.delete(`/admin/experts/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getExpertTypes: (params) => api.get('/admin/expert-types', { params }),
  createExpertType: (data) => api.post('/admin/expert-types', data),
  updateExpertType: (id, data) => api.put(`/admin/expert-types/${id}`, data),
  deleteExpertType: (id) => api.delete(`/admin/expert-types/${id}`),
  getPendingQuestions: () => api.get('/admin/questions/pending'),
  getQuestions: (params) => api.get('/admin/questions', { params }),
  approveQuestion: (id) => api.post(`/admin/questions/${id}/approve`),
  rejectQuestion: (id, reason) => api.post(`/admin/questions/${id}/reject`, { reason }),
  assignExpert: (id, expertId) => api.post(`/admin/questions/${id}/assign`, { expertId }),
  getPendingAnswers: () => api.get('/admin/answers/pending'),
  approveAnswer: (id) => api.post(`/admin/answers/${id}/approve`),
  rejectAnswer: (id, reason) => api.post(`/admin/answers/${id}/reject`, { reason }),
  getPayments: () => api.get('/admin/payments'),
  getWithdrawals: () => api.get('/admin/withdrawals'),
  approveWithdrawal: (id) => api.post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id, reason) => api.post(`/admin/withdrawals/${id}/reject`, { reason }),
}

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}
