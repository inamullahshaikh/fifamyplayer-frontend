import { useEffect, useState } from 'react'
import { useCareer } from '../career/CareerContext'
import {
  bestPerformances,
  clubStats,
  intStats,
  overviewStats,
  statsByCompetition,
  statsBySeason,
  statsBySeasonWithBreakdown,
  statsByTeamWithBreakdown,
  statsByYear,
} from '../lib/statsAggregates'
import type { IntDataRow, SeasonDataRow, TrophyRow, YearlyDataRow } from '../types/dashboard'
import { apiFetch } from '../lib/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url)
  if (!res.ok) throw new Error('Request failed')
  return res.json() as Promise<T>
}

export type StatsApiState = {
  loading: boolean
  error: string | null
  clubData: SeasonDataRow[]
  intData: IntDataRow[]
  yearlyData: YearlyDataRow[]
  clubTrophies: TrophyRow[]
  intTrophies: TrophyRow[]
  overview: { apps: number; goals: number; assists: number; avgrating?: number }
  club: { apps: number; goals: number; assists: number; avgrating?: number }
  international: { apps: number; goals: number; assists: number; avgrating?: number }
  bySeason: { season: string; apps: number; goals: number; assists: number; avgrating?: number }[]
  bySeasonWithBreakdown: import('../lib/statsAggregates').SeasonBreakdown[]
  byYear: { year: string; goals: number; assists: number }[]
  best: ReturnType<typeof bestPerformances>
  byCompetition: { competition: string; apps: number; goals: number; assists: number; avgrating?: number }[]
  byTeam: import('../lib/statsAggregates').TeamWithBreakdown[]
}

export function useStatsApi(): StatsApiState {
  const { activeCareerPlayerId } = useCareer()
  const [state, setState] = useState<StatsApiState>({
    loading: true,
    error: null,
    clubData: [],
    intData: [],
    yearlyData: [],
    clubTrophies: [],
    intTrophies: [],
    overview: { apps: 0, goals: 0, assists: 0 },
    club: { apps: 0, goals: 0, assists: 0 },
    international: { apps: 0, goals: 0, assists: 0 },
    bySeason: [],
    bySeasonWithBreakdown: [],
    byYear: [],
    best: {} as ReturnType<typeof bestPerformances>,
    byCompetition: [],
    byTeam: [],
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const [clubRaw, intRaw, yearlyRaw, clubT, intT] = await Promise.all([
          fetchJson<SeasonDataRow[]>('/api/season_data'),
          fetchJson<IntDataRow[]>('/api/int_data'),
          fetchJson<YearlyDataRow[]>('/api/yearly_data'),
          fetchJson<TrophyRow[]>('/api/season_trophies'),
          fetchJson<TrophyRow[]>('/api/int_trophies'),
        ])

        if (cancelled) return

        const clubData = Array.isArray(clubRaw) ? clubRaw : []
        const intData = Array.isArray(intRaw) ? intRaw : []
        const yearlyData = Array.isArray(yearlyRaw) ? yearlyRaw : []
        setState({
          loading: false,
          error: null,
          clubData,
          intData,
          yearlyData,
          clubTrophies: Array.isArray(clubT) ? clubT : [],
          intTrophies: Array.isArray(intT) ? intT : [],
          overview: overviewStats(clubData, intData),
          club: clubStats(clubData),
          international: intStats(intData),
          bySeason: statsBySeason(clubData, intData),
          bySeasonWithBreakdown: statsBySeasonWithBreakdown(clubData, intData),
          byYear: statsByYear(yearlyData),
          best: bestPerformances(clubData, intData, yearlyData),
          byCompetition: statsByCompetition(clubData, intData),
          byTeam: statsByTeamWithBreakdown(clubData),
        })
      } catch (e) {
        if (cancelled) return
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Could not load stats',
        }))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [activeCareerPlayerId])

  return state
}
