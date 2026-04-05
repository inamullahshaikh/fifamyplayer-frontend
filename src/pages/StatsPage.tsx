import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconGlobe,
  IconTrophy,
  IconYearly,
} from "../components/dashboard/SidebarNavIcons";
import {
  IconAppearances,
  IconAssists,
  IconGoalInvolvements,
  IconGoals,
  IconRating,
} from "../components/dashboard/StatIcons";
import {
  CLUB_TROPHY_LABEL,
  COMPETITION_LABELS,
  INT_TROPHIES,
  TEAM_LABELS,
} from "../config/seasonDataConfig";
import { STATIC_PLAYER_PROFILE } from "../config/dashboardStatic";
import {
  getCompetitionLogo,
  getNationImage,
  getTrophyLogo,
  TEAM_IMAGES,
} from "../config/seasonAssets";
import {
  StatsBestCharts,
  StatsBySeasonExtraCharts,
  StatsByYearExtraCharts,
  StatsClubCharts,
  StatsCompetitionCharts,
  StatsInternationalCharts,
  StatsOverviewCharts,
  StatsTeamCharts,
} from "../components/stats/StatsAnalyticsCharts";
import { useChartTheme } from "../hooks/useChartTheme";
import { useStatsApi } from "../hooks/useStatsApi";
import type { TrophyRow } from "../types/dashboard";

const INT_TROPHY_LABELS: Record<string, string> = Object.fromEntries(
  INT_TROPHIES.map((t) => [t.id, t.label]),
);

const CLUB_COMP_HEADER_ORDER = [
  "ucl",
  "uesc",
  "uecl",
  "usc",
  "ll",
  "cdr",
  "sde",
  "pl",
  "fa",
  "efl",
  "cs",
  "bl",
  "dfb",
  "dfl",
  "sa",
  "ci",
  "si",
  "l1",
  "cdf",
  "tdc",
] as const;

function sortClubCompetitionIds(ids: string[]): string[] {
  const rank = (id: string) => {
    const i = CLUB_COMP_HEADER_ORDER.indexOf(
      id as (typeof CLUB_COMP_HEADER_ORDER)[number],
    );
    return i === -1 ? 500 + id.charCodeAt(0) : i;
  };
  return [...ids].sort((a, b) => rank(a) - rank(b));
}

function aggregateTrophiesByType(rows: TrophyRow[]): [string, number][] {
  const m = new Map<string, number>();
  for (const t of rows) {
    const id = String(t.competition ?? "").trim();
    if (!id) continue;
    m.set(id, (m.get(id) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "club", label: "Club" },
  { id: "international", label: "International" },
  { id: "by-season", label: "By Season" },
  { id: "by-year", label: "By Year" },
  { id: "best", label: "Best" },
  { id: "by-competition", label: "Competitions" },
  { id: "by-team", label: "Teams" },
] as const;

const GOALS_COLOR = "#2563eb";
const ASSISTS_COLOR = "#0ea5e9";

function fmt(n: number, d = 2) {
  if (!Number.isFinite(n) || n === 0) return "—";
  return n.toFixed(d);
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((100 * part) / total);
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent?: "goals" | "assists" | "apps" | "rating";
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`stats-stat-card ${accent ? `stats-stat-card--${accent}` : ""}`}
    >
      {icon && <span className="stats-stat-icon-wrap">{icon}</span>}
      <span className="stats-stat-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="stats-stat-label">{label}</span>
    </div>
  );
}

export default function StatsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [seasonSearch, setSeasonSearch] = useState("");
  const api = useStatsApi();
  const theme = useChartTheme();
  const tooltipStyle = {
    backgroundColor: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    borderRadius: 10,
    fontSize: 12,
  };

  const clubGoalsPct = pct(api.club.goals, api.overview.goals || 1);
  const intGoalsPct = 100 - clubGoalsPct;
  const clubAppsPct = pct(api.club.apps, api.overview.apps || 1);
  const gPerApp =
    api.overview.apps > 0 ? api.overview.goals / api.overview.apps : 0;
  const aPerApp =
    api.overview.apps > 0 ? api.overview.assists / api.overview.apps : 0;

  const uclLogo = getCompetitionLogo("ucl");
  const euroLogo = getCompetitionLogo("euro");

  const rawClubCompIds = [
    ...new Set(
      api.clubData
        .map((r) => String(r.competition ?? "").trim())
        .filter(Boolean),
    ),
  ];
  const clubHeaderCompIds =
    rawClubCompIds.length > 0
      ? sortClubCompetitionIds(rawClubCompIds).slice(0, 10)
      : ["ucl", "ll", "cdr", "sde"];
  const clubTrophyBreakdown = aggregateTrophiesByType(api.clubTrophies);
  const clubSeasonsCount = new Set(
    api.clubData.map((r) => String(r.season ?? "").trim()).filter(Boolean),
  ).size;
  const clubGa = api.club.goals + api.club.assists;
  const clubGaPerApp = api.club.apps > 0 ? clubGa / api.club.apps : 0;
  const clubGoalsSharePct =
    api.club.goals + api.club.assists > 0
      ? Math.round((100 * api.club.goals) / (api.club.goals + api.club.assists))
      : 0;

  const intTrophyBreakdown = aggregateTrophiesByType(api.intTrophies);
  const intSeasonsCount = new Set(
    api.intData.map((r) => String(r.season ?? "").trim()).filter(Boolean),
  ).size;
  const intGa = api.international.goals + api.international.assists;
  const intGaPerApp =
    api.international.apps > 0 ? intGa / api.international.apps : 0;
  const intGoalsSharePct =
    api.international.goals + api.international.assists > 0
      ? Math.round(
          (100 * api.international.goals) /
            (api.international.goals + api.international.assists),
        )
      : 0;

  const seasonQueryNorm = seasonSearch.trim().toLowerCase();

  const bySeasonChartFiltered = useMemo(() => {
    if (!seasonQueryNorm) return api.bySeason;
    return api.bySeason.filter((s) =>
      s.season.toLowerCase().includes(seasonQueryNorm),
    );
  }, [api.bySeason, seasonQueryNorm]);

  const bySeasonBreakdownFiltered = useMemo(() => {
    if (!seasonQueryNorm) return api.bySeasonWithBreakdown;
    return api.bySeasonWithBreakdown.filter((s) =>
      s.season.toLowerCase().includes(seasonQueryNorm),
    );
  }, [api.bySeasonWithBreakdown, seasonQueryNorm]);

  useEffect(() => {
    if (tab !== "by-season") setSeasonSearch("");
  }, [tab]);

  if (api.error) {
    return (
      <section className="dash-view dash-stats">
        <header className="ph ph--stats">
          <div className="ph-glow" aria-hidden />
          <div className="ph-inner">
            <div className="ph-text">
              <p className="ph-kicker">
                <span className="ph-kicker-dot" aria-hidden />
                Career Analytics
              </p>
              <h1 className="ph-title">Stats</h1>
              <p className="ph-desc">
                Complete career statistics and breakdowns.
              </p>
            </div>
            <svg
              className="ph-deco"
              aria-hidden
              viewBox="0 0 200 130"
              fill="none"
            >
              <rect
                x="10"
                y="80"
                width="22"
                height="42"
                rx="4"
                fill="currentColor"
                fillOpacity="0.15"
              />
              <rect
                x="42"
                y="55"
                width="22"
                height="67"
                rx="4"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <rect
                x="74"
                y="35"
                width="22"
                height="87"
                rx="4"
                fill="currentColor"
                fillOpacity="0.25"
              />
              <rect
                x="106"
                y="60"
                width="22"
                height="62"
                rx="4"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <rect
                x="138"
                y="20"
                width="22"
                height="102"
                rx="4"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <rect
                x="170"
                y="45"
                width="22"
                height="77"
                rx="4"
                fill="currentColor"
                fillOpacity="0.22"
              />
            </svg>
          </div>
        </header>
        <div className="stats-alert stats-alert--error" role="alert">
          {api.error}
        </div>
      </section>
    );
  }

  return (
    <section className="dash-view dash-stats">
      <header className="ph ph--stats">
        <div className="ph-glow" aria-hidden />
        <div className="ph-inner">
          <div className="ph-text">
            <p className="ph-kicker">
              <span className="ph-kicker-dot" aria-hidden />
              Career Analytics
            </p>
            <h1 className="ph-title">Stats</h1>
            <p className="ph-desc">
              Full career picture: club &amp; international totals, season and
              year breakdowns, competitions, teams, and highlights.
            </p>
          </div>
          <svg
            className="ph-deco"
            aria-hidden
            viewBox="0 0 200 130"
            fill="none"
          >
            <rect
              x="10"
              y="80"
              width="22"
              height="42"
              rx="4"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <rect
              x="42"
              y="55"
              width="22"
              height="67"
              rx="4"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <rect
              x="74"
              y="35"
              width="22"
              height="87"
              rx="4"
              fill="currentColor"
              fillOpacity="0.25"
            />
            <rect
              x="106"
              y="60"
              width="22"
              height="62"
              rx="4"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <rect
              x="138"
              y="20"
              width="22"
              height="102"
              rx="4"
              fill="currentColor"
              fillOpacity="0.3"
            />
            <rect
              x="170"
              y="45"
              width="22"
              height="77"
              rx="4"
              fill="currentColor"
              fillOpacity="0.22"
            />
          </svg>
        </div>
        {!api.loading && (
          <div className="ph-bottom">
            <div className="ph-stat">
              <span className="ph-stat-n">{api.overview.apps}</span>
              <span className="ph-stat-l">Appearances</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{api.overview.goals}</span>
              <span className="ph-stat-l">Goals</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{api.overview.assists}</span>
              <span className="ph-stat-l">Assists</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{api.byCompetition.length}</span>
              <span className="ph-stat-l">Competitions</span>
            </div>
          </div>
        )}
      </header>

      <nav className="stats-tabs" aria-label="Stats sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`stats-tab ${tab === t.id ? "stats-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="stats-content">
        {api.loading ? (
          <p className="stats-loading muted-text">Loading…</p>
        ) : (
          <>
            {tab === "overview" && (
              <div className="stats-section">
                <div className="stats-tab-visuals">
                  <StatsOverviewCharts
                    api={api}
                    theme={theme}
                    tooltipStyle={tooltipStyle}
                  />
                </div>

                <div className="stats-tab-data">
                  <div className="stats-hero">
                    <div className="stats-hero-main">
                      <div className="stats-hero-kpis">
                        <StatCard
                          label="Appearances"
                          value={api.overview.apps}
                          accent="apps"
                          icon={<IconAppearances />}
                        />
                        <StatCard
                          label="Goals"
                          value={api.overview.goals}
                          accent="goals"
                          icon={<IconGoals />}
                        />
                        <StatCard
                          label="Assists"
                          value={api.overview.assists}
                          accent="assists"
                          icon={<IconAssists />}
                        />
                        {api.overview.avgrating != null && (
                          <StatCard
                            label="Avg rating"
                            value={api.overview.avgrating.toFixed(2)}
                            accent="rating"
                            icon={<IconRating />}
                          />
                        )}
                      </div>
                      <div className="stats-hero-detail">
                        <div className="stats-detail-row">
                          <span className="stats-detail-label">
                            Goals per appearance
                          </span>
                          <span className="stats-detail-value">
                            {fmt(gPerApp)}
                          </span>
                        </div>
                        <div className="stats-detail-row">
                          <span className="stats-detail-label">
                            Assists per appearance
                          </span>
                          <span className="stats-detail-value">
                            {fmt(aPerApp)}
                          </span>
                        </div>
                        <div className="stats-detail-row">
                          <span className="stats-detail-label">
                            Goal involvements (G+A)
                          </span>
                          <span className="stats-detail-value">
                            {(
                              api.overview.goals + api.overview.assists
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="stats-hero-side">
                      <div className="stats-trophy-strip">
                        <div className="stats-trophy-item">
                          {uclLogo && (
                            <img
                              src={uclLogo}
                              alt=""
                              className="stats-trophy-img"
                            />
                          )}
                          <span className="stats-trophy-num">
                            {api.clubTrophies.length}
                          </span>
                          <span className="stats-trophy-txt">
                            Club trophies
                          </span>
                        </div>
                        <div className="stats-trophy-item">
                          {euroLogo && (
                            <img
                              src={euroLogo}
                              alt=""
                              className="stats-trophy-img"
                            />
                          )}
                          <span className="stats-trophy-num">
                            {api.intTrophies.length}
                          </span>
                          <span className="stats-trophy-txt">
                            Int. trophies
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="stats-subheading">
                    Club vs international (goals)
                  </h3>
                  <div className="stats-split-visual">
                    <div className="stats-split-logos">
                      {uclLogo && (
                        <img src={uclLogo} alt="" width={40} height={40} />
                      )}
                      {euroLogo && (
                        <img src={euroLogo} alt="" width={40} height={40} />
                      )}
                    </div>
                    <div className="stats-split-bar">
                      <div
                        className="stats-split-seg stats-split-seg--club"
                        style={{ width: `${clubGoalsPct}%` }}
                        title={`Club ${clubGoalsPct}%`}
                      />
                      <div
                        className="stats-split-seg stats-split-seg--int"
                        style={{ width: `${intGoalsPct}%` }}
                        title={`International ${intGoalsPct}%`}
                      />
                    </div>
                    <div className="stats-split-legend">
                      <span>
                        <strong>{api.club.goals}</strong> club ({clubGoalsPct}%)
                      </span>
                      <span>
                        <strong>{api.international.goals}</strong> international
                        ({intGoalsPct}%)
                      </span>
                    </div>
                  </div>

                  <h3 className="stats-subheading">Appearances split</h3>
                  <div className="stats-split-bar stats-split-bar--apps">
                    <div
                      className="stats-split-seg stats-split-seg--club"
                      style={{ width: `${clubAppsPct}%` }}
                    />
                    <div
                      className="stats-split-seg stats-split-seg--int"
                      style={{ width: `${100 - clubAppsPct}%` }}
                    />
                  </div>
                  <p className="stats-split-caption muted-text">
                    {api.club.apps.toLocaleString()} club apps ·{" "}
                    {api.international.apps.toLocaleString()} international apps
                  </p>

                  <h3 className="stats-subheading">Data coverage</h3>
                  <div className="stats-meta-chips">
                    <span className="stats-chip">
                      {api.bySeason.length} seasons
                    </span>
                    <span className="stats-chip">
                      {api.byYear.length} calendar years
                    </span>
                    <span className="stats-chip">
                      {api.byCompetition.length} competitions
                    </span>
                    <span className="stats-chip">
                      {api.byTeam.length} clubs
                    </span>
                  </div>
                </div>
              </div>
            )}

            {tab === "club" && (
              <div className="stats-section stats-section--club">
                <div className="stats-club-hero">
                  <div className="stats-section-head stats-section-head--club">
                    <div className="stats-club-header-logos" aria-hidden>
                      {clubHeaderCompIds.map((cid) => {
                        const src = getCompetitionLogo(cid);
                        if (!src) return null;
                        return (
                          <img
                            key={cid}
                            src={src}
                            alt=""
                            className="stats-club-header-logo"
                            title={COMPETITION_LABELS[cid] ?? cid}
                          />
                        );
                      })}
                    </div>
                    <div className="stats-club-head-copy">
                      <h2 className="stats-section-title">Club statistics</h2>
                      <p className="stats-section-sub muted-text">
                        Domestic leagues, cups, and UEFA competitions
                        {clubSeasonsCount > 0 ? (
                          <>
                            {" "}
                            ·{" "}
                            <strong className="stats-club-seasons">
                              {clubSeasonsCount}
                            </strong>{" "}
                            seasons in the data
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="stats-tab-visuals">
                  <StatsClubCharts
                    api={api}
                    theme={theme}
                    tooltipStyle={tooltipStyle}
                  />
                </div>

                <div className="stats-tab-data">
                  <div className="stats-club-main-grid">
                    <div className="stats-club-primary">
                      <div className="stats-cards-row stats-cards-row--club">
                        <StatCard
                          label="Appearances"
                          value={api.club.apps}
                          accent="apps"
                          icon={<IconAppearances />}
                        />
                        <StatCard
                          label="Goals"
                          value={api.club.goals}
                          accent="goals"
                          icon={<IconGoals />}
                        />
                        <StatCard
                          label="Assists"
                          value={api.club.assists}
                          accent="assists"
                          icon={<IconAssists />}
                        />
                        {api.club.avgrating != null && (
                          <StatCard
                            label="Avg rating"
                            value={api.club.avgrating.toFixed(2)}
                            accent="rating"
                            icon={<IconRating />}
                          />
                        )}
                      </div>

                      <div className="stats-club-perf-strip">
                        <div className="stats-club-perf-card">
                          <span className="stats-club-perf-label">
                            G per app
                          </span>
                          <span className="stats-club-perf-val">
                            {fmt(
                              api.club.apps > 0
                                ? api.club.goals / api.club.apps
                                : 0,
                            )}
                          </span>
                          <span className="stats-club-perf-hint">
                            equiv. per appearance
                          </span>
                        </div>
                        <div className="stats-club-perf-card">
                          <span className="stats-club-perf-label">
                            A per app
                          </span>
                          <span className="stats-club-perf-val">
                            {fmt(
                              api.club.apps > 0
                                ? api.club.assists / api.club.apps
                                : 0,
                            )}
                          </span>
                          <span className="stats-club-perf-hint">
                            equiv. per appearance
                          </span>
                        </div>
                        <div className="stats-club-perf-card stats-club-perf-card--ga">
                          <span className="stats-club-perf-label">
                            G+A per app
                          </span>
                          <span className="stats-club-perf-val">
                            {fmt(clubGaPerApp)}
                          </span>
                          <span className="stats-club-perf-hint">
                            {clubGa.toLocaleString()} total involvements
                          </span>
                        </div>
                        <div className="stats-club-perf-card stats-club-perf-card--split">
                          <span className="stats-club-perf-label">
                            Goals vs assists
                          </span>
                          <div
                            className="stats-club-ga-bar"
                            title={`Goals ${clubGoalsSharePct}% · Assists ${100 - clubGoalsSharePct}%`}
                          >
                            <div
                              className="stats-club-ga-bar-g"
                              style={{ width: `${clubGoalsSharePct}%` }}
                            />
                            <div
                              className="stats-club-ga-bar-a"
                              style={{ width: `${100 - clubGoalsSharePct}%` }}
                            />
                          </div>
                          <span className="stats-club-perf-hint">
                            {clubGoalsSharePct}% goals ·{" "}
                            {100 - clubGoalsSharePct}% assists
                          </span>
                        </div>
                      </div>
                    </div>

                    <aside
                      className="stats-club-trophy-panel"
                      aria-labelledby="club-trophy-heading"
                    >
                      <div className="stats-club-trophy-panel-head">
                        <h3
                          id="club-trophy-heading"
                          className="stats-club-trophy-title"
                        >
                          Trophy cabinet
                        </h3>
                        <span className="stats-club-trophy-total-badge">
                          {api.clubTrophies.length}
                        </span>
                      </div>
                      <p className="stats-club-trophy-desc muted-text">
                        Club honours — each row is a season won.
                      </p>
                      {clubTrophyBreakdown.length > 0 ? (
                        <ul className="stats-club-trophy-list">
                          {clubTrophyBreakdown.map(([trophyId, count]) => {
                            const logo = getTrophyLogo(trophyId);
                            const name = CLUB_TROPHY_LABEL[trophyId] ?? trophyId;
                            return (
                              <li
                                key={trophyId}
                                className="stats-club-trophy-row"
                              >
                                {logo ? (
                                  <img
                                    src={logo}
                                    alt=""
                                    className="stats-club-trophy-img"
                                  />
                                ) : (
                                  <span
                                    className="stats-club-trophy-fallback"
                                    aria-hidden
                                  >
                                    {name.slice(0, 2)}
                                  </span>
                                )}
                                <div className="stats-club-trophy-meta">
                                  <span className="stats-club-trophy-name">
                                    {name}
                                  </span>
                                  <span className="stats-club-trophy-count muted-text">
                                    {count}×
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="stats-club-trophy-empty muted-text">
                          No club trophies recorded yet.
                        </p>
                      )}
                    </aside>
                  </div>
                </div>
              </div>
            )}

            {tab === "international" && (
              <div className="stats-section stats-section--int">
                <div className="stats-int-hero">
                  <div className="stats-section-head stats-section-head--int">
                    <div className="stats-int-header-icons" aria-hidden>
                      <span className="stats-int-header-icon">
                        <IconGlobe width={44} height={44} />
                      </span>
                      <span className="stats-int-header-icon">
                        <IconTrophy width={44} height={44} />
                      </span>
                    </div>
                    <div className="stats-int-head-copy">
                      <h2 className="stats-section-title">
                        International statistics
                      </h2>
                      <p className="stats-section-sub muted-text">
                        National team — qualifiers, tournaments, and friendlies
                        {intSeasonsCount > 0 ? (
                          <>
                            {" "}
                            ·{" "}
                            <strong className="stats-int-seasons">
                              {intSeasonsCount}
                            </strong>{" "}
                            seasons in the data
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="stats-tab-visuals">
                  <StatsInternationalCharts
                    api={api}
                    theme={theme}
                    tooltipStyle={tooltipStyle}
                  />
                </div>

                <div className="stats-tab-data">
                  <div className="stats-int-main-grid">
                    <div className="stats-int-primary">
                      <div className="stats-cards-row stats-cards-row--int">
                        <StatCard
                          label="Appearances"
                          value={api.international.apps}
                          accent="apps"
                          icon={<IconAppearances />}
                        />
                        <StatCard
                          label="Goals"
                          value={api.international.goals}
                          accent="goals"
                          icon={<IconGoals />}
                        />
                        <StatCard
                          label="Assists"
                          value={api.international.assists}
                          accent="assists"
                          icon={<IconAssists />}
                        />
                        {api.international.avgrating != null && (
                          <StatCard
                            label="Avg rating"
                            value={api.international.avgrating.toFixed(2)}
                            accent="rating"
                            icon={<IconRating />}
                          />
                        )}
                      </div>

                      <div className="stats-int-perf-strip">
                        <div className="stats-club-perf-card">
                          <span className="stats-club-perf-label">
                            G per app
                          </span>
                          <span className="stats-club-perf-val">
                            {fmt(
                              api.international.apps > 0
                                ? api.international.goals /
                                    api.international.apps
                                : 0,
                            )}
                          </span>
                          <span className="stats-club-perf-hint">
                            equiv. per appearance
                          </span>
                        </div>
                        <div className="stats-club-perf-card">
                          <span className="stats-club-perf-label">
                            A per app
                          </span>
                          <span className="stats-club-perf-val">
                            {fmt(
                              api.international.apps > 0
                                ? api.international.assists /
                                    api.international.apps
                                : 0,
                            )}
                          </span>
                          <span className="stats-club-perf-hint">
                            equiv. per appearance
                          </span>
                        </div>
                        <div className="stats-club-perf-card stats-club-perf-card--ga">
                          <span className="stats-club-perf-label">
                            G+A per app
                          </span>
                          <span className="stats-club-perf-val">
                            {fmt(intGaPerApp)}
                          </span>
                          <span className="stats-club-perf-hint">
                            {intGa.toLocaleString()} total involvements
                          </span>
                        </div>
                        <div className="stats-club-perf-card stats-club-perf-card--split">
                          <span className="stats-club-perf-label">
                            Goals vs assists
                          </span>
                          <div
                            className="stats-club-ga-bar"
                            title={`Goals ${intGoalsSharePct}% · Assists ${100 - intGoalsSharePct}%`}
                          >
                            <div
                              className="stats-club-ga-bar-g"
                              style={{ width: `${intGoalsSharePct}%` }}
                            />
                            <div
                              className="stats-club-ga-bar-a"
                              style={{ width: `${100 - intGoalsSharePct}%` }}
                            />
                          </div>
                          <span className="stats-club-perf-hint">
                            {intGoalsSharePct}% goals · {100 - intGoalsSharePct}
                            % assists
                          </span>
                        </div>
                      </div>
                    </div>

                    <aside
                      className="stats-int-trophy-panel"
                      aria-labelledby="int-trophy-heading"
                    >
                      <div className="stats-club-trophy-panel-head">
                        <h3
                          id="int-trophy-heading"
                          className="stats-club-trophy-title"
                        >
                          International honours
                        </h3>
                        <span className="stats-club-trophy-total-badge">
                          {api.intTrophies.length}
                        </span>
                      </div>
                      <p className="stats-club-trophy-desc muted-text">
                        Titles won with the national team.
                      </p>
                      {intTrophyBreakdown.length > 0 ? (
                        <ul className="stats-club-trophy-list">
                          {intTrophyBreakdown.map(([trophyId, count]) => {
                            const logo = getTrophyLogo(trophyId);
                            const name =
                              INT_TROPHY_LABELS[trophyId] ?? trophyId;
                            return (
                              <li
                                key={trophyId}
                                className="stats-club-trophy-row"
                              >
                                {logo ? (
                                  <img
                                    src={logo}
                                    alt=""
                                    className="stats-club-trophy-img"
                                  />
                                ) : (
                                  <span
                                    className="stats-club-trophy-fallback"
                                    aria-hidden
                                  >
                                    {name.slice(0, 2)}
                                  </span>
                                )}
                                <div className="stats-club-trophy-meta">
                                  <span className="stats-club-trophy-name">
                                    {name}
                                  </span>
                                  <span className="stats-club-trophy-count muted-text">
                                    {count}×
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="stats-club-trophy-empty muted-text">
                          No international trophies recorded yet.
                        </p>
                      )}
                    </aside>
                  </div>
                </div>
              </div>
            )}

            {tab === "by-season" && (
              <div className="stats-section stats-section--by-season">
                <div className="stats-season-intro">
                  <h2 className="stats-section-title stats-season-intro-title">
                    By season
                  </h2>
                  <p className="stats-section-sub muted-text stats-season-intro-sub">
                    Season-by-season breakdown by competition — club and
                    international.
                  </p>
                  {api.bySeasonWithBreakdown.length > 0 ? (
                    <div className="stats-season-toolbar">
                      <div className="stats-season-search-wrap">
                        <label
                          htmlFor="stats-season-search"
                          className="stats-season-search-label"
                        >
                          Find a season
                        </label>
                        <div className="stats-season-search-field">
                          <span
                            className="stats-season-search-icon"
                            aria-hidden
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.3-4.3" />
                            </svg>
                          </span>
                          <input
                            id="stats-season-search"
                            type="search"
                            className="stats-season-search-input"
                            placeholder="e.g. 2023/24"
                            value={seasonSearch}
                            onChange={(e) => setSeasonSearch(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                      </div>
                      {seasonQueryNorm ? (
                        <p
                          className="stats-season-search-meta muted-text"
                          role="status"
                        >
                          Showing {bySeasonBreakdownFiltered.length} of{" "}
                          {api.bySeasonWithBreakdown.length} seasons
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {api.bySeasonWithBreakdown.length > 0 ? (
                  <>
                    {bySeasonBreakdownFiltered.length === 0 ? (
                      <p className="stats-empty muted-text" role="status">
                        No seasons match &ldquo;{seasonSearch.trim()}&rdquo;.
                        Clear the search to see all seasons.
                      </p>
                    ) : (
                      <>
                        <div className="stats-tab-visuals stats-charts-stack">
                          <div className="stats-chart-wrap stats-chart-wrap--framed">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart
                                data={bySeasonChartFiltered}
                                margin={{
                                  top: 12,
                                  right: 12,
                                  left: -8,
                                  bottom: 4,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke={theme.grid}
                                  vertical={false}
                                />
                                <XAxis
                                  dataKey="season"
                                  tick={{ fill: theme.axis, fontSize: 10 }}
                                  tickLine={false}
                                  axisLine={{ stroke: theme.grid }}
                                />
                                <YAxis
                                  tick={{ fill: theme.axis, fontSize: 11 }}
                                  tickLine={false}
                                  axisLine={{ stroke: theme.grid }}
                                  allowDecimals={false}
                                />
                                <Tooltip
                                  contentStyle={tooltipStyle}
                                  labelStyle={{ color: theme.axis }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar
                                  dataKey="goals"
                                  name="Goals"
                                  fill={GOALS_COLOR}
                                  radius={[5, 5, 0, 0]}
                                  maxBarSize={40}
                                />
                                <Bar
                                  dataKey="assists"
                                  name="Assists"
                                  fill={ASSISTS_COLOR}
                                  radius={[5, 5, 0, 0]}
                                  maxBarSize={40}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <StatsBySeasonExtraCharts
                            api={api}
                            theme={theme}
                            tooltipStyle={tooltipStyle}
                            bySeasonForCharts={
                              seasonQueryNorm
                                ? bySeasonChartFiltered
                                : undefined
                            }
                          />
                        </div>

                        <div className="stats-tab-data stats-season-breakdown-list">
                          {bySeasonBreakdownFiltered.map((sb) => (
                            <article
                              key={sb.season}
                              className="stats-season-breakdown-card"
                            >
                              <header className="stats-season-breakdown-header">
                                <h3 className="stats-season-breakdown-title">
                                  {sb.season}
                                </h3>
                                <div className="stats-season-breakdown-totals">
                                  <span title="Appearances">
                                    {sb.totalApps} app
                                  </span>
                                  <span className="stats-season-breakdown-g">
                                    {sb.totalGoals} G
                                  </span>
                                  <span className="stats-season-breakdown-a">
                                    {sb.totalAssists} A
                                  </span>
                                  {sb.avgrating != null && (
                                    <span className="stats-season-breakdown-rating">
                                      ★ {sb.avgrating.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </header>

                              <div className="stats-season-breakdown-body">
                                {sb.clubRows.length > 0 && (
                                  <section className="stats-season-breakdown-block">
                                    <h4 className="stats-season-breakdown-subtitle">
                                      {uclLogo && (
                                        <img
                                          src={uclLogo}
                                          alt=""
                                          className="stats-season-breakdown-subtitle-icon"
                                        />
                                      )}
                                      Club
                                    </h4>
                                    <ul className="stats-season-breakdown-rows">
                                      {sb.clubRows.map((row, i) => {
                                        const compLogo = getCompetitionLogo(
                                          row.competition,
                                        );
                                        const compLabel =
                                          COMPETITION_LABELS[row.competition] ??
                                          row.competition;
                                        const teamImg = row.team
                                          ? TEAM_IMAGES[row.team]
                                          : null;
                                        const teamLabel = row.team
                                          ? (TEAM_LABELS[row.team] ?? row.team)
                                          : null;
                                        return (
                                          <li
                                            key={`${row.competition}-${row.team ?? ""}-${i}`}
                                            className="stats-season-breakdown-row"
                                          >
                                            <div className="stats-season-breakdown-logos">
                                              {compLogo ? (
                                                <img
                                                  src={compLogo}
                                                  alt=""
                                                  className="stats-season-breakdown-logo"
                                                />
                                              ) : (
                                                <span className="stats-season-breakdown-fallback">
                                                  {compLabel.slice(0, 2)}
                                                </span>
                                              )}
                                              {teamImg && (
                                                <img
                                                  src={teamImg}
                                                  alt=""
                                                  className="stats-season-breakdown-team-img"
                                                  title={teamLabel ?? ""}
                                                />
                                              )}
                                            </div>
                                            <div className="stats-season-breakdown-row-meta">
                                              <span className="stats-season-breakdown-row-name">
                                                {compLabel}
                                              </span>
                                              {teamLabel && (
                                                <span className="stats-season-breakdown-row-team">
                                                  {teamLabel}
                                                </span>
                                              )}
                                            </div>
                                            <div className="stats-season-breakdown-row-stats">
                                              <span className="stats-season-breakdown-stat">
                                                {row.apps} app
                                              </span>
                                              <span className="stats-season-breakdown-stat stats-season-breakdown-g">
                                                {row.goals} G
                                              </span>
                                              <span className="stats-season-breakdown-stat stats-season-breakdown-a">
                                                {row.assists} A
                                              </span>
                                              {row.avgrating != null && (
                                                <span className="stats-season-breakdown-stat stats-season-breakdown-rating">
                                                  ★ {row.avgrating.toFixed(2)}
                                                </span>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </section>
                                )}

                                {sb.intRows.length > 0 && (
                                  <section className="stats-season-breakdown-block">
                                    <h4 className="stats-season-breakdown-subtitle">
                                      {euroLogo && (
                                        <img
                                          src={euroLogo}
                                          alt=""
                                          className="stats-season-breakdown-subtitle-icon"
                                        />
                                      )}
                                      International
                                    </h4>
                                    <ul className="stats-season-breakdown-rows">
                                      {sb.intRows.map((row, i) => {
                                        const compLogo = getCompetitionLogo(
                                          row.competition,
                                        );
                                        const compLabel =
                                          COMPETITION_LABELS[row.competition] ??
                                          row.competition;
                                        const nationImg = getNationImage(
                                          STATIC_PLAYER_PROFILE.nationality,
                                        );
                                        return (
                                          <li
                                            key={`${row.competition}-${i}`}
                                            className="stats-season-breakdown-row"
                                          >
                                            <div className="stats-season-breakdown-logos">
                                              {compLogo ? (
                                                <img
                                                  src={compLogo}
                                                  alt=""
                                                  className="stats-season-breakdown-logo"
                                                />
                                              ) : (
                                                <span className="stats-season-breakdown-fallback">
                                                  {compLabel.slice(0, 2)}
                                                </span>
                                              )}
                                              {nationImg && (
                                                <img
                                                  src={nationImg}
                                                  alt=""
                                                  className="stats-season-breakdown-nation-img"
                                                  title={
                                                    STATIC_PLAYER_PROFILE.nationality
                                                  }
                                                />
                                              )}
                                            </div>
                                            <div className="stats-season-breakdown-row-meta">
                                              <span className="stats-season-breakdown-row-name">
                                                {compLabel}
                                              </span>
                                            </div>
                                            <div className="stats-season-breakdown-row-stats">
                                              <span className="stats-season-breakdown-stat">
                                                {row.apps} app
                                              </span>
                                              <span className="stats-season-breakdown-stat stats-season-breakdown-g">
                                                {row.goals} G
                                              </span>
                                              <span className="stats-season-breakdown-stat stats-season-breakdown-a">
                                                {row.assists} A
                                              </span>
                                              {row.avgrating != null && (
                                                <span className="stats-season-breakdown-stat stats-season-breakdown-rating">
                                                  ★ {row.avgrating.toFixed(2)}
                                                </span>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </section>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="stats-empty muted-text">No season data yet.</p>
                )}
              </div>
            )}

            {tab === "by-year" && (
              <div className="stats-section">
                <h2 className="stats-section-title">By calendar year</h2>
                <p className="stats-section-sub muted-text">
                  Yearly totals (from Yearly data).
                </p>
                {api.byYear.length > 0 ? (
                  <>
                    <div className="stats-tab-visuals stats-charts-stack">
                      <div className="stats-chart-wrap stats-chart-wrap--framed">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={api.byYear}
                            margin={{ top: 12, right: 12, left: -8, bottom: 4 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={theme.grid}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="year"
                              tick={{ fill: theme.axis, fontSize: 11 }}
                              tickLine={false}
                              axisLine={{ stroke: theme.grid }}
                            />
                            <YAxis
                              tick={{ fill: theme.axis, fontSize: 11 }}
                              tickLine={false}
                              axisLine={{ stroke: theme.grid }}
                              allowDecimals={false}
                            />
                            <Tooltip
                              contentStyle={tooltipStyle}
                              labelStyle={{ color: theme.axis }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line
                              type="monotone"
                              dataKey="goals"
                              name="Goals"
                              stroke={GOALS_COLOR}
                              strokeWidth={2.5}
                              dot={{ fill: GOALS_COLOR, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="assists"
                              name="Assists"
                              stroke={ASSISTS_COLOR}
                              strokeWidth={2.5}
                              dot={{ fill: ASSISTS_COLOR, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <StatsByYearExtraCharts
                        api={api}
                        theme={theme}
                        tooltipStyle={tooltipStyle}
                      />
                    </div>

                    <div className="stats-tab-data">
                      <div className="stats-year-grid">
                        {api.byYear.map((row) => (
                          <div key={row.year} className="stats-year-card">
                            <span className="stats-year-label">{row.year}</span>
                            <div className="stats-year-nums">
                              <span className="stats-year-line">
                                <span className="stats-year-pill stats-year-pill--g">
                                  {row.goals} G
                                </span>
                                <span className="stats-year-pill stats-year-pill--a">
                                  {row.assists} A
                                </span>
                              </span>
                              <span className="stats-year-ga">
                                {row.goals + row.assists} combined
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="stats-empty muted-text">No yearly data yet.</p>
                )}
              </div>
            )}

            {tab === "best" && (
              <div className="stats-section">
                <h2 className="stats-section-title">Best performances</h2>
                <p className="stats-section-sub muted-text">
                  Career highs by season, competition, and calendar year (from
                  Yearly data).
                </p>

                <div className="stats-tab-visuals">
                  <StatsBestCharts
                    api={api}
                    theme={theme}
                    tooltipStyle={tooltipStyle}
                  />
                </div>

                {(api.best.bestSeasonGoals ||
                  api.best.bestSeasonAssists ||
                  api.best.bestSeasonTotal ||
                  api.best.bestCompGoals?.comp ||
                  api.best.bestCompAssists?.comp ||
                  api.best.bestYearGoals ||
                  api.best.bestYearAssists ||
                  api.best.bestYearTotal) && (
                  <div className="stats-tab-data">
                    {(api.best.bestSeasonGoals ||
                      api.best.bestSeasonAssists ||
                      api.best.bestSeasonTotal) && (
                      <>
                        <h3 className="stats-best-group-title">Season</h3>
                        <div className="stats-best-grid">
                          {api.best.bestSeasonGoals && (
                            <div className="stats-best-card stats-best-card--goals">
                              <span className="stats-best-icon">
                                <IconGoals width={32} height={32} />
                              </span>
                              <span className="stats-best-label">
                                Most goals (season)
                              </span>
                              <span className="stats-best-value">
                                {api.best.bestSeasonGoals.goals}
                              </span>
                              <span className="stats-best-meta">
                                {api.best.bestSeasonGoals.season}
                              </span>
                            </div>
                          )}
                          {api.best.bestSeasonAssists && (
                            <div className="stats-best-card stats-best-card--assists">
                              <span className="stats-best-icon">
                                <IconAssists width={32} height={32} />
                              </span>
                              <span className="stats-best-label">
                                Most assists (season)
                              </span>
                              <span className="stats-best-value">
                                {api.best.bestSeasonAssists.assists}
                              </span>
                              <span className="stats-best-meta">
                                {api.best.bestSeasonAssists.season}
                              </span>
                            </div>
                          )}
                          {api.best.bestSeasonTotal && (
                            <div className="stats-best-card stats-best-card--ga">
                              <span className="stats-best-icon">
                                <IconGoalInvolvements width={32} height={32} />
                              </span>
                              <span className="stats-best-label">
                                Best G+A (season)
                              </span>
                              <span className="stats-best-value">
                                {api.best.bestSeasonTotal.goals +
                                  api.best.bestSeasonTotal.assists}
                              </span>
                              <span className="stats-best-meta">
                                {api.best.bestSeasonTotal.season} ·{" "}
                                {api.best.bestSeasonTotal.goals}G +{" "}
                                {api.best.bestSeasonTotal.assists}A
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {(api.best.bestCompGoals?.comp ||
                      api.best.bestCompAssists?.comp) && (
                      <>
                        <h3 className="stats-best-group-title">
                          Single competition
                        </h3>
                        <div className="stats-best-grid">
                          {api.best.bestCompGoals &&
                            api.best.bestCompGoals.comp && (
                              <div className="stats-best-card stats-best-card--goals">
                                <span className="stats-best-icon">
                                  <IconGoals width={32} height={32} />
                                </span>
                                <span className="stats-best-label">
                                  Most goals (one competition)
                                </span>
                                <span className="stats-best-value">
                                  {api.best.bestCompGoals.goals}
                                </span>
                                <span className="stats-best-meta">
                                  {COMPETITION_LABELS[
                                    api.best.bestCompGoals.comp
                                  ] ?? api.best.bestCompGoals.comp}
                                </span>
                              </div>
                            )}
                          {api.best.bestCompAssists &&
                            api.best.bestCompAssists.comp && (
                              <div className="stats-best-card stats-best-card--assists">
                                <span className="stats-best-icon">
                                  <IconAssists width={32} height={32} />
                                </span>
                                <span className="stats-best-label">
                                  Most assists (one competition)
                                </span>
                                <span className="stats-best-value">
                                  {api.best.bestCompAssists.assists}
                                </span>
                                <span className="stats-best-meta">
                                  {COMPETITION_LABELS[
                                    api.best.bestCompAssists.comp
                                  ] ?? api.best.bestCompAssists.comp}
                                </span>
                              </div>
                            )}
                        </div>
                      </>
                    )}

                    {(api.best.bestYearGoals ||
                      api.best.bestYearAssists ||
                      api.best.bestYearTotal) && (
                      <>
                        <h3 className="stats-best-group-title stats-best-group-title--year">
                          <IconYearly
                            width={22}
                            height={22}
                            className="stats-best-group-icon"
                            aria-hidden
                          />
                          Calendar year
                        </h3>
                        <p className="stats-best-group-desc muted-text">
                          Totals from your Yearly data page (Jan–Dec).
                        </p>
                        <div className="stats-best-grid">
                          {api.best.bestYearGoals && (
                            <div className="stats-best-card stats-best-card--goals stats-best-card--year">
                              <span className="stats-best-icon">
                                <IconGoals width={32} height={32} />
                              </span>
                              <span className="stats-best-label">
                                Most goals (year)
                              </span>
                              <span className="stats-best-value">
                                {api.best.bestYearGoals.goals}
                              </span>
                              <span className="stats-best-meta">
                                {api.best.bestYearGoals.year}
                              </span>
                            </div>
                          )}
                          {api.best.bestYearAssists && (
                            <div className="stats-best-card stats-best-card--assists stats-best-card--year">
                              <span className="stats-best-icon">
                                <IconAssists width={32} height={32} />
                              </span>
                              <span className="stats-best-label">
                                Most assists (year)
                              </span>
                              <span className="stats-best-value">
                                {api.best.bestYearAssists.assists}
                              </span>
                              <span className="stats-best-meta">
                                {api.best.bestYearAssists.year}
                              </span>
                            </div>
                          )}
                          {api.best.bestYearTotal && (
                            <div className="stats-best-card stats-best-card--ga stats-best-card--year">
                              <span className="stats-best-icon">
                                <IconGoalInvolvements width={32} height={32} />
                              </span>
                              <span className="stats-best-label">
                                Best G+A (year)
                              </span>
                              <span className="stats-best-value">
                                {api.best.bestYearTotal.goals +
                                  api.best.bestYearTotal.assists}
                              </span>
                              <span className="stats-best-meta">
                                {api.best.bestYearTotal.year} ·{" "}
                                {api.best.bestYearTotal.goals}G +{" "}
                                {api.best.bestYearTotal.assists}A
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!api.best.bestSeasonGoals &&
                  !api.best.bestSeasonAssists &&
                  !api.best.bestSeasonTotal &&
                  !api.best.bestCompGoals?.comp &&
                  !api.best.bestCompAssists?.comp &&
                  !api.best.bestYearGoals &&
                  !api.best.bestYearAssists &&
                  !api.best.bestYearTotal && (
                    <p className="stats-empty muted-text">
                      No data for best performances yet.
                    </p>
                  )}
              </div>
            )}

            {tab === "by-competition" && (
              <div className="stats-section">
                <h2 className="stats-section-title">By competition</h2>
                <p className="stats-section-sub muted-text">
                  Every competition you&apos;ve recorded — club and
                  international.
                </p>
                {api.byCompetition.length > 0 ? (
                  <>
                    <div className="stats-tab-visuals">
                      <StatsCompetitionCharts
                        api={api}
                        theme={theme}
                        tooltipStyle={tooltipStyle}
                      />
                    </div>

                    <div className="stats-tab-data">
                      <div className="stats-comp-grid">
                        {api.byCompetition.map((row, idx) => {
                          const logo = getCompetitionLogo(row.competition);
                          const label =
                            COMPETITION_LABELS[row.competition] ??
                            row.competition;
                          const ga = row.goals + row.assists;
                          const perApp = row.apps > 0 ? ga / row.apps : 0;
                          const rank = idx + 1;
                          return (
                            <div
                              key={row.competition}
                              className="stats-comp-card"
                            >
                              <div className="stats-comp-card-top">
                                {logo ? (
                                  <img
                                    src={logo}
                                    alt=""
                                    className="stats-comp-card-img"
                                  />
                                ) : (
                                  <div className="stats-comp-card-fallback">
                                    {label.slice(0, 2)}
                                  </div>
                                )}
                                <div className="stats-comp-card-titles">
                                  <span className="stats-comp-card-name">
                                    {label}
                                  </span>
                                </div>
                                <span
                                  className="stats-comp-rank"
                                  aria-label={`Rank ${rank} by total G+A`}
                                >
                                  {rank}
                                </span>
                              </div>
                              <div className="stats-comp-card-metrics">
                                <div>
                                  <span className="stats-comp-metric-val">
                                    {row.apps}
                                  </span>
                                  <span className="stats-comp-metric-lbl">
                                    Apps
                                  </span>
                                </div>
                                <div>
                                  <span className="stats-comp-metric-val stats-comp-metric-val--g">
                                    {row.goals}
                                  </span>
                                  <span className="stats-comp-metric-lbl">
                                    Goals
                                  </span>
                                </div>
                                <div>
                                  <span className="stats-comp-metric-val stats-comp-metric-val--a">
                                    {row.assists}
                                  </span>
                                  <span className="stats-comp-metric-lbl">
                                    Assists
                                  </span>
                                </div>
                                <div>
                                  <span className="stats-comp-metric-val">
                                    {row.avgrating != null
                                      ? row.avgrating.toFixed(2)
                                      : "—"}
                                  </span>
                                  <span className="stats-comp-metric-lbl">
                                    Avg
                                  </span>
                                </div>
                              </div>
                              <div className="stats-comp-card-footer">
                                <span>G+A / app: {fmt(perApp)}</span>
                                <span className="stats-comp-total-ga">
                                  Total G+A: {ga}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="stats-empty muted-text">
                    No competition data yet.
                  </p>
                )}
              </div>
            )}

            {tab === "by-team" && (
              <div className="stats-section">
                <h2 className="stats-section-title">By team</h2>
                <p className="stats-section-sub muted-text">
                  Club career split by each team with competition breakdown.
                </p>
                {api.byTeam.length > 0 ? (
                  <>
                    <div className="stats-tab-visuals">
                      <StatsTeamCharts
                        api={api}
                        theme={theme}
                        tooltipStyle={tooltipStyle}
                      />
                    </div>

                    <div className="stats-tab-data">
                      <div className="stats-team-grid">
                        {api.byTeam.map((row) => {
                          const img = TEAM_IMAGES[row.team];
                          const label = TEAM_LABELS[row.team] ?? row.team;
                          const ga = row.goals + row.assists;
                          return (
                            <div key={row.team} className="stats-team-card">
                              <header className="stats-team-header">
                                <div className="stats-team-header-badge">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt=""
                                      className="stats-team-crest"
                                    />
                                  ) : (
                                    <div className="stats-team-crest-fallback">
                                      {label.slice(0, 2)}
                                    </div>
                                  )}
                                  <div className="stats-team-header-info">
                                    <h3 className="stats-team-title">
                                      {label}
                                    </h3>
                                    <p className="stats-team-meta">
                                      {row.apps} apps · {row.goals}G{" "}
                                      {row.assists}A · {ga} G+A
                                      {row.avgrating != null &&
                                        ` · ★ ${row.avgrating.toFixed(2)}`}
                                    </p>
                                  </div>
                                  <div className="stats-team-hero-stat">
                                    <span className="stats-team-hero-val">
                                      {ga}
                                    </span>
                                    <span className="stats-team-hero-lbl">
                                      G+A
                                    </span>
                                  </div>
                                </div>
                              </header>
                              {row.breakdown.length > 0 && (
                                <div className="stats-team-body">
                                  <table className="stats-team-table">
                                    <thead>
                                      <tr>
                                        <th>Competition</th>
                                        <th className="stats-team-num">Apps</th>
                                        <th className="stats-team-num">G</th>
                                        <th className="stats-team-num">A</th>
                                        <th className="stats-team-num">G+A</th>
                                        <th className="stats-team-num">Avg</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {row.breakdown.map((b) => {
                                        const compLogo = getCompetitionLogo(
                                          b.competition,
                                        );
                                        const compLabel =
                                          COMPETITION_LABELS[b.competition] ??
                                          b.competition;
                                        const bGa = b.goals + b.assists;
                                        return (
                                          <tr key={b.competition}>
                                            <td>
                                              <span className="stats-team-comp-cell">
                                                {compLogo ? (
                                                  <img
                                                    src={compLogo}
                                                    alt=""
                                                    className="stats-team-comp-icon"
                                                  />
                                                ) : (
                                                  <span className="stats-team-comp-init">
                                                    {compLabel.slice(0, 2)}
                                                  </span>
                                                )}
                                                {compLabel}
                                              </span>
                                            </td>
                                            <td className="stats-team-num">
                                              {b.apps}
                                            </td>
                                            <td className="stats-team-num stats-team-num--g">
                                              {b.goals}
                                            </td>
                                            <td className="stats-team-num stats-team-num--a">
                                              {b.assists}
                                            </td>
                                            <td className="stats-team-num stats-team-num--ga">
                                              {bGa}
                                            </td>
                                            <td className="stats-team-num">
                                              {b.avgrating != null
                                                ? b.avgrating.toFixed(2)
                                                : "—"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="stats-empty muted-text">No team data yet.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
