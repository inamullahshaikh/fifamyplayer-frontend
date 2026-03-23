import type { ReactNode } from 'react'
import { IconAwardMedal, IconTrophyClub, IconTrophyIntl } from './AchievementIcons'

type Props = {
  clubTrophies: number
  intTrophies: number
  awardsTotal: number
  loading: boolean
}

function Tile({
  label,
  value,
  hint,
  loading,
  icon,
}: {
  label: string
  value: number
  hint: string
  loading: boolean
  icon: ReactNode
}) {
  return (
    <div className="dash-achievement-tile">
      <div className="dash-achievement-icon">{icon}</div>
      <div className="dash-achievement-label">{label}</div>
      <div className="dash-achievement-value" aria-live="polite">
        {loading ? '…' : value}
      </div>
      <div className="dash-achievement-hint muted-text">{hint}</div>
    </div>
  )
}

export default function DashboardAchievements({ clubTrophies, intTrophies, awardsTotal, loading }: Props) {
  return (
    <section className="dash-achievements" aria-label="Career totals">
      <h2 className="dash-section-title">Trophies & awards</h2>
      <p className="dash-section-sub muted-text">Career totals.</p>
      <div className="dash-achievements-grid">
        <Tile
          label="Club trophies"
          value={clubTrophies}
          hint="Domestic & European silverware"
          loading={loading}
          icon={<IconTrophyClub className="dash-achievement-icon-svg" />}
        />
        <Tile
          label="International trophies"
          value={intTrophies}
          hint="National team honours"
          loading={loading}
          icon={<IconTrophyIntl className="dash-achievement-icon-svg" />}
        />
        <Tile
          label="Awards won"
          value={awardsTotal}
          hint="Ballon d'Or, Golden Boot, FIFA Best"
          loading={loading}
          icon={<IconAwardMedal className="dash-achievement-icon-svg" />}
        />
      </div>
    </section>
  )
}
