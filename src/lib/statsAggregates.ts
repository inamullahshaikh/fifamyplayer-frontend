import type { IntDataRow, SeasonDataRow, YearlyDataRow } from '../types/dashboard'

export type StatRow = { apps: number; goals: number; assists: number; avgrating?: number }

function sumStats(rows: { apps?: number; goals?: number; assists?: number; avgrating?: number }[]): StatRow {
  let apps = 0
  let goals = 0
  let assists = 0
  let ratingSum = 0
  let ratingCount = 0
  for (const r of rows) {
    apps += Number(r.apps) || 0
    goals += Number(r.goals) || 0
    assists += Number(r.assists) || 0
    if (r.avgrating != null && Number(r.avgrating) > 0) {
      ratingSum += Number(r.avgrating)
      ratingCount++
    }
  }
  return {
    apps,
    goals,
    assists,
    avgrating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : undefined,
  }
}

/** Overview: totals from club + international. */
export function overviewStats(club: SeasonDataRow[], int: IntDataRow[]): StatRow {
  return sumStats([...club, ...int])
}

/** Club stats: totals from season_data only. */
export function clubStats(rows: SeasonDataRow[]): StatRow {
  return sumStats(rows)
}

/** International stats: totals from int_data only. */
export function intStats(rows: IntDataRow[]): StatRow {
  return sumStats(rows)
}

export type SeasonCompRow = {
  competition: string
  team?: string
  apps: number
  goals: number
  assists: number
  avgrating?: number
  finish?: string
}

export type SeasonBreakdown = {
  season: string
  clubRows: SeasonCompRow[]
  intRows: Omit<SeasonCompRow, 'team'>[]
  totalApps: number
  totalGoals: number
  totalAssists: number
  avgrating?: number
}

/** Stats by season with per-competition breakdown (club + int). */
export function statsBySeasonWithBreakdown(
  club: SeasonDataRow[],
  int: IntDataRow[]
): SeasonBreakdown[] {
  const seasonSet = new Set<string>()
  for (const r of club) if (r.season) seasonSet.add(r.season)
  for (const r of int) if (r.season) seasonSet.add(r.season)
  const seasons = [...seasonSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  return seasons.map((season) => {
    const clubRows: SeasonCompRow[] = club
      .filter((r) => r.season === season)
      .map((r) => ({
        competition: String(r.competition ?? '').trim(),
        team: r.team ? String(r.team).trim() : undefined,
        apps: Number(r.apps) || 0,
        goals: Number(r.goals) || 0,
        assists: Number(r.assists) || 0,
        avgrating: r.avgrating != null && Number(r.avgrating) > 0 ? Number(r.avgrating) : undefined,
        finish: r.finish != null && String(r.finish).trim() ? String(r.finish).trim() : undefined,
      }))
    const intRows: Omit<SeasonCompRow, 'team'>[] = int
      .filter((r) => r.season === season)
      .map((r) => ({
        competition: String(r.competition ?? '').trim(),
        apps: Number(r.apps) || 0,
        goals: Number(r.goals) || 0,
        assists: Number(r.assists) || 0,
        avgrating: r.avgrating != null && Number(r.avgrating) > 0 ? Number(r.avgrating) : undefined,
        finish: r.finish != null && String(r.finish).trim() ? String(r.finish).trim() : undefined,
      }))
    const allRows = [
      ...clubRows.map((r) => ({ apps: r.apps, goals: r.goals, assists: r.assists, avgrating: r.avgrating })),
      ...intRows.map((r) => ({ apps: r.apps, goals: r.goals, assists: r.assists, avgrating: r.avgrating })),
    ]
    const totalApps = allRows.reduce((s, x) => s + x.apps, 0)
    const totalGoals = allRows.reduce((s, x) => s + x.goals, 0)
    const totalAssists = allRows.reduce((s, x) => s + x.assists, 0)
    const ratings = allRows.filter((r) => r.avgrating != null).map((r) => r.avgrating!)
    const avgrating =
      ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100 : undefined
    return { season, clubRows, intRows, totalApps, totalGoals, totalAssists, avgrating }
  })
}

/** Stats by season (club + int combined per season). */
export function statsBySeason(
  club: SeasonDataRow[],
  int: IntDataRow[]
): { season: string; apps: number; goals: number; assists: number; avgrating?: number }[] {
  const map = new Map<string, { apps: number; goals: number; assists: number; ratings: number[] }>()
  const add = (s: string, r: { apps?: number; goals?: number; assists?: number; avgrating?: number }) => {
    const key = String(s ?? '').trim() || '—'
    const cur = map.get(key) ?? { apps: 0, goals: 0, assists: 0, ratings: [] }
    cur.apps += Number(r.apps) || 0
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    if (r.avgrating != null && Number(r.avgrating) > 0) cur.ratings.push(Number(r.avgrating))
    map.set(key, cur)
  }
  for (const r of club) add(r.season ?? '', r)
  for (const r of int) add(r.season ?? '', r)
  return Array.from(map.entries())
    .map(([season, v]) => ({
      season,
      apps: v.apps,
      goals: v.goals,
      assists: v.assists,
      avgrating: v.ratings.length > 0 ? Math.round((v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length) * 100) / 100 : undefined,
    }))
    .sort((a, b) => a.season.localeCompare(b.season, undefined, { numeric: true }))
}

/** Stats by year (from yearly_data). */
export function statsByYear(rows: YearlyDataRow[]): { year: string; goals: number; assists: number }[] {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      year: String(r.year ?? '—').trim() || '—',
      goals: Number(r.goals) || 0,
      assists: Number(r.assists) || 0,
    }))
    .sort((a, b) => a.year.localeCompare(b.year, undefined, { numeric: true }))
}

/** Best performances: top goals/assists in a single season, competition, calendar year, etc. */
export function bestPerformances(club: SeasonDataRow[], int: IntDataRow[], yearly: YearlyDataRow[] = []) {
  const bySeason = new Map<string, { goals: number; assists: number }>()
  for (const r of club) {
    const key = r.season ?? '—'
    const cur = bySeason.get(key) ?? { goals: 0, assists: 0 }
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    bySeason.set(key, cur)
  }
  for (const r of int) {
    const key = r.season ?? '—'
    const cur = bySeason.get(key) ?? { goals: 0, assists: 0 }
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    bySeason.set(key, cur)
  }

  const seasons = Array.from(bySeason.entries()).map(([season, v]) => ({ season, ...v }))
  const bestSeasonGoals = [...seasons].sort((a, b) => b.goals - a.goals)[0]
  const bestSeasonAssists = [...seasons].sort((a, b) => b.assists - a.assists)[0]
  const bestSeasonTotal = [...seasons].sort((a, b) => b.goals + b.assists - (a.goals + a.assists))[0]

  const allCompRows = [
    ...club.map((r) => ({ comp: r.competition ?? '', goals: Number(r.goals) || 0, assists: Number(r.assists) || 0 })),
    ...int.map((r) => ({ comp: r.competition ?? '', goals: Number(r.goals) || 0, assists: Number(r.assists) || 0 })),
  ]
  const bestCompGoals = [...allCompRows].sort((a, b) => b.goals - a.goals).filter((x) => x.comp)[0]
  const bestCompAssists = [...allCompRows].sort((a, b) => b.assists - a.assists).filter((x) => x.comp)[0]

  const yearRows = statsByYear(yearly)
  const bestYearGoals = [...yearRows].filter((r) => r.goals > 0).sort((a, b) => b.goals - a.goals)[0]
  const bestYearAssists = [...yearRows].filter((r) => r.assists > 0).sort((a, b) => b.assists - a.assists)[0]
  const bestYearTotal = [...yearRows]
    .filter((r) => r.goals + r.assists > 0)
    .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))[0]

  return {
    bestSeasonGoals,
    bestSeasonAssists,
    bestSeasonTotal,
    bestCompGoals,
    bestCompAssists,
    bestYearGoals,
    bestYearAssists,
    bestYearTotal,
  }
}

export type CompetitionStatsAggregate = {
  competition: string
  apps: number
  goals: number
  assists: number
  avgrating?: number
  finishesSummary?: string
}

/** Stats by competition (club + int). */
export function statsByCompetition(
  club: SeasonDataRow[],
  int: IntDataRow[]
): CompetitionStatsAggregate[] {
  const map = new Map<
    string,
    { apps: number; goals: number; assists: number; ratings: number[]; finishSet: Set<string> }
  >()
  const add = (
    comp: string,
    r: {
      apps?: number
      goals?: number
      assists?: number
      avgrating?: number
      finish?: string
    },
  ) => {
    const key = String(comp ?? '').trim() || '—'
    const cur =
      map.get(key) ?? { apps: 0, goals: 0, assists: 0, ratings: [], finishSet: new Set<string>() }
    cur.apps += Number(r.apps) || 0
    cur.goals += Number(r.goals) || 0
    cur.assists += Number(r.assists) || 0
    if (r.avgrating != null && Number(r.avgrating) > 0) cur.ratings.push(Number(r.avgrating))
    const f = r.finish != null && String(r.finish).trim() ? String(r.finish).trim() : ''
    if (f) cur.finishSet.add(f)
    map.set(key, cur)
  }
  for (const r of club) add(r.competition ?? '', r)
  for (const r of int) add(r.competition ?? '', r)
  return Array.from(map.entries())
    .map(([competition, v]) => ({
      competition,
      apps: v.apps,
      goals: v.goals,
      assists: v.assists,
      avgrating: v.ratings.length > 0 ? Math.round((v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length) * 100) / 100 : undefined,
      finishesSummary:
        v.finishSet.size > 0
          ? [...v.finishSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(' · ')
          : undefined,
    }))
    .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))
}

export type TeamCompRow = {
  competition: string
  apps: number
  goals: number
  assists: number
  avgrating?: number
  finishesSummary?: string
}

export type TeamWithBreakdown = {
  team: string
  apps: number
  goals: number
  assists: number
  avgrating?: number
  breakdown: TeamCompRow[]
}

/** Stats by team with per-competition breakdown (club only - season_data has team). */
export function statsByTeamWithBreakdown(rows: SeasonDataRow[]): TeamWithBreakdown[] {
  const teamMap = new Map<
    string,
    {
      apps: number
      goals: number
      assists: number
      ratings: number[]
      compMap: Map<
        string,
        { apps: number; goals: number; assists: number; ratings: number[]; finishSet: Set<string> }
      >
    }
  >()
  for (const r of rows) {
    const teamKey = String(r.team ?? '').trim() || '—'
    let teamCur = teamMap.get(teamKey)
    if (!teamCur) {
      teamCur = { apps: 0, goals: 0, assists: 0, ratings: [], compMap: new Map() }
      teamMap.set(teamKey, teamCur)
    }
    teamCur.apps += Number(r.apps) || 0
    teamCur.goals += Number(r.goals) || 0
    teamCur.assists += Number(r.assists) || 0
    if (r.avgrating != null && Number(r.avgrating) > 0) teamCur.ratings.push(Number(r.avgrating))

    const compKey = String(r.competition ?? '').trim() || '—'
    let compCur = teamCur.compMap.get(compKey)
    if (!compCur) {
      compCur = { apps: 0, goals: 0, assists: 0, ratings: [], finishSet: new Set<string>() }
      teamCur.compMap.set(compKey, compCur)
    }
    compCur.apps += Number(r.apps) || 0
    compCur.goals += Number(r.goals) || 0
    compCur.assists += Number(r.assists) || 0
    if (r.avgrating != null && Number(r.avgrating) > 0) compCur.ratings.push(Number(r.avgrating))
    const f = r.finish != null && String(r.finish).trim() ? String(r.finish).trim() : ''
    if (f) compCur.finishSet.add(f)
  }
  return Array.from(teamMap.entries())
    .map(([team, v]) => {
      const breakdown = Array.from(v.compMap.entries())
        .map(([competition, c]) => ({
          competition,
          apps: c.apps,
          goals: c.goals,
          assists: c.assists,
          avgrating: c.ratings.length > 0 ? Math.round((c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length) * 100) / 100 : undefined,
          finishesSummary:
            c.finishSet.size > 0
              ? [...c.finishSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(' · ')
              : undefined,
        }))
        .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))
      return {
        team,
        apps: v.apps,
        goals: v.goals,
        assists: v.assists,
        avgrating: v.ratings.length > 0 ? Math.round((v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length) * 100) / 100 : undefined,
        breakdown,
      }
    })
    .sort((a, b) => b.goals - a.goals)
}
