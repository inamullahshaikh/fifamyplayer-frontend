import { useEffect, useState } from 'react'
import { aggregateSeasonGoalsAssists, normalizeYearlyData, totalAwards } from '../lib/dashboardAggregates'
import { apiFetch } from '../lib/api'
import type {
  AwardRow,
  PlayerRow,
  SeasonChartPoint,
  SeasonDataRow,
  TransferRow,
  TrophyRow,
  YearlyChartPoint,
  YearlyDataRow,
} from '../types/dashboard'
import { toTeamSlug } from '../config/seasonDataConfig'

export type DashboardApiState = {
  loading: boolean
  error: string | null
  player: PlayerRow | null
  currentTeamSlug: string | null
  prevTeamSlug: string | null
  transfers: TransferRow[]
  seasonSeries: SeasonChartPoint[]
  yearlySeries: YearlyChartPoint[]
  clubTrophies: number
  intTrophies: number
  awardsTotal: number
}

const initial: DashboardApiState = {
  loading: true,
  error: null,
  player: null,
  currentTeamSlug: null,
  prevTeamSlug: null,
  transfers: [],
  seasonSeries: [],
  yearlySeries: [],
  clubTrophies: 0,
  intTrophies: 0,
  awardsTotal: 0,
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url)
  if (!res.ok) throw new Error('Request failed')
  return res.json() as Promise<T>
}

/** Sort seasons like "2024/25" chronologically, newest last. */
function sortSeasons(rows: SeasonDataRow[]): SeasonDataRow[] {
  return [...rows].sort((a, b) => {
    const ya = parseInt(String(a.season ?? '0').split('/')[0], 10)
    const yb = parseInt(String(b.season ?? '0').split('/')[0], 10)
    return ya - yb
  })
}

/** Derive the current and previous distinct team slugs from sorted season data. */
function deriveTeamSlugs(sorted: SeasonDataRow[]): { current: string | null; prev: string | null } {
  const teamsNewestFirst = sorted
    .map((r) => (r.team ? toTeamSlug(r.team) : null))
    .filter((t): t is string => !!t)
    .reverse()

  const distinctTeams: string[] = []
  for (const t of teamsNewestFirst) {
    if (!distinctTeams.includes(t)) distinctTeams.push(t)
    if (distinctTeams.length >= 2) break
  }

  return {
    current: distinctTeams[0] ?? null,
    prev: distinctTeams[1] ?? null,
  }
}

export type DashboardApi = DashboardApiState & { refresh: () => void }

export function useDashboardApi(): DashboardApi {
  const [state, setState] = useState<DashboardApiState>(initial)
  const [tick, setTick] = useState(0)

  const refresh = () => setTick((n) => n + 1)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const [playersRaw, seasonRaw, yearlyRaw, clubT, intT, awardsRaw, transfersRaw] =
          await Promise.all([
            fetchJson<PlayerRow[]>('/api/players'),
            fetchJson<SeasonDataRow[]>('/api/season_data'),
            fetchJson<YearlyDataRow[]>('/api/yearly_data'),
            fetchJson<TrophyRow[]>('/api/season_trophies'),
            fetchJson<TrophyRow[]>('/api/int_trophies'),
            fetchJson<AwardRow[]>('/api/season_awards'),
            fetchJson<TransferRow[]>('/api/transfers'),
          ])

        if (cancelled) return

        const seasonArr = Array.isArray(seasonRaw) ? seasonRaw : []
        const sorted = sortSeasons(seasonArr)
        const { current, prev } = deriveTeamSlugs(sorted)

        const seasonSeries = aggregateSeasonGoalsAssists(seasonArr)
        const yearlySeries = normalizeYearlyData(Array.isArray(yearlyRaw) ? yearlyRaw : [])

        setState({
          loading: false,
          error: null,
          player: Array.isArray(playersRaw) && playersRaw.length > 0 ? playersRaw[0] : null,
          currentTeamSlug: current,
          prevTeamSlug: prev,
          transfers: Array.isArray(transfersRaw) ? transfersRaw : [],
          seasonSeries,
          yearlySeries,
          clubTrophies: Array.isArray(clubT) ? clubT.length : 0,
          intTrophies: Array.isArray(intT) ? intT.length : 0,
          awardsTotal: totalAwards(Array.isArray(awardsRaw) ? awardsRaw : []),
        })
      } catch {
        if (cancelled) return
        setState({ ...initial, loading: false, error: 'Could not load dashboard data' })
      }
    }

    load()
    return () => { cancelled = true }
  }, [tick])

  return { ...state, refresh }
}
