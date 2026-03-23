import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardShell from './components/dashboard/DashboardShell'
import LandingPage from './pages/LandingPage'
import AwardsPage from './pages/AwardsPage'
import DashboardPage from './pages/DashboardPage'
import SeasonDataPage from './pages/SeasonDataPage'
import StatsPage from './pages/StatsPage'
import TrophyCabinetPage from './pages/TrophyCabinetPage'
import YearlyDataPage from './pages/YearlyDataPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<DashboardShell />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="season-data" element={<SeasonDataPage />} />
        <Route path="yearly-data" element={<YearlyDataPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="trophy-cabinet" element={<TrophyCabinetPage />} />
        <Route path="awards" element={<AwardsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
