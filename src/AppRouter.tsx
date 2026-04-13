import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardShell from './components/dashboard/DashboardShell'
import RequireAuth from './auth/RequireAuth'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const SelectCareerPage = lazy(() => import('./pages/SelectCareerPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SeasonDataPage = lazy(() => import('./pages/SeasonDataPage'))
const YearlyDataPage = lazy(() => import('./pages/YearlyDataPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const TrophyCabinetPage = lazy(() => import('./pages/TrophyCabinetPage'))
const AwardsPage = lazy(() => import('./pages/AwardsPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--text-3, #64748b)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
      }}
    >
      Loading…
    </div>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  )
}
