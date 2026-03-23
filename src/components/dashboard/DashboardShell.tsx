import { Outlet } from 'react-router-dom'
import SidebarLayout from './SidebarLayout'

/** Layout route: sidebar + sliding panel + nested page content. */
export default function DashboardShell() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  )
}
