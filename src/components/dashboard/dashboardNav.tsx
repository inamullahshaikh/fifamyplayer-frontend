import type { ComponentType, SVGProps } from 'react'
import {
  IconAccount,
  IconAwards,
  IconDashboard,
  IconSeason,
  IconStats,
  IconTrophy,
  IconYearly,
} from './SidebarNavIcons'

export type SidebarNavItem = {
  to: string
  label: string
  end?: boolean
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** Default app navigation — use with `SidebarLayout` / `DashboardSidebar`. */
export const DASHBOARD_NAV_ITEMS: SidebarNavItem[] = [
  { to: '/dashboard', label: 'Dashboard', end: true, Icon: IconDashboard },
  { to: '/season-data', label: 'Season Data', end: true, Icon: IconSeason },
  { to: '/yearly-data', label: 'Yearly Data', end: true, Icon: IconYearly },
  { to: '/stats', label: 'Stats', end: true, Icon: IconStats },
  { to: '/trophy-cabinet', label: 'Trophy Cabinet', end: true, Icon: IconTrophy },
  { to: '/awards', label: 'Awards', end: true, Icon: IconAwards },
  { to: '/account', label: 'Account', end: true, Icon: IconAccount },
]
