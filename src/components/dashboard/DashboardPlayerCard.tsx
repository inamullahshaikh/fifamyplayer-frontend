import playerPhoto from '../../assets/images/Inam.png'
import spainLogo from '../../assets/images/Spain.png'
import manUnitedLogo from '../../assets/images/teams/Manchester United.png'
import { STATIC_PLAYER_PROFILE } from '../../config/dashboardStatic'

export default function DashboardPlayerCard() {
  const p = STATIC_PLAYER_PROFILE

  return (
    <div className="dash-player-card">
      <div className="dash-player-avatar">
        <img
          className="dash-player-avatar-img"
          src={playerPhoto}
          alt={p.name}
          width={96}
          height={96}
          decoding="async"
        />
      </div>
      <div className="dash-player-body">
        <div className="dash-player-top">
          <h2 className="dash-player-name">{p.name}</h2>
          <p className="dash-player-team">
            Current club: <strong>{p.currentTeam}</strong>
          </p>
        </div>

        <dl className="dash-player-metrics">
          <div className="dash-player-metric">
            <dt>Age</dt>
            <dd>{p.age}</dd>
          </div>
          <div className="dash-player-metric">
            <dt>Overall</dt>
            <dd>{p.rating}</dd>
          </div>
          <div className="dash-player-metric">
            <dt>Value</dt>
            <dd>{p.value}</dd>
          </div>
        </dl>

        <div className="dash-player-badges">
          <div className="dash-player-badge">
            <img
              src={spainLogo}
              alt=""
              className="dash-player-badge-img"
              width={40}
              height={40}
            />
            <span className="dash-player-badge-content">
              <span className="dash-player-badge-caption">Nationality</span>
              <span className="dash-player-badge-label">{p.nationality}</span>
            </span>
          </div>
          <div className="dash-player-badge">
            <img
              src={manUnitedLogo}
              alt=""
              className="dash-player-badge-img"
              width={40}
              height={40}
            />
            <span className="dash-player-badge-content">
              <span className="dash-player-badge-caption">Last team</span>
              <span className="dash-player-badge-label">{p.lastTeam}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
