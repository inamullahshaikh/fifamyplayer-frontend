import type { AwardRow, IntDataRow, SeasonDataRow } from '../types/dashboard'

/** Per season: club vs international split for stacked / comparative charts. */
export function buildSeasonClubIntSplit(
  club: SeasonDataRow[],
  int: IntDataRow[],
): {
  season: string
  clubGoals: number
  intGoals: number
  clubAssists: number
  intAssists: number
  clubGa: number
  intGa: number
  clubApps: number
  intApps: number
}[] {
  const seasons = new Set<string>()
  for (const r of club) {
    const s = String(r.season ?? '').trim()
    if (s) seasons.add(s)
  }
  for (const r of int) {
    const s = String(r.season ?? '').trim()
    if (s) seasons.add(s)
  }
  const sorted = [...seasons].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return sorted.map((season) => {
    let clubGoals = 0,
      intGoals = 0,
      clubAssists = 0,
      intAssists = 0,
      clubApps = 0,
      intApps = 0
    for (const r of club) {
      if (String(r.season ?? '').trim() !== season) continue
      clubGoals += Number(r.goals) || 0
      clubAssists += Number(r.assists) || 0
      clubApps += Number(r.apps) || 0
    }
    for (const r of int) {
      if (String(r.season ?? '').trim() !== season) continue
      intGoals += Number(r.goals) || 0
      intAssists += Number(r.assists) || 0
      intApps += Number(r.apps) || 0
    }
    return {
      season,
      clubGoals,
      intGoals,
      clubAssists,
      intAssists,
      clubGa: clubGoals + clubAssists,
      intGa: intGoals + intAssists,
      clubApps,
      intApps,
    }
  })
}

export type CompAgg = {
  id: string
  goals: number
  assists: number
  apps: number
  ga: number
}

function aggregateCompetitionRows(
  rows: { competition?: string; goals?: number; assists?: number; apps?: number }[],
): CompAgg[] {
  const m = new Map<string, { goals: number; assists: number; apps: number }>()
  for (const r of rows) {
    const id = String(r.competition ?? '').trim() || '—'
    const cur = m.get(id) ?? { goals: 0, assists: 0, apps: 0 }
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    cur.apps += Number(r.apps) || 0
    m.set(id, cur)
  }
  return [...m.entries()]
    .map(([id, v]) => ({ id, ...v, ga: v.goals + v.assists }))
    .sort((a, b) => b.ga - a.ga)
}

export function clubCompetitionAgg(club: SeasonDataRow[]): CompAgg[] {
  return aggregateCompetitionRows(club)
}

export function intCompetitionAgg(int: IntDataRow[]): CompAgg[] {
  return aggregateCompetitionRows(int)
}

export function awardsAggregated(awards: AwardRow[], limit = 12): { name: string; count: number }[] {
  const m = new Map<string, number>()
  for (const a of awards) {
    const name = String(a.award ?? '').trim() || '—'
    const q = Number(a.quantity) > 0 ? Number(a.quantity) : 1
    m.set(name, (m.get(name) ?? 0) + q)
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/** Total award quantity per season, sorted oldest → newest for time-series charts. */
export function awardsPerSeasonTotals(awards: AwardRow[]): { season: string; total: number }[] {
  const m = new Map<string, number>()
  for (const a of awards) {
    const season = String(a.season ?? '').trim()
    if (!season) continue
    const name = String(a.award ?? '').trim()
    if (!name) continue
    const q = Number(a.quantity) > 0 ? Number(a.quantity) : 1
    m.set(season, (m.get(season) ?? 0) + q)
  }
  return [...m.entries()]
    .map(([season, total]) => ({ season, total }))
    .sort((a, b) => a.season.localeCompare(b.season, undefined, { numeric: true }))
}

/** Top N competitions by G+A + optional "Other" slice for pie. */
export function competitionGaPieSlices(
  rows: { competition: string; goals: number; assists: number }[],
  topN = 6,
): { key: string; value: number }[] {
  const sorted = [...rows]
    .map((r) => ({ key: r.competition, value: r.goals + r.assists }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
  if (sorted.length === 0) return []
  const top = sorted.slice(0, topN)
  const rest = sorted.slice(topN).reduce((s, r) => s + r.value, 0)
  if (rest > 0) top.push({ key: '__other__', value: rest })
  return top
}

export function clubOnlySeasonSeries(club: SeasonDataRow[]): {
  season: string
  goals: number
  assists: number
  apps: number
  ga: number
}[] {
  const map = new Map<string, { goals: number; assists: number; apps: number }>()
  for (const r of club) {
    const s = String(r.season ?? '').trim() || '—'
    const cur = map.get(s) ?? { goals: 0, assists: 0, apps: 0 }
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    cur.apps += Number(r.apps) || 0
    map.set(s, cur)
  }
  return [...map.entries()]
    .map(([season, v]) => ({ season, ...v, ga: v.goals + v.assists }))
    .sort((a, b) => a.season.localeCompare(b.season, undefined, { numeric: true }))
}

export function intOnlySeasonSeries(int: IntDataRow[]): {
  season: string
  goals: number
  assists: number
  apps: number
  ga: number
}[] {
  const map = new Map<string, { goals: number; assists: number; apps: number }>()
  for (const r of int) {
    const s = String(r.season ?? '').trim() || '—'
    const cur = map.get(s) ?? { goals: 0, assists: 0, apps: 0 }
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    cur.apps += Number(r.apps) || 0
    map.set(s, cur)
  }
  return [...map.entries()]
    .map(([season, v]) => ({ season, ...v, ga: v.goals + v.assists }))
    .sort((a, b) => a.season.localeCompare(b.season, undefined, { numeric: true }))
}
