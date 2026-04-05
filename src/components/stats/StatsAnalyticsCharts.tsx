import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TEAM_LABELS, labelForCompetitionOrTrophyId } from "../../config/seasonDataConfig";
import type { StatsApiState } from "../../hooks/useStatsApi";
import {
  buildSeasonClubIntSplit,
  clubCompetitionAgg,
  clubOnlySeasonSeries,
  competitionGaPieSlices,
  intCompetitionAgg,
  intOnlySeasonSeries,
} from "../../lib/statsChartHelpers";

const GOALS = "#2563eb";
const ASSISTS = "#0ea5e9";
const CLUB = "#6366f1";
const INT = "#14b8a6";
const GA = "#7c3aed";
const RATING = "#d97706";

const PIE_PALETTE = [
  "#2563eb",
  "#0ea5e9",
  "#6366f1",
  "#14b8a6",
  "#7c3aed",
  "#d97706",
  "#64748b",
];

/** Consistent motion across Stats charts (Recharts). */
const CHART_ANIM = { isAnimationActive: true as const, animationDuration: 720 };

const TOOLTIP_CURSOR_BAR = { fill: "rgba(99, 102, 241, 0.07)" };
const TOOLTIP_CURSOR_AREA = { stroke: "rgba(99, 102, 241, 0.35)", strokeWidth: 1, strokeDasharray: "4 4" };

function fmtTooltipNumber(n: unknown): string {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString() : String(n ?? "—");
}

type Theme = ReturnType<typeof import("../../hooks/useChartTheme").useChartTheme>;

function compLabel(id: string) {
  if (id === "__other__") return "Other";
  return labelForCompetitionOrTrophyId(id);
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
    <div className={`stats-analytics-panel ${tall ? "stats-analytics-panel--tall" : ""}`}>
      <div className="stats-analytics-panel-head">
        <h3 className="stats-analytics-panel-title">{title}</h3>
        {insight ? <p className="stats-analytics-panel-insight muted-text">{insight}</p> : null}
      </div>
      <div className="stats-analytics-panel-chart">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="stats-analytics-grid">{children}</div>;
}

// ─── Overview ───────────────────────────────────────────────────────────────

export function StatsOverviewCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const gradId = useId().replace(/:/g, "");
  const splitSeason = useMemo(() => buildSeasonClubIntSplit(api.clubData, api.intData), [api.clubData, api.intData]);
  const bySeasonDerived = useMemo(
    () =>
      api.bySeason.map((s) => ({
        ...s,
        ga: s.goals + s.assists,
        gPerApp: s.apps > 0 ? s.goals / s.apps : 0,
        aPerApp: s.apps > 0 ? s.assists / s.apps : 0,
        gaPerApp: s.apps > 0 ? (s.goals + s.assists) / s.apps : 0,
      })),
    [api.bySeason],
  );

  const pieGoals = useMemo(() => {
    const c = api.club.goals;
    const i = api.international.goals;
    if (c + i <= 0) return [];
    return [
      { name: "Club", value: c },
      { name: "International", value: i },
    ];
  }, [api.club.goals, api.international.goals]);

  const pieGa = useMemo(() => {
    const c = api.club.goals + api.club.assists;
    const int = api.international.goals + api.international.assists;
    if (c + int <= 0) return [];
    return [
      { name: "Club G+A", value: c },
      { name: "International G+A", value: int },
    ];
  }, [api.club, api.international]);

  const pieApps = useMemo(() => {
    const c = api.club.apps;
    const i = api.international.apps;
    if (c + i <= 0) return [];
    return [
      { name: "Club apps", value: c },
      { name: "International apps", value: i },
    ];
  }, [api.club.apps, api.international.apps]);

  const overviewYearData = useMemo(
    () => api.byYear.map((y) => ({ ...y, ga: y.goals + y.assists })),
    [api.byYear],
  );

  return (
    <>
      <h2 className="stats-analytics-section-title">Analytics &amp; insights</h2>
      <p className="stats-analytics-section-desc muted-text">
        Visual breakdown of where production comes from and how it trends over time.
      </p>

      <Grid>
        {pieGoals.length > 0 && (
          <ChartPanel
            title="Goal share: club vs international"
            insight="Percentage of career goals from club football vs national team."
            tall
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ bottom: 4 }}>
                <Pie
                  data={pieGoals}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={2.5}
                  {...CHART_ANIM}
                  label={({ name, percent }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieGoals.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.name === "Club" ? CLUB : INT}
                      stroke="var(--card-bg, #fff)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [fmtTooltipNumber(value), "Goals"]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="bottom" height={28} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {pieGa.length > 0 && (
          <ChartPanel
            title="Involvements (G+A) split"
            insight="Total goal involvements — highlights playmaking load at club vs country."
            tall
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ bottom: 4 }}>
                <Pie
                  data={pieGa}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={2.5}
                  {...CHART_ANIM}
                  label={({ name, percent }) =>
                    `${String(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieGa.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.name.startsWith("Club") ? GOALS : ASSISTS}
                      stroke="var(--card-bg, #fff)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [fmtTooltipNumber(value), "G+A"]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="bottom" height={28} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {pieApps.length > 0 && (
          <ChartPanel
            title="Appearances split"
            insight="Volume of minutes tracked — club workload vs international windows."
            tall
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ bottom: 4 }}>
                <Pie
                  data={pieApps}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={2.5}
                  {...CHART_ANIM}
                  label={({ name, percent }) =>
                    `${String(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieApps.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.name.startsWith("Club") ? "#8b5cf6" : "#06b6d4"}
                      stroke="var(--card-bg, #fff)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [fmtTooltipNumber(value), "Apps"]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="bottom" height={28} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}
      </Grid>

      {splitSeason.length > 0 && (
        <ChartPanel
          title="Club vs international G+A by season"
          insight="Stacked view shows which seasons were driven by club form vs national-team tournaments."
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={splitSeason} margin={{ top: 12, right: 16, left: 4, bottom: 6 }}>
              <defs>
                <linearGradient id={`${gradId}-split-club`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CLUB} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={CLUB} stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id={`${gradId}-split-int`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INT} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={INT} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: theme.axis }}
                cursor={TOOLTIP_CURSOR_AREA}
                formatter={(value) => fmtTooltipNumber(value)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="clubGa"
                name="Club G+A"
                stackId="1"
                stroke={CLUB}
                strokeWidth={2}
                fill={`url(#${gradId}-split-club)`}
                {...CHART_ANIM}
              />
              <Area
                type="monotone"
                dataKey="intGa"
                name="International G+A"
                stackId="1"
                stroke={INT}
                strokeWidth={2}
                fill={`url(#${gradId}-split-int)`}
                {...CHART_ANIM}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}

      {bySeasonDerived.length > 0 && (
        <Grid>
          <ChartPanel
            title="Efficiency: G+A per appearance by season"
            insight="Higher bars = more involvements per game that season (sample-size aware)."
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bySeasonDerived} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
                <YAxis tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={TOOLTIP_CURSOR_BAR}
                  formatter={(value) => [fmtTooltipNumber(value), "G+A / app"]}
                />
                <Bar
                  dataKey="gaPerApp"
                  name="G+A per app"
                  fill={GA}
                  radius={[8, 8, 2, 2]}
                  maxBarSize={36}
                  {...CHART_ANIM}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="Season output: goals vs assists"
            insight="Side-by-side bars show scoring vs creation balance each year."
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bySeasonDerived} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
                <YAxis tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={TOOLTIP_CURSOR_BAR}
                  formatter={(value) => fmtTooltipNumber(value)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="goals" name="Goals" fill={GOALS} radius={[6, 6, 0, 0]} maxBarSize={28} {...CHART_ANIM} />
                <Bar dataKey="assists" name="Assists" fill={ASSISTS} radius={[6, 6, 0, 0]} maxBarSize={28} {...CHART_ANIM} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
      )}

      {overviewYearData.length > 0 && (
        <ChartPanel
          title="Calendar-year trajectory (overview)"
          insight="Same yearly series as the By year tab — quick view of long-term trend."
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={overviewYearData} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
              <defs>
                <linearGradient id={`${gradId}-oy-goals`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOALS} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={GOALS} stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id={`${gradId}-oy-assists`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ASSISTS} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={ASSISTS} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={TOOLTIP_CURSOR_AREA}
                formatter={(value) => fmtTooltipNumber(value)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="goals"
                name="Goals"
                stroke={GOALS}
                strokeWidth={2}
                fill={`url(#${gradId}-oy-goals)`}
                {...CHART_ANIM}
              />
              <Area
                type="monotone"
                dataKey="assists"
                name="Assists"
                stroke={ASSISTS}
                strokeWidth={2}
                fill={`url(#${gradId}-oy-assists)`}
                {...CHART_ANIM}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </>
  );
}

// ─── Club ─────────────────────────────────────────────────────────────────────

export function StatsClubCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const compBars = useMemo(() => clubCompetitionAgg(api.clubData), [api.clubData]);
  const seasonClub = useMemo(() => clubOnlySeasonSeries(api.clubData), [api.clubData]);
  const trophyBars = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of api.clubTrophies) {
      const id = String(t.competition ?? "").trim();
      if (!id) continue;
      m.set(id, (m.get(id) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([id, count]) => ({ id, name: compLabel(id), count }))
      .sort((a, b) => b.count - a.count);
  }, [api.clubTrophies]);

  const compBarsSlice = useMemo(() => compBars.slice(0, 14), [compBars]);

  if (compBars.length === 0 && seasonClub.length === 0 && trophyBars.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">Club analytics</h2>
      <Grid>
        {compBars.length > 0 && (
          <ChartPanel
            title="Output by competition (club)"
            insight="Where club career G+A is concentrated — leagues vs cups vs Europe."
            tall
          >
            <ResponsiveContainer width="100%" height={Math.min(480, 48 + compBarsSlice.length * 32)}>
              <BarChart layout="vertical" data={compBarsSlice} margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="id"
                  width={100}
                  tick={{ fill: theme.axis, fontSize: 10 }}
                  tickFormatter={(id) => compLabel(String(id))}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                  formatter={(value) => fmtTooltipNumber(value)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="goals" name="Goals" stackId="a" fill={GOALS} radius={[0, 0, 0, 0]} {...CHART_ANIM}>
                  {compBarsSlice.map((row) => (
                    <Cell key={row.id} fill={GOALS} />
                  ))}
                </Bar>
                <Bar dataKey="assists" name="Assists" stackId="a" fill={ASSISTS} radius={[0, 6, 6, 0]} {...CHART_ANIM}>
                  {compBarsSlice.map((row) => (
                    <Cell key={`${row.id}-a`} fill={ASSISTS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {seasonClub.length > 0 && (
          <ChartPanel title="Club-only season trend" insight="Goals and assists per season from season data (club rows only).">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonClub} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
                <YAxis tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="goals"
                  name="Goals"
                  stroke={GOALS}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  {...CHART_ANIM}
                />
                <Line
                  type="monotone"
                  dataKey="assists"
                  name="Assists"
                  stroke={ASSISTS}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  {...CHART_ANIM}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}
      </Grid>

      {trophyBars.length > 0 && (
        <ChartPanel title="Trophy wins by title" insight="Count of trophy rows in your cabinet (one per season won).">
          <ResponsiveContainer width="100%" height={Math.min(400, 40 + trophyBars.length * 40)}>
            <BarChart data={trophyBars} margin={{ top: 12, right: 12, left: 4, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: theme.axis, fontSize: 9 }} angle={-28} textAnchor="end" height={70} interval={0} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={TOOLTIP_CURSOR_BAR}
                formatter={(value) => [fmtTooltipNumber(value), "Wins"]}
              />
              <Bar dataKey="count" name="Wins" radius={[8, 8, 0, 0]} maxBarSize={48} {...CHART_ANIM}>
                {trophyBars.map((row, i) => (
                  <Cell key={row.id} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </>
  );
}

// ─── International ────────────────────────────────────────────────────────────

export function StatsInternationalCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const intCompSlice = useMemo(() => intCompetitionAgg(api.intData), [api.intData]);
  const seasonInt = useMemo(() => intOnlySeasonSeries(api.intData), [api.intData]);
  const trophyBars = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of api.intTrophies) {
      const id = String(t.competition ?? "").trim();
      if (!id) continue;
      m.set(id, (m.get(id) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([id, count]) => ({ id, name: compLabel(id), count }))
      .sort((a, b) => b.count - a.count);
  }, [api.intTrophies]);

  if (intCompSlice.length === 0 && seasonInt.length === 0 && trophyBars.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">International analytics</h2>
      <Grid>
        {intCompSlice.length > 0 && (
          <ChartPanel
            title="National team by competition"
            insight="Breakdown of caps output across WC, qualifiers, friendlies, etc."
            tall
          >
            <ResponsiveContainer width="100%" height={Math.min(420, 48 + intCompSlice.length * 36)}>
              <BarChart layout="vertical" data={intCompSlice} margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="id"
                  width={110}
                  tick={{ fill: theme.axis, fontSize: 10 }}
                  tickFormatter={(id) => compLabel(String(id))}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="goals" name="Goals" stackId="a" fill={GOALS} radius={[0, 0, 0, 0]} {...CHART_ANIM}>
                  {intCompSlice.map((row) => (
                    <Cell key={row.id} fill={GOALS} />
                  ))}
                </Bar>
                <Bar dataKey="assists" name="Assists" stackId="a" fill={ASSISTS} radius={[0, 6, 6, 0]} {...CHART_ANIM}>
                  {intCompSlice.map((row) => (
                    <Cell key={`${row.id}-a`} fill={ASSISTS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {seasonInt.length > 0 && (
          <ChartPanel title="International season trend" insight="Year-to-year national-team production.">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={seasonInt} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
                <YAxis yAxisId="left" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="ga" name="G+A" fill={INT} radius={[6, 6, 0, 0]} maxBarSize={32} {...CHART_ANIM}>
                  {seasonInt.map((row) => (
                    <Cell key={row.season} fill={INT} />
                  ))}
                </Bar>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="apps"
                  name="Apps"
                  stroke={RATING}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  {...CHART_ANIM}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}
      </Grid>

      {trophyBars.length > 0 && (
        <ChartPanel title="International honours by title">
          <ResponsiveContainer width="100%" height={Math.min(360, 40 + trophyBars.length * 44)}>
            <BarChart layout="vertical" data={trophyBars} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: theme.axis, fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [fmtTooltipNumber(value), "Wins"]} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={26} {...CHART_ANIM}>
                {trophyBars.map((row, i) => (
                  <Cell key={row.id} fill={PIE_PALETTE[(i + 3) % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </>
  );
}

// ─── By season (extra) ───────────────────────────────────────────────────────

export function StatsBySeasonExtraCharts({
  api,
  theme,
  tooltipStyle,
  bySeasonForCharts,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
  /** Subset of seasons for charts (e.g. stats page search). Defaults to full career. */
  bySeasonForCharts?: StatsApiState["bySeason"];
}) {
  const seasonRows = bySeasonForCharts ?? api.bySeason;

  const composed = useMemo(
    () =>
      seasonRows.map((s) => ({
        ...s,
        ga: s.goals + s.assists,
      })),
    [seasonRows],
  );

  const split = useMemo(() => {
    const full = buildSeasonClubIntSplit(api.clubData, api.intData);
    if (!bySeasonForCharts) return full;
    const allow = new Set(bySeasonForCharts.map((s) => s.season));
    return full.filter((r) => allow.has(r.season));
  }, [api.clubData, api.intData, bySeasonForCharts]);

  if (composed.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">Season analytics</h2>
      <Grid>
        <ChartPanel
          title="Total G+A vs average rating"
          insight="Bars = involvements; line = mean match rating that season (when logged)."
        >
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={composed} margin={{ top: 12, right: 16, left: 4, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis yAxisId="g" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" domain={[6, 10]} tick={{ fill: theme.axis, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="g" dataKey="ga" name="G+A" radius={[8, 8, 2, 2]} maxBarSize={36} {...CHART_ANIM}>
                {composed.map((row) => (
                  <Cell key={row.season} fill={GA} />
                ))}
              </Bar>
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="avgrating"
                name="Avg rating"
                stroke={RATING}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
                {...CHART_ANIM}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Appearances by season"
          insight="Workload trend — club + international apps combined."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={composed} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={TOOLTIP_CURSOR_BAR} formatter={(value) => fmtTooltipNumber(value)} />
              <Bar dataKey="apps" name="Apps" radius={[8, 8, 2, 2]} maxBarSize={40} {...CHART_ANIM}>
                {composed.map((row, i) => (
                  <Cell key={row.season} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </Grid>

      {split.length > 0 && (
        <ChartPanel
          title="Goal type: club vs international (per season)"
          insight="Compare scoring output at club vs country each season."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={split} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="season" tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={TOOLTIP_CURSOR_BAR} formatter={(value) => fmtTooltipNumber(value)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="clubGoals" name="Club goals" stackId="g" fill={CLUB} radius={[0, 0, 0, 0]} {...CHART_ANIM}>
                {split.map((row) => (
                  <Cell key={`${row.season}-club`} fill={CLUB} />
                ))}
              </Bar>
              <Bar dataKey="intGoals" name="Int. goals" stackId="g" fill={INT} radius={[6, 6, 0, 0]} {...CHART_ANIM}>
                {split.map((row) => (
                  <Cell key={`${row.season}-int`} fill={INT} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </>
  );
}

// ─── By year (extra) ──────────────────────────────────────────────────────────

export function StatsByYearExtraCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const yearGradId = useId().replace(/:/g, "");
  const data = useMemo(
    () => api.byYear.map((y) => ({ ...y, ga: y.goals + y.assists })),
    [api.byYear],
  );
  if (data.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">Yearly analytics</h2>
      <Grid>
        <ChartPanel
          title="Stacked G+A by calendar year"
          insight="How each year splits between goals and assists."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={TOOLTIP_CURSOR_BAR} formatter={(value) => fmtTooltipNumber(value)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="goals" name="Goals" stackId="x" fill={GOALS} {...CHART_ANIM}>
                {data.map((row) => (
                  <Cell key={`${row.year}-g`} fill={GOALS} />
                ))}
              </Bar>
              <Bar dataKey="assists" name="Assists" stackId="x" fill={ASSISTS} radius={[6, 6, 0, 0]} {...CHART_ANIM}>
                {data.map((row) => (
                  <Cell key={`${row.year}-a`} fill={ASSISTS} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Total involvements trend" insight="Single metric peak years for G+A combined.">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 6 }}>
              <defs>
                <linearGradient id={`${yearGradId}-ga-trend`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GA} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={GA} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: theme.grid }} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={TOOLTIP_CURSOR_AREA} formatter={(value) => fmtTooltipNumber(value)} />
              <Area
                type="monotone"
                dataKey="ga"
                name="G+A"
                stroke={GA}
                strokeWidth={2.5}
                fill={`url(#${yearGradId}-ga-trend)`}
                dot={{ r: 3, fill: GA, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                {...CHART_ANIM}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </Grid>
    </>
  );
}

// ─── Best ─────────────────────────────────────────────────────────────────────

export function StatsBestCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const barData = useMemo(() => {
    const rows: { key: string; label: string; value: number; fill: string }[] = [];
    const b = api.best;
    if (b.bestSeasonGoals) rows.push({ key: "bs-g", label: "Best season (G)", value: b.bestSeasonGoals.goals, fill: GOALS });
    if (b.bestSeasonAssists) rows.push({ key: "bs-a", label: "Best season (A)", value: b.bestSeasonAssists.assists, fill: ASSISTS });
    if (b.bestSeasonTotal)
      rows.push({
        key: "bs-ga",
        label: "Best season (G+A)",
        value: b.bestSeasonTotal.goals + b.bestSeasonTotal.assists,
        fill: GA,
      });
    if (b.bestYearGoals) rows.push({ key: "by-g", label: "Best year (G)", value: b.bestYearGoals.goals, fill: GOALS });
    if (b.bestYearAssists) rows.push({ key: "by-a", label: "Best year (A)", value: b.bestYearAssists.assists, fill: ASSISTS });
    if (b.bestYearTotal)
      rows.push({
        key: "by-ga",
        label: "Best year (G+A)",
        value: b.bestYearTotal.goals + b.bestYearTotal.assists,
        fill: GA,
      });
    return rows;
  }, [api.best]);

  if (barData.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">Records comparison</h2>
      <ChartPanel
        title="Career highs on one scale"
        insight="Compare peak season and peak calendar-year numbers side by side (different contexts — use as a snapshot)."
      >
        <ResponsiveContainer width="100%" height={Math.min(400, 60 + barData.length * 44)}>
          <BarChart layout="vertical" data={barData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={150} tick={{ fill: theme.axis, fontSize: 10 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={28} {...CHART_ANIM}>
              {barData.map((e) => (
                <Cell key={e.key} fill={e.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </>
  );
}

// ─── Competitions ─────────────────────────────────────────────────────────────

export function StatsCompetitionCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const horiz = useMemo(
    () =>
      [...api.byCompetition]
        .map((r) => ({
          compKey: r.competition,
          name: labelForCompetitionOrTrophyId(r.competition),
          ga: r.goals + r.assists,
          goals: r.goals,
          assists: r.assists,
          apps: r.apps,
        }))
        .sort((a, b) => b.ga - a.ga)
        .slice(0, 12),
    [api.byCompetition],
  );

  const pieSlices = useMemo(() => competitionGaPieSlices(api.byCompetition, 6), [api.byCompetition]);
  const perApp = useMemo(
    () =>
      api.byCompetition
        .map((r) => ({
          compKey: r.competition,
          name: labelForCompetitionOrTrophyId(r.competition).slice(0, 18),
          perApp: r.apps > 0 ? (r.goals + r.assists) / r.apps : 0,
          apps: r.apps,
        }))
        .filter((x) => x.apps > 0)
        .sort((a, b) => b.perApp - a.perApp)
        .slice(0, 10),
    [api.byCompetition],
  );

  if (horiz.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">Competition analytics</h2>
      <Grid>
        <ChartPanel
          title="Top competitions by G+A"
          insight="Horizontal view of your biggest statistical footprints."
          tall
        >
          <ResponsiveContainer width="100%" height={Math.min(440, 40 + horiz.length * 36)}>
            <BarChart layout="vertical" data={horiz} margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: theme.axis, fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
              <Bar dataKey="ga" name="G+A" radius={[0, 8, 8, 0]} maxBarSize={24} {...CHART_ANIM}>
                {horiz.map((row, i) => (
                  <Cell key={row.compKey} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        {pieSlices.length > 0 && (
          <ChartPanel
            title="Share of career G+A"
            insight="Top competitions vs everything else — concentration of output."
            tall
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ bottom: 8 }}>
                <Pie
                  data={pieSlices.map((s) => ({ ...s, name: compLabel(s.key) }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={54}
                  outerRadius={86}
                  paddingAngle={2}
                  {...CHART_ANIM}
                  label={({ name, percent }) =>
                    `${String(name ?? "").split(" ")[0]} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                  }
                >
                  {pieSlices.map((s, i) => (
                    <Cell
                      key={s.key}
                      fill={PIE_PALETTE[i % PIE_PALETTE.length]}
                      stroke="var(--card-bg, #fff)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
                <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="bottom" height={32} />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}
      </Grid>

      {perApp.length > 0 && (
        <ChartPanel
          title="Efficiency leaders (G+A per app)"
          insight="Which competitions you’ve been most productive in per appearance (min. data required)."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={perApp} margin={{ top: 12, right: 12, left: 4, bottom: 56 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: theme.axis, fontSize: 9 }} angle={-25} textAnchor="end" height={65} interval={0} />
              <YAxis tick={{ fill: theme.axis, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={TOOLTIP_CURSOR_BAR} formatter={(value) => [fmtTooltipNumber(value), "G+A / app"]} />
              <Bar dataKey="perApp" name="G+A per app" radius={[8, 8, 2, 2]} maxBarSize={36} {...CHART_ANIM}>
                {perApp.map((row, i) => (
                  <Cell key={row.compKey} fill={PIE_PALETTE[(i + 2) % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )}
    </>
  );
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export function StatsTeamCharts({
  api,
  theme,
  tooltipStyle,
}: {
  api: StatsApiState;
  theme: Theme;
  tooltipStyle: React.CSSProperties;
}) {
  const teams = useMemo(
    () =>
      api.byTeam
        .map((t) => ({
          teamKey: t.team,
          name: (TEAM_LABELS[t.team] ?? t.team).slice(0, 22),
          ga: t.goals + t.assists,
          goals: t.goals,
          assists: t.assists,
          apps: t.apps,
        }))
        .sort((a, b) => b.ga - a.ga),
    [api.byTeam],
  );

  if (teams.length === 0) return null;

  return (
    <>
      <h2 className="stats-analytics-section-title">Club analytics</h2>
      <Grid>
        <ChartPanel title="Career G+A by club" insight="Which employers account for the most involvements.">
          <ResponsiveContainer width="100%" height={Math.min(400, 40 + teams.length * 40)}>
            <BarChart layout="vertical" data={teams} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: theme.axis, fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="goals" name="Goals" stackId="x" fill={GOALS} radius={[0, 0, 0, 0]} {...CHART_ANIM}>
                {teams.map((row) => (
                  <Cell key={`${row.teamKey}-g`} fill={GOALS} />
                ))}
              </Bar>
              <Bar dataKey="assists" name="Assists" stackId="x" fill={ASSISTS} radius={[0, 6, 6, 0]} {...CHART_ANIM}>
                {teams.map((row) => (
                  <Cell key={`${row.teamKey}-a`} fill={ASSISTS} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Apps logged per club" insight="Where you’ve played the most recorded matches.">
          <ResponsiveContainer width="100%" height={Math.min(400, 40 + teams.length * 40)}>
            <BarChart layout="vertical" data={teams} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: theme.axis, fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: theme.axis, fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmtTooltipNumber(value)} />
              <Bar dataKey="apps" name="Apps" radius={[0, 8, 8, 0]} maxBarSize={26} {...CHART_ANIM}>
                {teams.map((row, i) => (
                  <Cell key={row.teamKey} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </Grid>
    </>
  );
}
