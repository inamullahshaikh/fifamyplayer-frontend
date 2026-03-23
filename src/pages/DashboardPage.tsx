import DashboardAchievements from '../components/dashboard/DashboardAchievements'
import DashboardCharts from '../components/dashboard/DashboardCharts'
import DashboardPlayerCard from '../components/dashboard/DashboardPlayerCard'
import DashboardTransferHistory from '../components/dashboard/DashboardTransferHistory'
import { useDashboardApi } from '../hooks/useDashboardApi'

export default function DashboardPage() {
  const api = useDashboardApi()

  return (
    <section className="dash-view dash-dashboard">
      <div className="dash-view-title">Dashboard</div>
      <p className="dash-view-subtitle">Your profile, performance, and career honours.</p>

      {api.error && (
        <div className="dash-api-error" role="alert">
          Couldn&apos;t load stats. Charts and trophy totals may be empty until the connection is
          available.
        </div>
      )}

      <DashboardPlayerCard />

      <h2 className="dash-section-title">Performance</h2>
      <p className="dash-section-sub muted-text">Goals and assists over time.</p>

      <DashboardCharts
        seasonData={api.seasonSeries}
        yearlyData={api.yearlySeries}
        loading={api.loading}
      />

      <DashboardAchievements
        clubTrophies={api.clubTrophies}
        intTrophies={api.intTrophies}
        awardsTotal={api.awardsTotal}
        loading={api.loading}
      />

      <DashboardTransferHistory />
    </section>
  )
}
