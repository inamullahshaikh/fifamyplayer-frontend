import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  apiFetch,
  clearCareerIfUserMismatch,
  getActiveCareerPlayerId,
  setActiveCareerPlayerIdForUser,
} from '../lib/api'
import type { PlayerRow } from '../types/dashboard'

type CareerContextType = {
  players: PlayerRow[]
  activeCareerPlayerId: string | null
  loading: boolean
  error: string | null
  setActiveCareerPlayer: (id: string) => Promise<void>
  refreshPlayers: () => Promise<void>
}

const CareerContext = createContext<CareerContextType | null>(null)

export function CareerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [activeCareerPlayerId, setActiveCareerPlayerIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshPlayers = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/players')
      if (!res.ok) throw new Error('Failed to load careers')
      const list = (await res.json()) as PlayerRow[]
      const arr = Array.isArray(list) ? list : []
      setPlayers(arr)

      clearCareerIfUserMismatch(user.id)
      let id = getActiveCareerPlayerId()
      const valid = Boolean(id && arr.some((p) => String(p._id) === id))
      let needServerSync = false
      if (!valid) {
        id = arr[0]?._id ? String(arr[0]._id) : ''
        needServerSync = Boolean(id)
        if (id) setActiveCareerPlayerIdForUser(user.id, id)
      }
      setActiveCareerPlayerIdState(id || null)

      if (needServerSync && id) {
        await apiFetch('/api/me/active-career', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ careerPlayerId: id }),
        }).catch(() => {
          /* non-fatal */
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load careers')
      setPlayers([])
      setActiveCareerPlayerIdState(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPlayers([])
      setActiveCareerPlayerIdState(null)
      setError(null)
      return
    }
    void refreshPlayers()
  }, [isAuthenticated, user?.id, refreshPlayers])

  const setActiveCareerPlayer = useCallback(
    async (id: string) => {
      if (!user) return
      setActiveCareerPlayerIdForUser(user.id, id)
      setActiveCareerPlayerIdState(id)
      const res = await apiFetch('/api/me/active-career', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerPlayerId: id }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'Could not update active career')
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({
      players,
      activeCareerPlayerId,
      loading,
      error,
      setActiveCareerPlayer,
      refreshPlayers,
    }),
    [players, activeCareerPlayerId, loading, error, setActiveCareerPlayer, refreshPlayers],
  )

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>
}

export function useCareer() {
  const ctx = useContext(CareerContext)
  if (!ctx) throw new Error('useCareer must be used within CareerProvider')
  return ctx
}
