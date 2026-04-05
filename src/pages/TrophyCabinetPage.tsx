import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  EmptyTrophyCabinetIllustration,
  TrophyPhysicalCabinet,
} from "../components/TrophyPhysicalCabinet";
import {
  IconTrophyClub,
  IconTrophyIntl,
} from "../components/dashboard/AchievementIcons";
import { STATIC_PLAYER_PROFILE } from "../config/dashboardStatic";
import {
  CLUB_TROPHY_LABEL,
  INT_TROPHIES,
  TEAM_LABELS,
} from "../config/seasonDataConfig";
import {
  getNationImage,
  getTrophyLogo,
  TEAM_IMAGES,
} from "../config/seasonAssets";
import { useSimultaneousCountUp } from "../hooks/useSimultaneousCountUp";
import { useTrophyCabinetApi } from "../hooks/useTrophyCabinetApi";
import type { SeasonDataRow, TrophyRow } from "../types/dashboard";

const INT_TROPHY_LABEL: Record<string, string> = Object.fromEntries(
  INT_TROPHIES.map((t) => [t.id, t.label]),
);

function groupRowsByCompetition(rows: TrophyRow[]): [string, TrophyRow[]][] {
  const m = new Map<string, TrophyRow[]>();
  for (const r of rows) {
    const id = String(r.competition ?? "").trim();
    if (!id) continue;
    const a = m.get(id) ?? [];
    a.push(r);
    m.set(id, a);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) =>
      String(b.season ?? "").localeCompare(String(a.season ?? "")),
    );
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
}

type TrophyWinEntry = {
  trophyId: string;
  count: number;
  scope: "club" | "int";
};

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

function buildSeasonSummaries(
  club: TrophyRow[],
  int: TrophyRow[],
  seasonData: SeasonDataRow[],
): {
  season: string;
  teamId: string | undefined;
  wins: TrophyWinEntry[];
}[] {
  const seasonMap = new Map<
    string,
    { club: Map<string, number>; int: Map<string, number> }
  >();

  function bump(t: TrophyRow, scope: "club" | "int") {
    const s = String(t.season ?? "").trim();
    if (!s) return;
    const id = String(t.competition ?? "").trim();
    if (!id) return;
    if (!seasonMap.has(s)) {
      seasonMap.set(s, { club: new Map(), int: new Map() });
    }
    const m = seasonMap.get(s)!;
    const bucket = scope === "club" ? m.club : m.int;
    bucket.set(id, (bucket.get(id) ?? 0) + 1);
  }
  for (const r of club) bump(r, "club");
  for (const r of int) bump(r, "int");

  const seasons = [...seasonMap.keys()].sort((a, b) => b.localeCompare(a));

  return seasons.map((season) => {
    const m = seasonMap.get(season)!;
    const wins: TrophyWinEntry[] = [];
    for (const [trophyId, count] of m.club) {
      wins.push({ trophyId, count, scope: "club" });
    }
    for (const [trophyId, count] of m.int) {
      wins.push({ trophyId, count, scope: "int" });
    }
    wins.sort((a, b) => {
      if (a.scope !== b.scope) return a.scope === "club" ? -1 : 1;
      const la =
        a.scope === "club"
          ? (CLUB_TROPHY_LABEL[a.trophyId] ?? a.trophyId)
          : (INT_TROPHY_LABEL[a.trophyId] ?? a.trophyId);
      const lb =
        b.scope === "club"
          ? (CLUB_TROPHY_LABEL[b.trophyId] ?? b.trophyId)
          : (INT_TROPHY_LABEL[b.trophyId] ?? b.trophyId);
      return la.localeCompare(lb);
    });
    const teamId = resolveTeamForSeason(season, seasonData);
    return { season, teamId, wins };
  });
}

const DIGEST_COUNT_MS = 2500;

function TrophyDigest({
  club,
  intl,
  total,
}: {
  club: number;
  intl: number;
  total: number;
}) {
  const [clubN, intlN, totalN] = useSimultaneousCountUp(
    club,
    intl,
    total,
    DIGEST_COUNT_MS,
  );

  return (
    <div className="tcab-digest" aria-label="Trophy totals">
      <div className="tcab-digest-item" data-accent="club">
        <span className="tcab-digest-val">{clubN.toLocaleString()}</span>
        <span className="tcab-digest-key">Club</span>
        <span className="tcab-digest-hint muted-text">Leagues & cups</span>
      </div>
      <span className="tcab-digest-sep" aria-hidden />
      <div className="tcab-digest-item" data-accent="int">
        <span className="tcab-digest-val">{intlN.toLocaleString()}</span>
        <span className="tcab-digest-key">International</span>
        <span className="tcab-digest-hint muted-text">National team</span>
      </div>
      <span className="tcab-digest-sep" aria-hidden />
      <div className="tcab-digest-item" data-accent="total">
        <span className="tcab-digest-val">{totalN.toLocaleString()}</span>
        <span className="tcab-digest-key">Total</span>
        <span className="tcab-digest-hint muted-text">All honours</span>
      </div>
    </div>
  );
}

function TrophyGroupCard({
  competitionId,
  rows,
  labelFor,
}: {
  competitionId: string;
  rows: TrophyRow[];
  labelFor: (id: string) => string;
}) {
  const logo = getTrophyLogo(competitionId);
  const name = labelFor(competitionId);
  const seasons = [
    ...new Set(rows.map((r) => String(r.season ?? "").trim()).filter(Boolean)),
  ].sort((a, b) => b.localeCompare(a));

  return (
    <article className="tcab-hon">
      <div className="tcab-hon-top">
        {logo ? (
          <img src={logo} alt="" className="tcab-hon-logo" />
        ) : (
          <div className="tcab-hon-logo tcab-hon-logo--empty" aria-hidden>
            {name.slice(0, 2)}
          </div>
        )}
        <div className="tcab-hon-text">
          <h3 className="tcab-hon-name">{name}</h3>
          <p className="tcab-hon-count muted-text">
            {rows.length} {rows.length === 1 ? "title" : "titles"}
          </p>
        </div>
      </div>
      {seasons.length > 0 && (
        <ul className="tcab-hon-years" aria-label="Seasons won">
          {seasons.map((s) => (
            <li key={s} className="tcab-hon-year">
              {s}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function SeasonHonoursCard({
  season,
  teamId,
  wins,
}: {
  season: string;
  teamId: string | undefined;
  wins: TrophyWinEntry[];
}) {
  const hasClubWin = wins.some((w) => w.scope === "club");
  const hasIntWin = wins.some((w) => w.scope === "int");

  const crestUrl = hasClubWin && teamId ? TEAM_IMAGES[teamId] : undefined;
  const teamLabel = teamId ? (TEAM_LABELS[teamId] ?? teamId) : undefined;

  const nationUrl = getNationImage(STATIC_PLAYER_PROFILE.nationality);

  const heroImg = hasClubWin ? crestUrl : nationUrl;
  const heroCaption = hasClubWin
    ? (teamLabel ?? "Club")
    : STATIC_PLAYER_PROFILE.nationality;

  return (
    <article className="tcab-season">
      <div className="tcab-season-layout">
        <div className="tcab-season-side">
          <div className="tcab-season-crest">
            {heroImg ? (
              <img
                src={heroImg}
                alt=""
                className={
                  hasClubWin
                    ? "tcab-season-img"
                    : "tcab-season-img tcab-season-img--flag"
                }
                title={heroCaption}
              />
            ) : (
              <div
                className={`tcab-season-placeholder ${hasClubWin ? "tcab-season-placeholder--club" : "tcab-season-placeholder--int"}`}
                aria-hidden
              >
                {hasClubWin ? (
                  <IconTrophyClub className="tcab-season-ph-icon" />
                ) : (
                  <IconTrophyIntl className="tcab-season-ph-icon" />
                )}
              </div>
            )}
          </div>
          <div className="tcab-season-info">
            <span className="tcab-season-tag">Season</span>
            <p className="tcab-season-year">{season}</p>
            <p className="tcab-season-team muted-text">{heroCaption}</p>
            {hasClubWin && hasIntWin && nationUrl && (
              <p className="tcab-season-note">
                <img
                  src={nationUrl}
                  alt=""
                  width={16}
                  height={16}
                  className="tcab-season-note-flag"
                />
                <span className="muted-text">International titles too</span>
              </p>
            )}
          </div>
        </div>

        <ul className="tcab-tiles" aria-label="Honours this season">
          {wins.map((w) => {
            const logo = getTrophyLogo(w.trophyId);
            const label =
              w.scope === "club"
                ? (CLUB_TROPHY_LABEL[w.trophyId] ?? w.trophyId)
                : (INT_TROPHY_LABEL[w.trophyId] ?? w.trophyId);
            return (
              <li
                key={`${w.scope}-${w.trophyId}`}
                className="tcab-tile"
                data-scope={w.scope}
              >
                <div className="tcab-tile-frame" title={label}>
                  {logo ? (
                    <img src={logo} alt="" className="tcab-tile-img" />
                  ) : (
                    <span className="tcab-tile-mono">{label.slice(0, 2)}</span>
                  )}
                  {w.count > 1 && (
                    <span className="tcab-tile-qty">{w.count}</span>
                  )}
                </div>
                <span className="tcab-tile-label">{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

export default function TrophyCabinetPage() {
  const api = useTrophyCabinetApi();

  const clubGroups = useMemo(
    () => groupRowsByCompetition(api.clubTrophies),
    [api.clubTrophies],
  );
  const intGroups = useMemo(
    () => groupRowsByCompetition(api.intTrophies),
    [api.intTrophies],
  );
  const seasonSummaries = useMemo(
    () =>
      buildSeasonSummaries(api.clubTrophies, api.intTrophies, api.seasonData),
    [api.clubTrophies, api.intTrophies, api.seasonData],
  );

  const total = api.clubTrophies.length + api.intTrophies.length;

  if (api.error) {
    return (
      <section className="dash-view trophy-cabinet trophy-cabinet-page">
        <header className="ph ph--trophies">
          <div className="ph-glow" aria-hidden />
          <div className="ph-inner">
            <div className="ph-text">
              <p className="ph-kicker"><span className="ph-kicker-dot" aria-hidden />Honours</p>
              <h1 className="ph-title">Trophy Cabinet</h1>
              <p className="ph-desc">Every league, cup, and international title you&apos;ve logged.</p>
            </div>
            <svg className="ph-deco" aria-hidden viewBox="0 0 200 140" fill="none">
              <path d="M100 20 L110 50 L140 50 L116 68 L126 98 L100 80 L74 98 L84 68 L60 50 L90 50 Z" fill="currentColor" fillOpacity="0.2" />
              <path d="M100 30 L108 54 L134 54 L112 70 L120 94 L100 78 L80 94 L88 70 L66 54 L92 54 Z" fill="currentColor" fillOpacity="0.12" />
              <circle cx="100" cy="60" r="30" fill="currentColor" fillOpacity="0.07" />
              <circle cx="160" cy="115" r="20" fill="currentColor" fillOpacity="0.08" />
              <circle cx="40"  cy="110" r="14" fill="currentColor" fillOpacity="0.07" />
            </svg>
          </div>
        </header>
        <div className="trophy-cab-alert" role="alert">
          {api.error}
        </div>
      </section>
    );
  }

  return (
    <section className="dash-view trophy-cabinet trophy-cabinet-page">
      <header className="ph ph--trophies">
        <div className="ph-glow" aria-hidden />
        <div className="ph-inner">
          <div className="ph-text">
            <p className="ph-kicker"><span className="ph-kicker-dot" aria-hidden />Honours</p>
            <h1 className="ph-title">Trophy Cabinet</h1>
            <p className="ph-desc">
              Your career silverware — by season, club, and country.
            </p>
          </div>
          <svg className="ph-deco" aria-hidden viewBox="0 0 200 140" fill="none">
            <path d="M100 20 L110 50 L140 50 L116 68 L126 98 L100 80 L74 98 L84 68 L60 50 L90 50 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M100 30 L108 54 L134 54 L112 70 L120 94 L100 78 L80 94 L88 70 L66 54 L92 54 Z" fill="currentColor" fillOpacity="0.12" />
            <circle cx="100" cy="60" r="30" fill="currentColor" fillOpacity="0.07" />
            <circle cx="160" cy="115" r="20" fill="currentColor" fillOpacity="0.08" />
            <circle cx="40"  cy="110" r="14" fill="currentColor" fillOpacity="0.07" />
          </svg>
        </div>
        <div className="ph-bottom">
          <div className="ph-stat">
            <span className="ph-stat-n">{api.clubTrophies.length}</span>
            <span className="ph-stat-l">Club</span>
          </div>
          <span className="ph-div" aria-hidden />
          <div className="ph-stat">
            <span className="ph-stat-n">{api.intTrophies.length}</span>
            <span className="ph-stat-l">International</span>
          </div>
          <span className="ph-div" aria-hidden />
          <div className="ph-stat">
            <span className="ph-stat-n">{total}</span>
            <span className="ph-stat-l">Total honours</span>
          </div>
        </div>
      </header>

      {api.loading ? (
        <p className="trophy-cab-loading muted-text">Loading trophies…</p>
      ) : (
        <>
          <TrophyDigest
            club={api.clubTrophies.length}
            intl={api.intTrophies.length}
            total={total}
          />

          {total === 0 ? (
            <div className="trophy-cab-zero">
              <div className="trophy-cab-zero-visual" aria-hidden>
                <EmptyTrophyCabinetIllustration className="trophy-cab-zero-svg" />
              </div>
              <p className="trophy-cab-zero-title">Your cabinet is empty</p>
              <p className="trophy-cab-zero-text muted-text">
                When you record club and international trophies in{" "}
                <Link to="/season-data" className="trophy-cab-link">
                  Season data
                </Link>
                , they&apos;ll fill this cabinet with logos, shelves, and season
                tags.
              </p>
            </div>
          ) : (
            <>
              <TrophyPhysicalCabinet
                clubTrophies={api.clubTrophies}
                intTrophies={api.intTrophies}
              />
              {seasonSummaries.length > 0 && (
                <section
                  className="tcab-block tcab-block--lead"
                  aria-labelledby="trophy-by-season-heading"
                >
                  <div className="tcab-block-head">
                    <h2 id="trophy-by-season-heading" className="tcab-h2">
                      By season
                    </h2>
                    <p className="tcab-lead muted-text">
                      Your club (from season data) and every title that season.
                    </p>
                  </div>
                  <div className="tcab-season-stack">
                    {seasonSummaries.map((s) => (
                      <SeasonHonoursCard key={s.season} {...s} />
                    ))}
                  </div>
                </section>
              )}

              <section
                className="tcab-block"
                aria-labelledby="trophy-club-heading"
              >
                <div className="tcab-block-head">
                  <h2 id="trophy-club-heading" className="tcab-h2">
                    <IconTrophyClub className="tcab-h2-ic" aria-hidden />
                    Club honours
                  </h2>
                  <p className="tcab-lead muted-text">
                    Grouped by competition — seasons listed on each card.
                  </p>
                </div>
                {clubGroups.length > 0 ? (
                  <div className="tcab-hon-grid">
                    {clubGroups.map(([id, rows]) => (
                      <TrophyGroupCard
                        key={id}
                        competitionId={id}
                        rows={rows}
                        labelFor={(x) => CLUB_TROPHY_LABEL[x] ?? x}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="trophy-cab-empty muted-text">
                    No club trophies yet. Add them from{" "}
                    <Link to="/season-data" className="trophy-cab-link">
                      Season data
                    </Link>{" "}
                    when you save a season.
                  </p>
                )}
              </section>

              <section
                className="tcab-block"
                aria-labelledby="trophy-int-heading"
              >
                <div className="tcab-block-head">
                  <h2 id="trophy-int-heading" className="tcab-h2">
                    <IconTrophyIntl
                      className="tcab-h2-ic tcab-h2-ic--int"
                      aria-hidden
                    />
                    International
                  </h2>
                  <p className="tcab-lead muted-text">
                    Tournaments with your national team.
                  </p>
                </div>
                {intGroups.length > 0 ? (
                  <div className="tcab-hon-grid">
                    {intGroups.map(([id, rows]) => (
                      <TrophyGroupCard
                        key={id}
                        competitionId={id}
                        rows={rows}
                        labelFor={(x) => INT_TROPHY_LABEL[x] ?? x}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="trophy-cab-empty muted-text">
                    No international trophies yet. Log them alongside
                    international seasons in{" "}
                    <Link to="/season-data" className="trophy-cab-link">
                      Season data
                    </Link>
                    .
                  </p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </section>
  );
}
