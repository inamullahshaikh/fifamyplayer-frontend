import DashboardAchievements from '../components/dashboard/DashboardAchievements'
import DashboardCharts from '../components/dashboard/DashboardCharts'
import DashboardPlayerCard from '../components/dashboard/DashboardPlayerCard'
import DashboardTransferHistory from '../components/dashboard/DashboardTransferHistory'
import DataCapNotice, { DataCapNoticeGroup } from '../components/DataCapNotice'
import { useDashboardApi } from '../hooks/useDashboardApi'
import { useDataEntryStatus } from '../hooks/useDataEntryStatus'

export default function DashboardPage() {
  const api = useDashboardApi()
  const dataEntry = useDataEntryStatus()
  const refreshAll = () => {
    api.refresh()
    dataEntry.refresh()
  }
  const totalTrophies = api.clubTrophies + api.intTrophies

  return (
    <section className="dash-view dash-dashboard">

      {/* ── Premium page hero ── */}
      <header className="ph ph--dashboard">
        <div className="ph-glow" aria-hidden />
        <div className="ph-inner">
          <div className="ph-text">
            <p className="ph-kicker">
              <span className="ph-kicker-dot" aria-hidden />
              Overview
            </p>
            <h1 className="ph-title">Dashboard</h1>
            <p className="ph-desc">
              Career profile, form trends, trophy count, and transfer history — live in one hub.
            </p>
          </div>
          <svg className="ph-deco" aria-hidden viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="158" cy="70" r="68" fill="currentColor" fillOpacity="0.07" />
            <circle cx="188" cy="26" r="26" fill="currentColor" fillOpacity="0.09" />
            <circle cx="180" cy="118" r="16" fill="currentColor" fillOpacity="0.07" />
            <path d="M10 110 Q80 30 190 68" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="5 5" />
            <circle cx="10"  cy="110" r="4" fill="currentColor" fillOpacity="0.25" />
            <circle cx="100" cy="60"  r="4" fill="currentColor" fillOpacity="0.25" />
            <circle cx="190" cy="68"  r="4" fill="currentColor" fillOpacity="0.25" />
            <line x1="20" y1="20" x2="100" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            <line x1="20" y1="34" x2="80"  y2="34" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            <line x1="20" y1="48" x2="60"  y2="48" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
          </svg>
        </div>

        {!api.loading && (
          <div className="ph-bottom">
            <div className="ph-stat">
              <span className="ph-stat-n">{totalTrophies}</span>
              <span className="ph-stat-l">Trophies</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{api.awardsTotal ?? 0}</span>
              <span className="ph-stat-l">Award entries</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{api.transfers.length}</span>
              <span className="ph-stat-l">Transfers</span>
            </div>
          </div>
        )}
      </header>

      {api.error && (
        <div className="dash-api-error" role="alert">
          Couldn&apos;t load stats. Charts and trophy totals may be empty until the connection is available.
        </div>
      )}

      {(dataEntry.seasonCapReached || dataEntry.yearCapReached) && (
        <DataCapNoticeGroup>
          {dataEntry.seasonCapReached && (
            <DataCapNotice
              variant="season"
              title={`Seasons: ${dataEntry.seasonCount}/${dataEntry.maxSeasons}`}
            >
              No new season labels; you can still add rows for existing seasons.
            </DataCapNotice>
          )}
          {dataEntry.yearCapReached && (
            <DataCapNotice variant="year" title={`Years: ${dataEntry.yearCount}/${dataEntry.maxYears}`}>
              No new calendar years; edit or delete yearly rows to change totals.
            </DataCapNotice>
          )}
        </DataCapNoticeGroup>
      )}

      <DashboardPlayerCard
        player={api.player}
        currentTeamSlug={api.currentTeamSlug}
        prevTeamSlug={api.prevTeamSlug}
        transfers={api.transfers}
        loading={api.loading}
        onRefresh={refreshAll}
      />

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

      <DashboardTransferHistory
        transfers={api.transfers}
        loading={api.loading}
        onRefresh={refreshAll}
        seasonCapReached={dataEntry.seasonCapReached}
        existingSeasons={dataEntry.existingSeasons}
      />
    </section>
  )
}
