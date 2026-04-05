import { useMemo, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AwardsAnalyticsCharts,
  AwardsTripleSpotlight,
} from "../components/awards/AwardsPageVisuals";
import { STATIC_PLAYER_PROFILE } from "../config/dashboardStatic";
import { TEAM_LABELS } from "../config/seasonDataConfig";
import {
  AWARD_LOGO_KINDS,
  getAwardImage,
  getNationImage,
  TEAM_IMAGES,
} from "../config/seasonAssets";
import { useAwardsPageApi } from "../hooks/useAwardsPageApi";
import type { AwardRow, SeasonDataRow } from "../types/dashboard";

function rowQty(r: AwardRow): number {
  const q = Number(r.quantity);
  return q > 0 ? q : 1;
}

function resolveTeamForSeason(
  season: string,
  seasonData: SeasonDataRow[],
): string | undefined {
  const counts = new Map<string, number>();
  for (const r of seasonData) {
    if (String(r.season ?? "").trim() !== season) continue;
    const t = String(r.team ?? "").trim();
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestN = 0;
  for (const [k, v] of counts) {
    if (v > bestN) {
      best = k;
      bestN = v;
    }
  }
  return best;
}

type SeasonAwardLine = { award: string; qty: number };

function buildBySeason(
  rows: AwardRow[],
): { season: string; items: SeasonAwardLine[] }[] {
  const bySeason = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const s = String(r.season ?? "").trim();
    const name = String(r.award ?? "").trim();
    if (!s || !name) continue;
    const q = rowQty(r);
    if (!bySeason.has(s)) bySeason.set(s, new Map());
    const m = bySeason.get(s)!;
    m.set(name, (m.get(name) ?? 0) + q);
  }
  return [...bySeason.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([season, m]) => ({
      season,
      items: [...m.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([award, qty]) => ({ award, qty })),
    }));
}

function totalAwardQty(rows: AwardRow[]): number {
  let totalQty = 0;
  for (const r of rows) {
    const name = String(r.award ?? "").trim();
    if (!name) continue;
    totalQty += rowQty(r);
  }
  return totalQty;
}

function uniqueAwardTypes(rows: AwardRow[]): number {
  const names = new Set<string>();
  for (const r of rows) {
    const n = String(r.award ?? "").trim();
    if (n) names.add(n);
  }
  return names.size;
}

function busiestSeasonLabel(
  blocks: { season: string; items: SeasonAwardLine[] }[],
): string | undefined {
  let bestSeason: string | undefined;
  let bestN = 0;
  for (const b of blocks) {
    const n = b.items.reduce((s, x) => s + x.qty, 0);
    if (n > bestN) {
      bestN = n;
      bestSeason = b.season;
    }
  }
  return bestSeason;
}

function AwardsHeroDeco() {
  return (
    <svg className="ph-deco" aria-hidden viewBox="0 0 200 140" fill="none">
      <circle cx="100" cy="65" r="50" fill="currentColor" fillOpacity="0.08" />
      <circle cx="100" cy="65" r="32" fill="currentColor" fillOpacity="0.1" />
      <circle cx="100" cy="65" r="16" fill="currentColor" fillOpacity="0.15" />
      <circle cx="100" cy="18" r="6" fill="currentColor" fillOpacity="0.4" />
      <circle cx="145" cy="38" r="5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="155" cy="88" r="6" fill="currentColor" fillOpacity="0.35" />
      <circle cx="116" cy="116" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="62" cy="112" r="5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="46" cy="68" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="57" cy="28" r="5" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

function AwardsPageHeader({
  description,
  totalQty,
  totalPending,
}: {
  description: ReactNode;
  totalQty: number;
  totalPending?: boolean;
}) {
  return (
    <header className="ph ph--awards">
      <div className="ph-glow" aria-hidden />
      <div className="ph-inner">
        <div className="ph-text">
          <p className="ph-kicker">
            <span className="ph-kicker-dot" aria-hidden />
            Individual Honours
          </p>
          <h1 className="ph-title">Awards</h1>
          <p className="ph-desc">{description}</p>
        </div>
        <AwardsHeroDeco />
      </div>

      <div className="ph-awards-logos" aria-hidden>
        {AWARD_LOGO_KINDS.map((k) => (
          <div key={k.id} className="ph-awards-logo-item">
            <img src={k.image} alt="" className="ph-awards-logo-img" />
            <span className="ph-awards-logo-lbl">{k.label}</span>
          </div>
        ))}
        <div className="ph-awards-total">
          {totalPending ? (
            <span className="ph-awards-total-skel dash-skeleton" aria-hidden />
          ) : (
            <span className="ph-awards-total-n">{totalQty}</span>
          )}
          <span className="ph-awards-total-l">total awards</span>
        </div>
      </div>
    </header>
  );
}

function AwardsPageLoadingBody() {
  return (
    <div className="awards-page-skeleton" aria-busy="true" aria-label="Loading">
      <div className="awards-page-skeleton-spotlight">
        {[0, 1, 2].map((i) => (
          <div key={i} className="awards-page-skeleton-card">
            <div className="awards-page-skeleton-logo dash-skeleton" />
            <div className="awards-page-skeleton-line awards-page-skeleton-line--lg dash-skeleton" />
            <div className="awards-page-skeleton-line dash-skeleton" />
          </div>
        ))}
      </div>
      <div className="awards-page-skeleton-section-title dash-skeleton" />
      <div className="awards-page-skeleton-charts">
        <div className="awards-page-skeleton-chart dash-skeleton" />
        <div className="awards-page-skeleton-chart-row">
          <div className="awards-page-skeleton-chart dash-skeleton" />
          <div className="awards-page-skeleton-chart dash-skeleton" />
        </div>
      </div>
    </div>
  );
}

function TimelineNode({
  season,
  items,
  teamId,
  isLast,
  index,
}: {
  season: string;
  items: SeasonAwardLine[];
  teamId: string | undefined;
  isLast: boolean;
  index: number;
}) {
  const crestUrl = teamId ? TEAM_IMAGES[teamId] : undefined;
  const teamLabel = teamId ? (TEAM_LABELS[teamId] ?? teamId) : undefined;
  const nationUrl = getNationImage(STATIC_PLAYER_PROFILE.nationality);

  return (
    <div
      className={`aw-tl-node ${isLast ? "aw-tl-node--last" : ""}`}
      style={{ "--reveal-i": index } as CSSProperties}
    >
      <div className="aw-tl-rail" aria-hidden>
        <div className="aw-tl-dot" />
        {!isLast && <div className="aw-tl-line" />}
      </div>
      <div className="aw-tl-content">
        <div className="aw-tl-header">
          <span className="aw-tl-season">{season}</span>
          {(crestUrl || nationUrl) && (
            <img
              src={crestUrl ?? nationUrl}
              alt=""
              className={`aw-tl-crest${!crestUrl ? " aw-tl-crest--flag" : ""}`}
              title={teamLabel ?? STATIC_PLAYER_PROFILE.nationality}
            />
          )}
          {teamLabel && (
            <span className="aw-tl-club muted-text">{teamLabel}</span>
          )}
        </div>
        <ul className="aw-tl-pills" aria-label="Awards this season">
          {items.map((it) => {
            const awardImg = getAwardImage(it.award);
            return (
              <li
                key={it.award}
                className={`aw-tl-pill${awardImg ? " aw-tl-pill--icon" : ""}`}
              >
                {awardImg && (
                  <img
                    src={awardImg}
                    alt=""
                    className="aw-tl-pill-icon"
                    width={22}
                    height={22}
                  />
                )}
                <span className="aw-tl-pill-name">{it.award}</span>
                {it.qty > 1 && (
                  <span className="aw-tl-pill-qty">×{it.qty}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function AwardsPage() {
  const api = useAwardsPageApi();

  const totalQty = useMemo(() => totalAwardQty(api.awards), [api.awards]);

  const bySeason = useMemo(() => buildBySeason(api.awards), [api.awards]);
  const hasAny = totalQty > 0;

  const distinctTypes = useMemo(
    () => uniqueAwardTypes(api.awards),
    [api.awards],
  );
  const peakSeason = useMemo(() => busiestSeasonLabel(bySeason), [bySeason]);

  if (api.error) {
    return (
      <section className="dash-view trophy-cabinet awards-page">
        <AwardsPageHeader
          description="Individual honours across your career."
          totalQty={0}
        />
        <div className="trophy-cab-alert" role="alert">
          {api.error}
        </div>
      </section>
    );
  }

  return (
    <section
      className="dash-view trophy-cabinet awards-page"
      aria-busy={api.loading}
    >
      <AwardsPageHeader
        description={
          <>
            Ballon d&apos;Or, Golden Boot, FIFA Best, and every other individual
            honour logged across your career.
          </>
        }
        totalQty={totalQty}
        totalPending={api.loading}
      />

      {api.loading ? (
        <AwardsPageLoadingBody />
      ) : (
        <>
          {!hasAny ? (
            <div className="trophy-cab-zero">
              <p className="trophy-cab-zero-title">No awards yet</p>
              <p className="trophy-cab-zero-text muted-text">
                Add awards when you save a season in{" "}
                <Link to="/season-data" className="trophy-cab-link">
                  Season data
                </Link>
                . They&apos;ll appear here with charts and a full career
                timeline.
              </p>
            </div>
          ) : (
            <>
              <AwardsTripleSpotlight rows={api.awards} />
              <div
                className="awards-quick-stats"
                aria-label="Career awards summary"
              >
                <div className="awards-quick-stat">
                  <span className="awards-quick-stat-n">{distinctTypes}</span>
                  <span className="awards-quick-stat-l">
                    distinct honour{distinctTypes === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="awards-quick-stat">
                  <span className="awards-quick-stat-n">{bySeason.length}</span>
                  <span className="awards-quick-stat-l">
                    season{bySeason.length === 1 ? "" : "s"} with awards
                  </span>
                </div>
                <div className="awards-quick-stat">
                  <span className="awards-quick-stat-n awards-quick-stat-n--text">
                    {peakSeason ?? "—"}
                  </span>
                  <span className="awards-quick-stat-l">busiest season</span>
                </div>
              </div>
              <AwardsAnalyticsCharts rows={api.awards} />

              {bySeason.length > 0 && (
                <section
                  className="awards-section"
                  aria-labelledby="aw-timeline-heading"
                >
                  <div className="awards-section-head">
                    <h2
                      id="aw-timeline-heading"
                      className="awards-section-title"
                    >
                      Career timeline
                    </h2>
                    <p className="awards-section-desc muted-text">
                      Every honour, newest season first.
                    </p>
                  </div>
                  <div className="aw-timeline">
                    {bySeason.map((block, i) => (
                      <TimelineNode
                        key={block.season}
                        season={block.season}
                        items={block.items}
                        teamId={resolveTeamForSeason(
                          block.season,
                          api.seasonData,
                        )}
                        isLast={i === bySeason.length - 1}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
