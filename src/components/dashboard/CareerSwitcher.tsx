import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCareer } from '../../career/CareerContext'
import { getNationalityLabel } from '../../config/nationalities'
import { careerMatchesQuery } from '../../lib/careerFilter'
import { publicUploadUrl } from '../../lib/api'
import { playerInitials } from '../../lib/playerInitials'
import { IconChevronDown } from './SidebarNavIcons'

function displayNationality(nationality: string | undefined): string {
  const natRaw = nationality ? String(nationality).trim() : ''
  const natCode = /^[a-z]{2}$/i.test(natRaw) ? natRaw.toUpperCase() : ''
  const natLabel = natRaw ? getNationalityLabel(natRaw) : ''
  if (natLabel && natCode && natLabel !== natCode) return `${natLabel} (${natCode})`
  return natLabel || natCode
}

export default function CareerSwitcher() {
  const { players, activeCareerPlayerId, loading, setActiveCareerPlayer } = useCareer()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [switchError, setSwitchError] = useState<string | null>(null)
  const [switchingId, setSwitchingId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const activeId = useMemo(() => {
    if (activeCareerPlayerId && players.some((p) => String(p._id) === activeCareerPlayerId)) {
      return activeCareerPlayerId
    }
    return players[0]?._id ? String(players[0]._id) : ''
  }, [players, activeCareerPlayerId])

  const activePlayer = useMemo(
    () => players.find((p) => String(p._id) === activeId),
    [players, activeId],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return players
    return players.filter((p) => careerMatchesQuery(p, q))
  }, [players, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSwitchError(null)
      return
    }
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const pickCareer = useCallback(
    async (id: string) => {
      if (id === activeId) {
        setOpen(false)
        return
      }
      setSwitchError(null)
      setSwitchingId(id)
      try {
        await setActiveCareerPlayer(id)
        setOpen(false)
      } catch (e) {
        setSwitchError(e instanceof Error ? e.message : 'Could not switch career')
      } finally {
        setSwitchingId(null)
      }
    },
    [activeId, setActiveCareerPlayer],
  )

  if (players.length === 0 && !loading) return null

  const displayName = activePlayer?.name?.trim()
    ? String(activePlayer.name).trim()
    : 'Career'
  const avatarUrl = activePlayer ? publicUploadUrl(activePlayer.avatarUrl) : ''

  return (
    <div className="dash-career-popover-root" ref={rootRef}>
      <button
        type="button"
        className={'dash-career-trigger' + (open ? ' dash-career-trigger--open' : '')}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="dash-career-switcher-panel"
        aria-label={
          players.length > 1
            ? `Switch career, ${displayName}, ${players.length} careers`
            : `Switch career, ${displayName}`
        }
        disabled={loading || players.length === 0}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="dash-career-trigger-avatar-wrap" aria-hidden>
          {avatarUrl ? (
            <img
              className="dash-career-trigger-avatar"
              src={avatarUrl}
              alt=""
              width={28}
              height={28}
              decoding="async"
            />
          ) : (
            <span className="dash-career-trigger-avatar-fallback">
              {playerInitials(displayName === 'Career' ? '' : displayName)}
            </span>
          )}
        </span>
        <span className="dash-career-trigger-label">
          <span className="dash-career-trigger-name">{displayName}</span>
          <span className="dash-career-trigger-hint">
            {players.length > 1 ? `${players.length} careers` : 'Active pro'}
          </span>
        </span>
        <span className={'dash-career-trigger-chevron' + (open ? ' dash-career-trigger-chevron--up' : '')}>
          <IconChevronDown className="dash-career-trigger-chevron-svg" />
        </span>
      </button>

      {open ? (
        <div
          id="dash-career-switcher-panel"
          className="dash-career-panel"
          role="listbox"
          aria-label="Switch active career"
        >
          <div className="dash-career-panel-head">
            <p className="dash-career-panel-title">Switch career</p>
            <input
              type="search"
              className="dash-career-panel-search"
              placeholder="Search by name, position, country…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Filter careers"
            />
          </div>
          {switchError ? (
            <p className="dash-career-panel-error" role="alert">
              {switchError}
            </p>
          ) : null}
          <div className="dash-career-panel-list-wrap">
            {filtered.length === 0 ? (
              <p className="dash-career-panel-empty">No matches. Try another search.</p>
            ) : (
              <ul className="dash-career-panel-list">
                {filtered.map((p) => {
                  const id = String(p._id)
                  const isActive = id === activeId
                  const busy = switchingId === id
                  const name = p.name?.trim() ? String(p.name).trim() : 'Unnamed career'
                  const url = publicUploadUrl(p.avatarUrl)
                  const nat = displayNationality(p.nationality)
                  const meta = [p.position, nat].filter(Boolean).join(' · ') || '—'
                  const rating =
                    p.rating != null && String(p.rating).trim() !== '' ? String(p.rating) : null
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={
                          'dash-career-row' + (isActive ? ' dash-career-row--active' : '')
                        }
                        disabled={busy}
                        onClick={() => void pickCareer(id)}
                      >
                        <span className="dash-career-row-avatar-wrap" aria-hidden>
                          {url ? (
                            <img
                              className="dash-career-row-avatar"
                              src={url}
                              alt=""
                              width={36}
                              height={36}
                              decoding="async"
                            />
                          ) : (
                            <span className="dash-career-row-avatar-fallback">
                              {playerInitials(name)}
                            </span>
                          )}
                        </span>
                        <span className="dash-career-row-body">
                          <span className="dash-career-row-name">{name}</span>
                          <span className="dash-career-row-meta">{meta}</span>
                          {rating ? (
                            <span className="dash-career-row-ovr">OVR {rating}</span>
                          ) : null}
                        </span>
                        {isActive ? (
                          <span className="dash-career-row-check" aria-hidden>
                            ✓
                          </span>
                        ) : busy ? (
                          <span className="dash-career-row-busy">…</span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="dash-career-panel-foot">
            <Link
              to="/select-career"
              className="dash-career-panel-link"
              onClick={() => setOpen(false)}
            >
              All careers &amp; new player
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
