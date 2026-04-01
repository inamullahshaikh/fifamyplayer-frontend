import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

type Player = {
  _id: string
  name: string
  rating: string
  nationality: string
  position: string
  value: number
}

export default function DashboardSection() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true)
        setError(null)

        const res = await apiFetch('/api/players')
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)

        const data = (await res.json()) as Player[]
        setPlayers(Array.isArray(data) ? data : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load players')
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  return (
    <section className="dashboard" id="dashboard">
      <div className="dashboard-back">
        <Link to="/" className="btn-ghost">
          ← Back to landing
        </Link>
      </div>

      <p className="section-eyebrow">Dashboard</p>
      <h2 className="section-heading">Your VirtualXI career hub</h2>
      <p className="section-sub">
        Quick preview of the player profiles stored in your backend. Season
        stats, trophies and transfers will be added next.
      </p>

      {loading && <p className="muted-text">Loading players…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="players-grid">
          {players.map((p) => (
            <div key={p._id} className="player-card">
              <div className="player-name">{p.name}</div>
              <div className="player-sub">
                {p.position} • Rating {p.rating}
              </div>
              <div className="player-meta">Nationality: {p.nationality}</div>
              <div className="player-meta">Value: {p.value}</div>
            </div>
          ))}

          {players.length === 0 && <p className="muted-text">No players found.</p>}
        </div>
      )}
    </section>
  )
}

