import { useEffect, useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import RegisterExpertModal from '../components/admin/RegisterExpertModal'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'dark')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    localStorage.setItem('admin-theme', theme)
    document.documentElement.setAttribute('data-admin-theme', theme)
  }, [theme])

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setRegisterOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = () => {
      if (mq.matches) setCollapsed(true)
    }
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="admin-shell min-h-screen bg-[#090909] text-ink">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-40 w-[260px] lg:hidden"
            >
              <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        }`}
      >
        <AdminTopbar
          sidebarCollapsed={collapsed}
          onMenuOpen={() => setMobileOpen(true)}
          onSidebarToggle={() => setCollapsed((v) => !v)}
          theme={theme}
          onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'dim' : 'dark'))}
          onRegisterExpert={() => setRegisterOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <Outlet context={{ openRegisterExpert: () => setRegisterOpen(true) }} />
        </main>
      </div>

      <RegisterExpertModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  )
}
