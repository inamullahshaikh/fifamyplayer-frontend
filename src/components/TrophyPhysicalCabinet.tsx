import { useMemo, type CSSProperties, type SVGProps } from "react";
import { CLUB_TROPHY_LABEL, INT_TROPHIES } from "../config/seasonDataConfig";
import { IconTrophyClub } from "./dashboard/AchievementIcons";
import { getTrophyLogo } from "../config/seasonAssets";
import type { TrophyRow } from "../types/dashboard";

const CLUB_LABEL = CLUB_TROPHY_LABEL;
const INT_LABEL: Record<string, string> = Object.fromEntries(
  INT_TROPHIES.map((t) => [t.id, t.label]),
);

type CabinetItem = {
  key: string;
  trophyId: string;
  scope: "club" | "int";
  label: string;
  season?: string;
};

/** Seven trophies per shelf row. */
const SHELF_CAPACITY = 7;

/** Top-five domestic league winner trophies (ids as stored on rows, with or without `-trophy`). */
const LEAGUE_TROPHY_BASE_IDS = ["ll", "pl", "bl", "sa", "l1"] as const;

/** UEFA / continental club competitions (ids with or without `-trophy`). */
const CONTINENTAL_TROPHY_BASE_IDS = [
  "ucl",
  "uel",
  "uecl",
  "uesc",
  "usc",
] as const;

/** Domestic cups & super cups (club), after league + continental. */
const DOMESTIC_CUP_BASE_IDS = [
  "fa",
  "efl",
  "cs",
  "cdr",
  "sde",
  "dfb",
  "dfl",
  "ci",
  "si",
  "cdf",
  "tdc",
] as const;

const INT_TROPHY_ORDER: readonly string[] = INT_TROPHIES.map((t) => t.id);

function normalizeTrophyBaseId(trophyId: string): string {
  return String(trophyId ?? "")
    .trim()
    .replace(/-trophy$/i, "")
    .toLowerCase();
}

/** 0 = international, 1 = league, 2 = continental, 3 = domestic cups & other. */
function cabinetTrophyKindRank(
  scope: "club" | "int",
  trophyId: string,
): 0 | 1 | 2 | 3 {
  if (scope === "int") return 0;
  const base = normalizeTrophyBaseId(trophyId);
  if ((LEAGUE_TROPHY_BASE_IDS as readonly string[]).includes(base)) return 1;
  if ((CONTINENTAL_TROPHY_BASE_IDS as readonly string[]).includes(base))
    return 2;
  return 3;
}

/** Lower = earlier within the same kind tier (international / league / continental / domestic). */
function trophySecondarySortIndex(
  scope: "club" | "int",
  trophyId: string,
  kind: 0 | 1 | 2 | 3,
): number {
  const raw = String(trophyId ?? "").trim();
  const base = normalizeTrophyBaseId(trophyId);
  if (scope === "int") {
    const i = INT_TROPHY_ORDER.indexOf(raw);
    return i === -1 ? INT_TROPHY_ORDER.length + 100 : i;
  }
  if (kind === 1) {
    const i = (LEAGUE_TROPHY_BASE_IDS as readonly string[]).indexOf(base);
    return i === -1 ? 100 : i;
  }
  if (kind === 2) {
    const i = (CONTINENTAL_TROPHY_BASE_IDS as readonly string[]).indexOf(base);
    return i === -1 ? 100 : i;
  }
  const i = (DOMESTIC_CUP_BASE_IDS as readonly string[]).indexOf(base);
  return i === -1 ? 500 : i;
}

function buildCabinetItems(
  club: TrophyRow[],
  intl: TrophyRow[],
): CabinetItem[] {
  const out: CabinetItem[] = [];
  let idx = 0;
  for (const r of club) {
    const id = String(r.competition ?? "").trim();
    if (!id) continue;
    const season = String(r.season ?? "").trim() || undefined;
    out.push({
      key: String(r._id ?? `club-${id}-${season ?? "na"}-${idx++}`),
      trophyId: id,
      scope: "club",
      label: CLUB_LABEL[id] ?? id,
      season,
    });
  }
  for (const r of intl) {
    const id = String(r.competition ?? "").trim();
    if (!id) continue;
    const season = String(r.season ?? "").trim() || undefined;
    out.push({
      key: String(r._id ?? `int-${id}-${season ?? "na"}-${idx++}`),
      trophyId: id,
      scope: "int",
      label: INT_LABEL[id] ?? id,
      season,
    });
  }
  out.sort((a, b) => {
    const ra = cabinetTrophyKindRank(a.scope, a.trophyId);
    const rb = cabinetTrophyKindRank(b.scope, b.trophyId);
    if (ra !== rb) return ra - rb;
    const ia = trophySecondarySortIndex(a.scope, a.trophyId, ra);
    const ib = trophySecondarySortIndex(b.scope, b.trophyId, rb);
    if (ia !== ib) return ia - ib;
    const sa = a.season ?? "";
    const sb = b.season ?? "";
    const bySeason = sb.localeCompare(sa, undefined, { numeric: true });
    if (bySeason !== 0) return bySeason;
    const byLabel = a.label.localeCompare(b.label);
    if (byLabel !== 0) return byLabel;
    return a.key.localeCompare(b.key);
  });
  return out;
}

export function TrophyPhysicalCabinet({
  clubTrophies,
  intTrophies,
}: {
  clubTrophies: TrophyRow[];
  intTrophies: TrophyRow[];
}) {
  const items = useMemo(
    () => buildCabinetItems(clubTrophies, intTrophies),
    [clubTrophies, intTrophies],
  );
  const shelves = useMemo(() => {
    const chunks: CabinetItem[][] = [];
    for (let i = 0; i < items.length; i += SHELF_CAPACITY) {
      chunks.push(items.slice(i, i + SHELF_CAPACITY));
    }
    return chunks;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section className="tcab-physical" aria-labelledby="tcab-physical-title">
      <div className="tcab-physical-card">
        <div className="tcab-physical-head">
          <h2 id="tcab-physical-title" className="tcab-physical-title">
            <IconTrophyClub className="tcab-physical-title-ic" aria-hidden />
            Trophy cabinet
          </h2>
        </div>

        <div className="tcab-physical-shelves">
          {shelves.map((shelf, si) => (
            <div key={si} className="tcab-physical-shelf">
              <div className="tcab-physical-row">
                {shelf.map((item, ii) => {
                  const logo = getTrophyLogo(item.trophyId);
                  const globalI = si * SHELF_CAPACITY + ii;
                  return (
                    <div
                      key={item.key}
                      className="tcab-physical-item"
                      data-scope={item.scope}
                      style={{ "--tcab-p-i": globalI } as CSSProperties}
                      title={
                        item.season
                          ? `${item.label} — ${item.season}`
                          : item.label
                      }
                    >
                      <div className="tcab-physical-figure">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            className="tcab-physical-img"
                            loading="lazy"
                          />
                        ) : (
                          <span className="tcab-physical-fallback" aria-hidden>
                            {item.label.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="tcab-physical-captions">
                        <p className="tcab-physical-name">{item.label}</p>
                        {item.season ? (
                          <p className="tcab-physical-season muted-text">
                            {item.season}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Empty cabinet wireframe for zero-state on the trophy cabinet page. */
export function EmptyTrophyCabinetIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient
          id="tcab-empty-wood"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#5c3d2e" />
          <stop offset="50%" stopColor="#3d2817" />
          <stop offset="100%" stopColor="#2a1a0e" />
        </linearGradient>
        <linearGradient id="tcab-empty-glass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="304"
        height="184"
        rx="12"
        stroke="url(#tcab-empty-wood)"
        strokeWidth="16"
        fill="#141820"
      />
      <rect
        x="28"
        y="36"
        width="264"
        height="140"
        rx="6"
        fill="url(#tcab-empty-glass)"
      />
      <line
        x1="28"
        y1="88"
        x2="292"
        y2="88"
        stroke="rgba(180,130,70,0.35)"
        strokeWidth="3"
      />
      <line
        x1="28"
        y1="138"
        x2="292"
        y2="138"
        stroke="rgba(180,130,70,0.35)"
        strokeWidth="3"
      />
      <rect
        x="52"
        y="52"
        width="36"
        height="28"
        rx="4"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <rect
        x="104"
        y="52"
        width="36"
        height="28"
        rx="4"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <rect
        x="156"
        y="52"
        width="36"
        height="28"
        rx="4"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
    </svg>
  );
}
