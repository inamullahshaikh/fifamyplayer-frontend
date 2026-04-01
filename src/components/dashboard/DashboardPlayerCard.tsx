import { useEffect, useState } from 'react'
import playerPhoto from '../../assets/images/Inam.png'
import { TEAM_IMAGES, getNationImage } from '../../config/seasonAssets'
import { NATIONALITY_OPTIONS, getNationalityLabel, toNationalityCode } from '../../config/nationalities'
import { TEAM_LABELS, toTeamSlug } from '../../config/seasonDataConfig'
import { apiFetch } from '../../lib/api'
import type { PlayerRow, TransferRow } from '../../types/dashboard'

type Props = {
  player: PlayerRow | null
  currentTeamSlug: string | null
  prevTeamSlug: string | null
  transfers: TransferRow[]
  loading: boolean
  onRefresh: () => void
}

function Skeleton({ w = '60%' }: { w?: string }) {
  return (
    <span
      className="dash-skeleton"
      style={{ display: 'inline-block', width: w, height: '1em', borderRadius: 6 }}
      aria-hidden
    />
  )
}

export default function DashboardPlayerCard({
  player,
  currentTeamSlug,
  prevTeamSlug,
  transfers,
  loading,
  onRefresh,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    position: '',
    rating: '',
    value: '',
    nationality: '',
    retired: false,
  })

  useEffect(() => {
    setForm({
      name: player?.name ? String(player.name) : '',
      position: player?.position ? String(player.position) : '',
      rating: player?.rating != null ? String(player.rating) : '',
      value: player?.value != null ? String(player.value) : '',
      nationality: player?.nationality ? getNationalityLabel(String(player.nationality)) : '',
      retired: Boolean(player?.retired),
    })
  }, [player])

  const isRetired = editing ? form.retired : Boolean(player?.retired)
  const shownNationality = editing ? form.nationality : player?.nationality
  const nationImg = shownNationality ? getNationImage(shownNationality) : undefined
  const retiredPrevSlug = [...transfers]
    .sort((a, b) => {
      const ya = parseInt(String(a.season ?? '0').split('/')[0], 10)
      const yb = parseInt(String(b.season ?? '0').split('/')[0], 10)
      return yb - ya
    })
    .map((t) => (t.to ? toTeamSlug(String(t.to)) : null))
    .find((s): s is string => Boolean(s)) ?? null
  const effectivePrevSlug = isRetired ? (retiredPrevSlug ?? prevTeamSlug) : prevTeamSlug
  const currentTeamImg = currentTeamSlug ? TEAM_IMAGES[currentTeamSlug] : undefined
  const prevTeamImg = effectivePrevSlug ? TEAM_IMAGES[effectivePrevSlug] : undefined
  const currentTeamLabel = currentTeamSlug ? (TEAM_LABELS[currentTeamSlug] ?? currentTeamSlug) : null
  const prevTeamLabel = effectivePrevSlug ? (TEAM_LABELS[effectivePrevSlug] ?? effectivePrevSlug) : null

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const nationalityRaw = form.nationality.trim()
      const nationalityCode = toNationalityCode(nationalityRaw)
      const payload = {
        name: form.name.trim(),
        position: form.position.trim(),
        rating: form.rating.trim(),
        value: form.value.trim() ? Number(form.value) : 0,
        nationality: nationalityCode ?? nationalityRaw,
        retired: form.retired,
      }

      const isUpdate = Boolean(player?._id)
      const res = await apiFetch(isUpdate ? `/api/players/${player?._id}` : '/api/players', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      setEditing(false)
      onRefresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dash-player-card">
      <div className="dash-player-avatar">
        <img
          className="dash-player-avatar-img"
          src={playerPhoto}
          alt={player?.name ?? 'Player'}
          width={96}
          height={96}
          decoding="async"
        />
      </div>

      <div className="dash-player-body">
        <div className="dash-player-top">
          <h2 className="dash-player-name">
            {loading ? (
              <Skeleton w="180px" />
            ) : editing ? (
              <input
                className="dash-player-edit-input"
                placeholder={player?.name ? String(player.name) : 'Player name'}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            ) : (
              player?.name ?? '—'
            )}
          </h2>
          {!loading && isRetired && <span className="dash-player-retired-pill">Retired</span>}
          {!isRetired && (
            <p className="dash-player-team">
              Current club:
              <strong className="dash-current-club-inline">
                {loading ? (
                  <Skeleton w="120px" />
                ) : (
                  <>
                    {currentTeamImg ? (
                      <img src={currentTeamImg} alt="" className="dash-current-club-logo" width={18} height={18} />
                    ) : null}
                    <span>{currentTeamLabel ?? 'Unknown'}</span>
                  </>
                )}
              </strong>
            </p>
          )}
        </div>

        <dl className="dash-player-metrics">
          <div className="dash-player-metric">
            <dt>Position</dt>
            <dd>
              {loading ? (
                <Skeleton w="40px" />
              ) : editing ? (
                <input
                  className="dash-player-edit-input"
                  placeholder={player?.position ? String(player.position) : 'Position'}
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                />
              ) : (
                player?.position ?? '—'
              )}
            </dd>
          </div>
          <div className="dash-player-metric">
            <dt>Overall</dt>
            <dd>
              {loading ? (
                <Skeleton w="40px" />
              ) : editing ? (
                <input
                  className="dash-player-edit-input"
                  placeholder={player?.rating != null ? String(player.rating) : 'Overall'}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                />
              ) : (
                player?.rating ?? '—'
              )}
            </dd>
          </div>
          <div className="dash-player-metric">
            <dt>Value</dt>
            <dd>
              {loading
                ? <Skeleton w="60px" />
                : editing ? (
                    <input
                      className="dash-player-edit-input"
                      placeholder={player?.value != null ? String(player.value) : 'Value'}
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    />
                  )
                  : player?.value != null
                    ? `€ ${Number(player.value).toLocaleString()}`
                    : '—'}
            </dd>
          </div>
        </dl>

        <div className="dash-player-badges">
          {!isRetired && (
            <div className="dash-player-badge">
              {currentTeamImg ? (
                <img src={currentTeamImg} alt="" className="dash-player-badge-img" width={40} height={40} />
              ) : (
                <div className="dash-player-badge-img dash-player-badge-placeholder" aria-hidden />
              )}
              <span className="dash-player-badge-content">
                <span className="dash-player-badge-caption">Current club</span>
                <span className="dash-player-badge-label">
                  {loading ? <Skeleton w="110px" /> : (currentTeamLabel ?? '—')}
                </span>
              </span>
            </div>
          )}

          {/* Nationality */}
          <div className="dash-player-badge">
            {nationImg ? (
              <img src={nationImg} alt="" className="dash-player-badge-img" width={40} height={40} />
            ) : (
              <div className="dash-player-badge-img dash-player-badge-placeholder" aria-hidden />
            )}
            <span className="dash-player-badge-content">
              <span className="dash-player-badge-caption">Nationality</span>
              <span className="dash-player-badge-label">
                {loading ? (
                  <Skeleton w="80px" />
                ) : editing ? (
                  <input
                    className="dash-player-edit-input"
                    placeholder={player?.nationality ? String(player.nationality) : 'Nationality (e.g. PK or Pakistan)'}
                    list="dash-nationality-options"
                    value={form.nationality}
                    onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                  />
                ) : (
                  (player?.nationality ? getNationalityLabel(String(player.nationality)) : '—')
                )}
              </span>
            </span>
          </div>

          {/* Previous team */}
          {(loading || effectivePrevSlug) && (
            <div className="dash-player-badge">
              {prevTeamImg ? (
                <img src={prevTeamImg} alt="" className="dash-player-badge-img" width={40} height={40} />
              ) : (
                <div className="dash-player-badge-img dash-player-badge-placeholder" aria-hidden />
              )}
              <span className="dash-player-badge-content">
                <span className="dash-player-badge-caption">Previous club</span>
                <span className="dash-player-badge-label">
                  {loading ? <Skeleton w="110px" /> : (prevTeamLabel ?? '—')}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="dash-player-edit-row">
          {!editing ? (
            <button type="button" className="dash-player-edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <div className="dash-player-edit-form">
              <label className="dash-player-retired-toggle" title="Toggle retired status">
                <input
                  type="checkbox"
                  className="dash-player-retired-toggle-input"
                  checked={form.retired}
                  onChange={(e) => setForm((f) => ({ ...f, retired: e.target.checked }))}
                />
                <span className="dash-player-retired-toggle-track" aria-hidden>
                  <span className="dash-player-retired-toggle-thumb" />
                </span>
                <span className="dash-player-retired-toggle-text">
                  {form.retired ? 'Player is retired' : 'Mark as retired'}
                </span>
              </label>
              <datalist id="dash-nationality-options">
                {NATIONALITY_OPTIONS.map((n) => (
                  <option key={n.code} value={n.name}>{`${n.name} (${n.code})`}</option>
                ))}
              </datalist>
              {error && <p className="dash-player-edit-error">{error}</p>}
              <div className="dash-player-edit-actions">
                <button type="button" className="dash-player-edit-btn" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="dash-player-edit-btn dash-player-edit-btn--primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
