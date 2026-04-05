import { NavLink, useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconLogout } from './SidebarNavIcons'
import { DASHBOARD_NAV_ITEMS, type SidebarNavItem } from './dashboardNav'

type DashboardSidebarProps = {
  items?: SidebarNavItem[]
  onLogout?: () => void
  /** Desktop: narrow icon-only rail */
  collapsed: boolean
  onToggleCollapse: () => void
  /** After navigating (e.g. mobile drawer should close) */
  onNavigate?: () => void
}

export default function DashboardSidebar({
  items = DASHBOARD_NAV_ITEMS,
  onLogout,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: DashboardSidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onNavigate?.()
    if (onLogout) onLogout()
    else navigate('/')
  }

  const asideClass =
    'dash-sidebar' +
    (collapsed ? ' dash-sidebar--collapsed' : '')

  return (
    <aside className={asideClass} aria-label="App sidebar">
      <div className="dash-sidebar-brand">
        <div className="dash-sidebar-logo" aria-hidden>
          <span className="dash-sidebar-logo-mark">XI</span>
        </div>
        <div className="dash-sidebar-brand-text">
          <div className="dash-sidebar-title">VirtualXI</div>
          <div className="dash-sidebar-sub">Career hub</div>
        </div>
        <button
          type="button"
          className="dash-sidebar-pin"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <IconChevronLeft
            className={'dash-sidebar-pin-icon' + (collapsed ? ' dash-sidebar-pin-icon--flipped' : '')}
          />
        </button>
      </div>

      <nav className="dash-sidebar-nav" aria-label="Main">
        {items.map((it) => {
          const Icon = it.Icon
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive
                  ? 'dash-sidebar-link dash-sidebar-link--active'
                  : 'dash-sidebar-link'
              }
            >
              <span className="dash-sidebar-link-icon" aria-hidden>
                <Icon className="dash-sidebar-svg" />
              </span>
              <span className="dash-sidebar-link-label">{it.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="dash-sidebar-footer">
        <button type="button" className="dash-sidebar-link dash-sidebar-link--logout" onClick={handleLogout}>
          <span className="dash-sidebar-link-icon" aria-hidden>
            <IconLogout className="dash-sidebar-svg" />
          </span>
          <span className="dash-sidebar-link-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}
