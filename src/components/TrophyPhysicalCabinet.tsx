import { useMemo, type CSSProperties, type SVGProps } from "react";
import {
  CLUB_TROPHY_LABEL,
  INT_TROPHIES,
} from "../config/seasonDataConfig";
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
  count: number;
  scope: "club" | "int";
  label: string;
};

const SHELF_CAPACITY = 5;

function buildCabinetItems(
  club: TrophyRow[],
  intl: TrophyRow[],
): CabinetItem[] {
  const clubM = new Map<string, number>();
  for (const r of club) {
    const id = String(r.competition ?? "").trim();
    if (!id) continue;
    clubM.set(id, (clubM.get(id) ?? 0) + 1);
  }
  const intM = new Map<string, number>();
  for (const r of intl) {
    const id = String(r.competition ?? "").trim();
    if (!id) continue;
    intM.set(id, (intM.get(id) ?? 0) + 1);
  }
  const out: CabinetItem[] = [];
  for (const [trophyId, count] of clubM) {
    out.push({
      key: `club-${trophyId}`,
      trophyId,
      count,
      scope: "club",
      label: CLUB_LABEL[trophyId] ?? trophyId,
    });
  }
  for (const [trophyId, count] of intM) {
    out.push({
      key: `int-${trophyId}`,
      trophyId,
      count,
      scope: "int",
      label: INT_LABEL[trophyId] ?? trophyId,
    });
  }
  out.sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
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
          <p className="tcab-physical-desc muted-text">
            Most-won competitions first. Blue accent = club, violet = international.
          </p>
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
                      title={`${item.label} — ${item.count}×`}
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
                          <span
                            className="tcab-physical-fallback"
                            aria-hidden
                          >
                            {item.label.slice(0, 2)}
                          </span>
                        )}
                        <span className="tcab-physical-count">
                          {item.count}
                        </span>
                      </div>
                      <p className="tcab-physical-name">{item.label}</p>
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
export function EmptyTrophyCabinetIllustration(
  props: SVGProps<SVGSVGElement>,
) {
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
        <linearGradient
          id="tcab-empty-glass"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
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
