import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle'
import { IconLogout } from './SidebarNavIcons'
import { DASHBOARD_NAV_ITEMS, type SidebarNavItem } from './dashboardNav'

type DashboardNavbarProps = {
  items?: SidebarNavItem[]
  onLogout?: () => void
}

export default function DashboardNavbar({
  items = DASHBOARD_NAV_ITEMS,
  onLogout,
}: DashboardNavbarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    if (onLogout) onLogout()
    else navigate('/')
  }

  return (
    <header className="dash-navbar">
      <div className="dash-navbar-scroll" role="presentation">
        <nav className="dash-navbar-nav" aria-label="Section navigation">
          {items.map((it) => {
            const Icon = it.Icon
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  isActive ? 'dash-navbar-link dash-navbar-link--active' : 'dash-navbar-link'
                }
              >
                <span className="dash-navbar-link-icon" aria-hidden>
                  <Icon className="dash-navbar-svg" />
                </span>
                <span className="dash-navbar-link-label">{it.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
      <div className="dash-navbar-tools">
        <ThemeToggle buttonClassName="dash-navbar-theme" />
        <button type="button" className="dash-navbar-logout" onClick={handleLogout}>
          <span className="dash-navbar-link-icon" aria-hidden>
            <IconLogout className="dash-navbar-svg" />
          </span>
          <span className="dash-navbar-logout-label">Logout</span>
        </button>
      </div>
    </header>
  )
}
