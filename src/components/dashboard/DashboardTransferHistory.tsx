import athleticBilbaoLogo from '../../assets/images/teams/Athletic Bilbao.png'
import fcBarcelonaLogo from '../../assets/images/FC Barcelona.png'
import manCityLogo from '../../assets/images/teams/Manchester City.png'
import manUnitedLogo from '../../assets/images/teams/Manchester United.png'
import { STATIC_TRANSFER_HISTORY } from '../../config/transferHistoryStatic'

const TEAM_LOGOS: Record<string, string> = {
  'Athletic Bilbao': athleticBilbaoLogo,
  'FC Barcelona': fcBarcelonaLogo,
  'Manchester City': manCityLogo,
  'Manchester United': manUnitedLogo,
}

function TeamInline({ team }: { team: string }) {
  const logo = TEAM_LOGOS[team]
  return (
    <span className="dash-transfer-team">
      {logo && <img src={logo} alt="" className="dash-transfer-logo" width={28} height={28} />}
      <span>{team}</span>
    </span>
  )
}

export default function DashboardTransferHistory() {
  return (
    <section className="dash-transfer-history" aria-label="Transfer history">
      <h2 className="dash-section-title">Transfer History</h2>
      <p className="dash-section-sub muted-text">Career moves.</p>

      <ol className="dash-transfer-timeline">
        {STATIC_TRANSFER_HISTORY.map((transfer, i) => (
          <li key={i} className="dash-transfer-item">
            <span className="dash-transfer-dot" aria-hidden />
            <div className="dash-transfer-content">
              <span className="dash-transfer-date">{transfer.date}</span>
              <span className="dash-transfer-flow">
                <TeamInline team={transfer.from} />
                <span className="dash-transfer-arrow" aria-hidden />
                <TeamInline team={transfer.to} />
              </span>
              <span className="dash-transfer-amount">{transfer.amount}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
