import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '../../hooks/useChartTheme'
import type { SeasonChartPoint, YearlyChartPoint } from '../../types/dashboard'

const GOALS_COLOR = '#2563eb'
const ASSISTS_COLOR = '#94a3b8'

type Props = {
  seasonData: SeasonChartPoint[]
  yearlyData: YearlyChartPoint[]
  loading: boolean
}

function ChartShell({
  title,
  subtitle,
  loading,
  empty,
  children,
}: {
  title: string
  subtitle: string
  loading: boolean
  empty: boolean
  children: ReactNode
}) {
  return (
    <div className="dash-chart-card">
      <div className="dash-chart-card-head">
        <h2 className="dash-chart-card-title">{title}</h2>
        <p className="dash-chart-card-sub">{subtitle}</p>
      </div>
      {loading && <p className="muted-text dash-chart-loading">Loading…</p>}
      {!loading && empty && (
        <p className="muted-text dash-chart-empty">No data to show yet.</p>
      )}
      {!loading && !empty && <div className="dash-chart-canvas">{children}</div>}
    </div>
  )
}

export default function DashboardCharts({ seasonData, yearlyData, loading }: Props) {
  const t = useChartTheme()
  const seasonEmpty = seasonData.length === 0
  const yearlyEmpty = yearlyData.length === 0

  const tooltipStyle = {
    backgroundColor: t.tooltipBg,
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: 10,
    fontSize: 12,
  }

  return (
    <div className="dash-charts-grid">
      <ChartShell
        title="Season — goals & assists"
        subtitle="Club competitions — goals and assists per season"
        loading={loading}
        empty={seasonEmpty}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={seasonData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="season" tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: t.grid }} />
            <YAxis tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: t.grid }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: t.axis }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="goals" name="Goals" fill={GOALS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="assists" name="Assists" fill={ASSISTS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Yearly — goals & assists"
        subtitle="Goals and assists per calendar year"
        loading={loading}
        empty={yearlyEmpty}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={yearlyData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="year" tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: t.grid }} />
            <YAxis tick={{ fill: t.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: t.grid }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: t.axis }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="goals" name="Goals" fill={GOALS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="assists" name="Assists" fill={ASSISTS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  )
}
