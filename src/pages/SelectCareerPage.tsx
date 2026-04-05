import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCareer } from '../career/CareerContext'
import ThemeToggle from '../components/ThemeToggle'
import footballLogo from '../assets/images/football.png'
import { getNationalityLabel } from '../config/nationalities'
import { apiFetch, publicUploadUrl } from '../lib/api'
import { careerMatchesQuery } from '../lib/careerFilter'
import { playerInitials } from '../lib/playerInitials'
import { postCareerDestination } from '../lib/postCareerDestination'

export default function SelectCareerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const { players, loading, error, refreshPlayers, setActiveCareerPlayer, activeCareerPlayerId } =
    useCareer()

  const from = (location.state as { from?: string } | null)?.from
  const destination = postCareerDestination(from)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [continuing, setContinuing] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return players
    return players.filter((p) => careerMatchesQuery(p, q))
  }, [players, searchQuery])

  useEffect(() => {
    if (players.length === 0) {
      setSelectedId(null)
      return
    }
    setSelectedId((prev) => {
      if (prev && players.some((p) => String(p._id) === prev)) return prev
      const active =
        activeCareerPlayerId && players.some((p) => String(p._id) === activeCareerPlayerId)
          ? activeCareerPlayerId
          : null
      return active || String(players[0]._id)
    })
  }, [players, activeCareerPlayerId])

  useEffect(() => {
    if (filteredPlayers.length === 0) return
    setSelectedId((prev) => {
      if (prev && filteredPlayers.some((p) => String(p._id) === prev)) return prev
      return String(filteredPlayers[0]._id)
    })
  }, [filteredPlayers])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleContinue = async () => {
    if (!selectedId) return
    setLocalError(null)
    setContinuing(true)
    try {
      await setActiveCareerPlayer(selectedId)
      navigate(destination, { replace: true })
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Could not continue')
    } finally {
      setContinuing(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setCreating(true)
    try {
      const res = await apiFetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() || 'New career' }),
      })
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(b.error || 'Could not create career')
      }
      const doc = (await res.json()) as { _id?: string }
      setNewName('')
      await refreshPlayers()
      if (doc._id) setSelectedId(String(doc._id))
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Could not create career')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="auth-root career-select-root">
      <header className="auth-nav career-select-nav">
        <Link to="/" className="auth-nav-logo">
          <img src={footballLogo} alt="" className="auth-nav-logo-img" />
          <span>VirtualXI</span>
        </Link>
        <div className="career-select-nav-tools">
          <span className="career-select-user" title={user?.username}>
            {user?.username}
          </span>
          <ThemeToggle buttonClassName="auth-nav-theme" />
          <button type="button" className="career-select-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="career-select-main">
        <div className="career-select-card">
          <p className="career-select-eyebrow">Choose your career</p>
          <h1 className="career-select-title">Which player are you tracking?</h1>
          <p className="career-select-desc">
            Each profile is a separate FIFA career. Pick one to open the hub, or create another
            pro.
          </p>

          {(error || localError) && (
            <div className="auth-error-box career-select-error" role="alert">
              {localError || error}
            </div>
          )}

          {loading ? (
            <p className="career-select-muted">Loading your careers…</p>
          ) : players.length === 0 ? (
            <p className="career-select-muted">
              You don&apos;t have a career profile yet. Create one below to get started.
            </p>
          ) : (
            <>
              <div className="career-select-search-wrap">
                <label className="career-select-search-label" htmlFor="career-select-search">
                  Search careers
                </label>
                <input
                  id="career-select-search"
                  type="search"
                  className="career-select-search-input auth-input"
                  placeholder="Name, position, country, OVR, value…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  enterKeyHint="search"
                />
              </div>
              {filteredPlayers.length === 0 ? (
                <p className="career-select-muted career-select-no-match">
                  No careers match &ldquo;{searchQuery.trim()}&rdquo;. Try another term or clear the
                  search.
                </p>
              ) : (
                <ul className="career-select-list" role="listbox" aria-label="Your careers">
                  {filteredPlayers.map((p) => {
                    const id = String(p._id)
                    const selected = selectedId === id
                    const avatarSrc = publicUploadUrl(p.avatarUrl)
                    const displayName = p.name?.trim() ? String(p.name).trim() : 'Unnamed career'
                    const natRaw = p.nationality ? String(p.nationality).trim() : ''
                    const natCode = /^[a-z]{2}$/i.test(natRaw) ? natRaw.toUpperCase() : ''
                    const natLabel = natRaw ? getNationalityLabel(natRaw) : ''
                    const displayNat =
                      natLabel && natCode && natLabel !== natCode
                        ? `${natLabel} (${natCode})`
                        : natLabel || natCode
                    const rating =
                      p.rating != null && String(p.rating).trim() !== '' ? String(p.rating) : null
                    const valueNum =
                      p.value != null && p.value !== ''
                        ? Number(p.value)
                        : Number.NaN
                    const valueOk = Number.isFinite(valueNum)
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={
                            'career-select-item' + (selected ? ' career-select-item--active' : '')
                          }
                          onClick={() => setSelectedId(id)}
                        >
                          <span className="career-select-item-avatar-wrap">
                            {avatarSrc ? (
                              <img
                                className="career-select-item-avatar"
                                src={avatarSrc}
                                alt=""
                                width={56}
                                height={56}
                                decoding="async"
                              />
                            ) : (
                              <span
                                className="career-select-item-avatar-fallback"
                                aria-hidden
                              >
                                {playerInitials(displayName)}
                              </span>
                            )}
                          </span>
                          <span className="career-select-item-body">
                            <span className="career-select-item-name">{displayName}</span>
                            <span className="career-select-item-meta">
                              {[p.position, displayNat].filter(Boolean).join(' · ') ||
                                'Add position & nationality on the hub'}
                            </span>
                            <span className="career-select-item-chips">
                              {rating ? (
                                <span className="career-select-chip career-select-chip--ovr">
                                  OVR <strong>{rating}</strong>
                                </span>
                              ) : null}
                              {valueOk ? (
                                <span className="career-select-chip">
                                  Value <strong>€{valueNum.toLocaleString()}</strong>
                                </span>
                              ) : null}
                              {p.retired ? (
                                <span className="career-select-chip career-select-chip--retired">
                                  Retired
                                </span>
                              ) : null}
                              {!rating && !valueOk && !p.retired ? (
                                <span className="career-select-chip career-select-chip--muted">
                                  Stats on hub
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}

          <div className="career-select-actions">
            <button
              type="button"
              className="auth-btn career-select-continue"
              disabled={
                !selectedId ||
                loading ||
                continuing ||
                (players.length > 0 && filteredPlayers.length === 0)
              }
              onClick={handleContinue}
            >
              {continuing ? 'Opening…' : 'Continue to hub'}
            </button>
            {from && destination !== '/dashboard' ? (
              <p className="career-select-dest-hint">
                You&apos;ll go to{' '}
                <span className="career-select-dest-path">{destination}</span> after continuing.
              </p>
            ) : null}
          </div>

          <div className="career-select-divider" aria-hidden />

          <section className="career-select-create" aria-labelledby="career-create-heading">
            <h2 id="career-create-heading" className="career-select-create-title">
              New career
            </h2>
            <p className="career-select-create-desc">
              Add another created player — same account, separate stats and trophies.
            </p>
            <form className="career-select-create-form" onSubmit={handleCreate}>
              <label className="auth-field-label" htmlFor="career-new-name">
                Display name
              </label>
              <input
                id="career-new-name"
                className="auth-input career-select-create-input"
                type="text"
                placeholder="e.g. Marco Reus regen"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="auth-btn auth-btn--outline career-select-create-btn"
                disabled={creating || loading}
              >
                {creating ? 'Creating…' : 'Create career'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
