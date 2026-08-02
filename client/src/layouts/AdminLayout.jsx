import { useEffect, useState } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import RegisterExpertModal from '../components/admin/RegisterExpertModal'
import AdminPageTransition from '../components/admin/ui/AdminPageTransition'
import { ShellThemeProvider, useShellTheme } from '../context/ShellThemeContext'

function AdminLayoutInner() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const { theme } = useShellTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

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

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const contentPad = collapsed
    ? 'lg:pl-[calc(84px+24px)]'
    : 'lg:pl-[calc(268px+24px)]'

  return (
    <div className="admin-shell min-h-screen bg-canvas text-ink" data-theme={theme}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08),_transparent_55%)]" />

      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} floating />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300, opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-3 left-3 z-50 w-[268px] lg:hidden"
            >
              <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} floating />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`flex min-h-screen flex-col transition-all duration-300 ${contentPad}`}>
        <AdminTopbar
          sidebarCollapsed={collapsed}
          onMenuOpen={() => setMobileOpen(true)}
          onSidebarToggle={() => setCollapsed((v) => !v)}
          onRegisterExpert={() => setRegisterOpen(true)}
        />

        <main className="flex-1 px-3 pb-6 pt-3 sm:px-5 sm:pb-8 sm:pt-4 lg:px-6 xl:px-8">
          <AnimatePresence mode="wait">
            <AdminPageTransition key={location.pathname}>
              <Outlet context={{ openRegisterExpert: () => setRegisterOpen(true) }} />
            </AdminPageTransition>
          </AnimatePresence>
        </main>
      </div>

      <RegisterExpertModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  )
}

export default function AdminLayout() {
  return (
    <ShellThemeProvider storageKey="admin-theme" defaultTheme="light">
      <AdminLayoutInner />
    </ShellThemeProvider>
  )
}
