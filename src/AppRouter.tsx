import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardShell from './components/dashboard/DashboardShell'
import RequireAuth from './auth/RequireAuth'
import LandingPage from './pages/LandingPage'
import AwardsPage from './pages/AwardsPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SeasonDataPage from './pages/SeasonDataPage'
import StatsPage from './pages/StatsPage'
import TrophyCabinetPage from './pages/TrophyCabinetPage'
import YearlyDataPage from './pages/YearlyDataPage'
import SelectCareerPage from './pages/SelectCareerPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AccountPage from './pages/AccountPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/select-career"
        element={
          <RequireAuth>
            <SelectCareerPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <DashboardShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/season-data" element={<SeasonDataPage />} />
        <Route path="/yearly-data" element={<YearlyDataPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/trophy-cabinet" element={<TrophyCabinetPage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
