import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export type DataEntryStatus = {
  seasonCount: number
  yearCount: number
  maxSeasons: number
  maxYears: number
  seasonCapReached: boolean
  yearCapReached: boolean
  existingSeasons: string[]
  loading: boolean
  error: string | null
  refresh: () => void
}

const FALLBACK = {
  maxSeasons: 15,
  maxYears: 16,
}

export function useDataEntryStatus(): DataEntryStatus {
  const [seasonCount, setSeasonCount] = useState(0)
  const [yearCount, setYearCount] = useState(0)
  const [maxSeasons, setMaxSeasons] = useState(FALLBACK.maxSeasons)
  const [maxYears, setMaxYears] = useState(FALLBACK.maxYears)
  const [seasonCapReached, setSeasonCapReached] = useState(false)
  const [yearCapReached, setYearCapReached] = useState(false)
  const [existingSeasons, setExistingSeasons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch('/api/data_entry_status')
        if (!res.ok) throw new Error('Could not load data limits')
        const j = (await res.json()) as Record<string, unknown>
        if (cancelled) return
        setSeasonCount(Number(j.seasonCount) || 0)
        setYearCount(Number(j.yearCount) || 0)
        setMaxSeasons(Number(j.maxSeasons) || FALLBACK.maxSeasons)
        setMaxYears(Number(j.maxYears) || FALLBACK.maxYears)
        setSeasonCapReached(Boolean(j.seasonCapReached))
        setYearCapReached(Boolean(j.yearCapReached))
        setExistingSeasons(Array.isArray(j.existingSeasons) ? (j.existingSeasons as string[]) : [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
          setSeasonCapReached(false)
          setYearCapReached(false)
          setExistingSeasons([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tick])

  return {
    seasonCount,
    yearCount,
    maxSeasons,
    maxYears,
    seasonCapReached,
    yearCapReached,
    existingSeasons,
    loading,
    error,
    refresh,
  }
}
