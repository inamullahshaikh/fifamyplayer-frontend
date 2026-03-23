import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardSidebar from './DashboardSidebar'
import { IconMenu } from './SidebarNavIcons'
import type { SidebarNavItem } from './dashboardNav'

const STORAGE_KEY = 'vx-sidebar-collapsed'

type SidebarLayoutProps = {
  children: ReactNode
  navItems?: SidebarNavItem[]
}

export default function SidebarLayout({ children, navItems }: SidebarLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleMobile = () => setMobileOpen((o) => !o)
  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="dash-root">
      {/* Mobile overlay */}
      <button
        type="button"
        className={'dash-backdrop' + (mobileOpen ? ' dash-backdrop--visible' : '')}
        aria-label="Close menu"
        onClick={closeMobile}
        tabIndex={mobileOpen ? 0 : -1}
      />

      <header className="dash-menubar">
        <button
          type="button"
          className="dash-menubar-trigger"
          onClick={toggleMobile}
          aria-expanded={mobileOpen}
          aria-controls="dash-sidebar-panel"
        >
          <IconMenu className="dash-menubar-icon" />
          <span className="dash-menubar-label">Menu</span>
        </button>
        <div className="dash-menubar-brand">VirtualXI</div>
      </header>

      <div className={'dash-shell' + (collapsed ? ' dash-shell--sidebar-collapsed' : '')}>
        <div
          id="dash-sidebar-panel"
          className={'dash-sidebar-wrap' + (mobileOpen ? ' dash-sidebar-wrap--open' : '')}
        >
          <DashboardSidebar
            items={navItems}
            onLogout={() => navigate('/')}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onNavigate={closeMobile}
          />
        </div>

        <div className="dash-content">
          <DashboardNavbar items={navItems} onLogout={() => navigate('/')} />
          <main className="dash-main">{children}</main>
        </div>
      </div>
    </div>
  )
}
