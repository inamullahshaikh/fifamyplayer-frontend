import { useMemo, type CSSProperties } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AWARD_LOGO_KINDS } from "../../config/seasonAssets";
import { useChartTheme } from "../../hooks/useChartTheme";
import {
  awardsAggregated,
  awardsPerSeasonTotals,
} from "../../lib/statsChartHelpers";
import type { AwardRow } from "../../types/dashboard";

const ACCENT = "#b45309";
const PIE_PALETTE = [
  "#ea580c",
  "#2563eb",
  "#7c3aed",
  "#0ea5e9",
  "#14b8a6",
  "#f59e0b",
  "#64748b",
];

function rowQty(r: AwardRow): number {
  const q = Number(r.quantity);
  return q > 0 ? q : 1;
}

function ChartPanel({
  title,
  insight,
  children,
  tall,
}: {
  title: string;
  insight?: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div
      className={`stats-analytics-panel awards-chart-panel ${tall ? "stats-analytics-panel--tall" : ""}`}
    >
      <div className="stats-analytics-panel-head">
        <h3 className="stats-analytics-panel-title">{title}</h3>
        {insight ? (
          <p className="stats-analytics-panel-insight muted-text">{insight}</p>
        ) : null}
      </div>
      <div className="stats-analytics-panel-chart">{children}</div>
    </div>
  );
}

export function AwardsTripleSpotlight({ rows }: { rows: AwardRow[] }) {
  const items = useMemo(() => {
    return AWARD_LOGO_KINDS.map((k) => {
      let count = 0;
      for (const r of rows) {
        const name = String(r.award ?? "").trim();
        if (!name || name !== k.label) continue;
        count += rowQty(r);
      }
      return { id: k.id, name: k.name, label: k.label, image: k.image, count };
    });
  }, [rows]);

  return (
    <div className="awards-spotlight" aria-label="Major individual awards">
      {items.map((it, i) => (
        <div
          key={it.id}
          className="awards-spot-card"
          style={{ "--spot-i": i } as CSSProperties}
        >
          <div className="awards-spot-glow" aria-hidden />
          <div className="awards-spot-logo-wrap">
            <img
              src={it.image}
              alt=""
              className="awards-spot-logo"
              width={80}
              height={80}
            />
          </div>
          <div className="awards-spot-divider" />
          <div className="awards-spot-copy">
            <p className="awards-spot-val">{it.count > 0 ? it.count : "—"}</p>
            <p className="awards-spot-label">{it.name}</p>
            {it.count > 0 && (
              <p className="awards-spot-hint muted-text">
                {it.count === 1 ? "time" : "times"} in career
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AwardsAnalyticsCharts({ rows }: { rows: AwardRow[] }) {
  const theme = useChartTheme();

  const tooltipStyle = useMemo(
    () =>
      ({
        background: theme.tooltipBg,
        border: `1px solid ${theme.tooltipBorder}`,
        borderRadius: 10,
        fontSize: 12,
      }) as CSSProperties,
    [theme],
  );

  const topAwards = useMemo(() => awardsAggregated(rows, 12), [rows]);
  const bySeason = useMemo(() => awardsPerSeasonTotals(rows), [rows]);

  const pieSlices = useMemo(() => {
    const top = topAwards.slice(0, 6);
    const rest = topAwards.slice(6).reduce((s, x) => s + x.count, 0);
    const out = top.map((x) => ({ name: x.name, value: x.count }));
    if (rest > 0) out.push({ name: "Other", value: rest });
    return out.filter((x) => x.value > 0);
  }, [topAwards]);

  const barHeight = Math.min(480, 48 + topAwards.length * 36);

  if (rows.length === 0) return null;

  return (
    <section className="awards-visuals" aria-labelledby="awards-visuals-title">
      <div className="awards-section-head">
        <h2 id="awards-visuals-title" className="awards-section-title">
          Analytics
        </h2>
        <p className="awards-section-desc muted-text">
          Where your honours concentrate — by award and by season. Man of the Match
          is left out of these charts so higher-volume MOTM entries don’t hide rarer
          awards.
        </p>
      </div>
      <div className="stats-analytics-grid awards-analytics-grid">
        <ChartPanel
          title="Top honours"
          insight="Total quantity per award name, sorted by most logged."
          tall
        >
          {topAwards.length === 0 ? (
            <p className="awards-chart-empty muted-text">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart
                layout="vertical"
                data={topAwards}
                margin={{ top: 8, right: 20, left: 4, bottom: 8 }}
              >
                <CartesianGrid
                  stroke={theme.grid}
                  horizontal
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  stroke={theme.axis}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={154}
                  stroke={theme.axis}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) =>
                    v.length > 24 ? `${v.slice(0, 22)}…` : v
                  }
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    value == null ? 0 : Number(value),
                    "entries",
                  ]}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive
                  animationDuration={900}
                >
                  {topAwards.map((_, i) => (
                    <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel
          title="Honours by season"
          insight="Total award entries per season (chronological), excluding Man of the Match."
        >
          {bySeason.length === 0 ? (
            <p className="awards-chart-empty muted-text">
              No season-tagged rows.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={bySeason}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="awardsAreaGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.38} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                <XAxis
                  dataKey="season"
                  stroke={theme.axis}
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  stroke={theme.axis}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    value == null ? 0 : Number(value),
                    "entries",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  fill="url(#awardsAreaGrad)"
                  dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: ACCENT }}
                  isAnimationActive
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel
          title="Mix of honours"
          insight="Proportional share of your top award types by total quantity (MOTM excluded)."
        >
          {pieSlices.length === 0 ? (
            <p className="awards-chart-empty muted-text">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieSlices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={92}
                  paddingAngle={3}
                  isAnimationActive
                  animationDuration={900}
                >
                  {pieSlices.map((_, i) => (
                    <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    value == null ? 0 : Number(value),
                    "entries",
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                  formatter={(value: string) =>
                    value.length > 28 ? `${value.slice(0, 26)}…` : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>
    </section>
  );
}
