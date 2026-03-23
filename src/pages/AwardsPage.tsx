import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AwardsAnalyticsCharts,
  AwardsTripleSpotlight,
} from "../components/awards/AwardsPageVisuals";
import { STATIC_PLAYER_PROFILE } from "../config/dashboardStatic";
import { TEAM_LABELS } from "../config/seasonDataConfig";
import { getNationImage, TEAM_IMAGES } from "../config/seasonAssets";
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
      style={{ "--reveal-i": index } as React.CSSProperties}
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
          {items.map((it) => (
            <li key={it.award} className="aw-tl-pill">
              <span className="aw-tl-pill-name">{it.award}</span>
              {it.qty > 1 && <span className="aw-tl-pill-qty">×{it.qty}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AwardsPage() {
  const api = useAwardsPageApi();

  const totalQty = useMemo(
    () => totalAwardQty(api.awards),
    [api.awards],
  );

  const bySeason = useMemo(() => buildBySeason(api.awards), [api.awards]);
  const hasAny = totalQty > 0;

  if (api.error) {
    return (
      <section className="dash-view trophy-cabinet awards-page">
        <header className="trophy-cab-header">
          <span className="trophy-cab-eyebrow">Career</span>
          <h1 className="trophy-cab-title">Awards</h1>
          <p className="trophy-cab-desc">
            Individual honours across your career.
          </p>
        </header>
        <div className="trophy-cab-alert" role="alert">
          {api.error}
        </div>
      </section>
    );
  }

  return (
    <section className="dash-view trophy-cabinet awards-page">
      <header className="trophy-cab-header">
        <span className="trophy-cab-eyebrow">Career</span>
        <h1 className="trophy-cab-title">Awards</h1>
        <p className="trophy-cab-desc">
          Ballon d&apos;Or, Golden Boot, FIFA Best, and every other individual
          honour logged across your career.
        </p>
      </header>

      {api.loading ? (
        <p className="trophy-cab-loading muted-text">Loading awards…</p>
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
