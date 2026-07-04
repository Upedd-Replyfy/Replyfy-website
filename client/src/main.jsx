import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const app = (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm',
          style: { background: '#141414', color: '#fafafa', border: '1px solid #27272a', borderRadius: '12px' },
        }}
      />
    </AuthProvider>
  </QueryClientProvider>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </StrictMode>
)
