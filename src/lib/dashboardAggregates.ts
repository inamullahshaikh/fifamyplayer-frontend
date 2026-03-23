import type {
  AwardRow,
  SeasonChartPoint,
  SeasonDataRow,
  YearlyChartPoint,
  YearlyDataRow,
} from '../types/dashboard'

/** Sum club season rows by `season` label (multiple competitions per season). */
export function aggregateSeasonGoalsAssists(rows: SeasonDataRow[]): SeasonChartPoint[] {
  const map = new Map<string, { goals: number; assists: number }>()
  for (const r of rows) {
    const key = String(r.season ?? '—').trim() || '—'
    const cur = map.get(key) ?? { goals: 0, assists: 0 }
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    map.set(key, cur)
  }
  return Array.from(map.entries())
    .map(([season, v]) => ({ season, goals: v.goals, assists: v.assists }))
    .sort((a, b) => a.season.localeCompare(b.season, undefined, { numeric: true }))
}

export function normalizeYearlyData(rows: YearlyDataRow[]): YearlyChartPoint[] {
  return rows
    .map((r) => ({
      year: String(r.year ?? '—').trim() || '—',
      goals: Number(r.goals) || 0,
      assists: Number(r.assists) || 0,
    }))
    .sort((a, b) => a.year.localeCompare(b.year, undefined, { numeric: true }))
}

/** Only Ballon d'Or, Golden Boot, FIFA Best Player count toward “Awards won”  */
/** Exact match only (case-insensitive, trim). */
const INCLUDED_AWARD_NAMES = [
  /^\s*ballon\s*d\s*['\u2019]?\s*or\s*$/i,
  /^\s*golden\s+boot\s*$/i,
  /^\s*fifa\s+best\s+player\s*$/i,
]

function isIncludedAwardName(awardName: string | undefined): boolean {
  const n = String(awardName ?? '').trim()
  if (!n) return false
  return INCLUDED_AWARD_NAMES.some((re) => re.test(n))
}

export function totalAwards(awards: AwardRow[]): number {
  return awards
    .filter((a) => isIncludedAwardName(a.award))
    .reduce((sum, a) => sum + (Number(a.quantity) > 0 ? Number(a.quantity) : 1), 0)
}
