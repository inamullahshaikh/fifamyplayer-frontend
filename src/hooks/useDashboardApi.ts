import { useEffect, useState } from 'react'
import { aggregateSeasonGoalsAssists, normalizeYearlyData, totalAwards } from '../lib/dashboardAggregates'
import { apiUrl } from '../lib/api'
import type {
  AwardRow,
  SeasonChartPoint,
  SeasonDataRow,
  TrophyRow,
  YearlyChartPoint,
  YearlyDataRow,
} from '../types/dashboard'

export type DashboardApiState = {
  loading: boolean
  error: string | null
  seasonSeries: SeasonChartPoint[]
  yearlySeries: YearlyChartPoint[]
  clubTrophies: number
  intTrophies: number
  awardsTotal: number
}

const initial: DashboardApiState = {
  loading: true,
  error: null,
  seasonSeries: [],
  yearlySeries: [],
  clubTrophies: 0,
  intTrophies: 0,
  awardsTotal: 0,
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Request failed')
  return res.json() as Promise<T>
}

export function useDashboardApi(): DashboardApiState {
  const [state, setState] = useState<DashboardApiState>(initial)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const [seasonRaw, yearlyRaw, clubT, intT, awardsRaw] = await Promise.all([
          fetchJson<SeasonDataRow[]>(apiUrl('/api/season_data')),
          fetchJson<YearlyDataRow[]>(apiUrl('/api/yearly_data')),
          fetchJson<TrophyRow[]>(apiUrl('/api/season_trophies')),
          fetchJson<TrophyRow[]>(apiUrl('/api/int_trophies')),
          fetchJson<AwardRow[]>(apiUrl('/api/season_awards')),
        ])

        if (cancelled) return

        const seasonSeries = aggregateSeasonGoalsAssists(Array.isArray(seasonRaw) ? seasonRaw : [])
        const yearlySeries = normalizeYearlyData(Array.isArray(yearlyRaw) ? yearlyRaw : [])

        setState({
          loading: false,
          error: null,
          seasonSeries,
          yearlySeries,
          clubTrophies: Array.isArray(clubT) ? clubT.length : 0,
          intTrophies: Array.isArray(intT) ? intT.length : 0,
          awardsTotal: totalAwards(Array.isArray(awardsRaw) ? awardsRaw : []),
        })
      } catch (e: unknown) {
        if (cancelled) return
        setState({
          ...initial,
          loading: false,
          error: 'Could not load dashboard data',
        })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
