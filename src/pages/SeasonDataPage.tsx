import { useState } from 'react'
import {
  CLUB_COMPETITION_IMAGES,
  CLUB_TROPHY_IMAGES,
  getAwardImage,
  INT_COMPETITION_IMAGES,
  INT_TROPHY_IMAGES,
  TEAM_IMAGES,
} from '../config/seasonAssets'
import {
  CLUB_TROPHIES,
  COMMON_AWARDS,
  INT_COMPETITIONS,
  INT_TROPHIES,
  SEASON_REGEX,
  LEAGUES_WITH_TEAMS,
  TEAMS_SORTED_BY_LEAGUE,
  TEAM_CLUB_COMPETITIONS,
  TEAM_CLUB_TROPHIES,
} from '../config/seasonDataConfig'
import type {
  ClubCompetitionId,
  ClubTrophyId,
  IntCompetitionId,
  IntTrophyId,
  TeamSlug,
} from '../config/seasonDataConfig'
import { apiUrl } from '../lib/api'

const STEPS = [
  'Team',
  'Season',
  'Club Competitions',
  'Club Trophies',
  'International',
  'Int. Trophies',
  'Awards',
]

type ClubCompetitionRow = {
  competition: ClubCompetitionId
  apps: number
  goals: number
  assists: number
  avgrating: number
}

type IntCompetitionRow = {
  competition: IntCompetitionId
  apps: number
  goals: number
  assists: number
  avgrating: number
}

type AwardRow = { award: string; quantity: number }

async function postJson(url: string, body: object) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export default function SeasonDataPage() {
  const [step, setStep] = useState(0)
  const [team, setTeam] = useState<TeamSlug | ''>('')
  const [season, setSeason] = useState('')
  const [seasonError, setSeasonError] = useState('')
  const [clubRows, setClubRows] = useState<ClubCompetitionRow[]>([])
  const [clubTrophies, setClubTrophies] = useState<ClubTrophyId[]>([])
  const [intRows, setIntRows] = useState<IntCompetitionRow[]>(() =>
    INT_COMPETITIONS.map((c) => ({
      competition: c.id,
      apps: 0,
      goals: 0,
      assists: 0,
      avgrating: 0,
    }))
  )
  const [intTrophies, setIntTrophies] = useState<IntTrophyId[]>([])
  const [awards, setAwards] = useState<AwardRow[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const clubComps = team ? (TEAM_CLUB_COMPETITIONS[team] ?? []) : []

  const initClubRows = (selectedTeam: TeamSlug) => {
    const comps = TEAM_CLUB_COMPETITIONS[selectedTeam] ?? []
    setClubRows(
      comps.map((c) => ({
        competition: c.id,
        apps: 0,
        goals: 0,
        assists: 0,
        avgrating: 0,
      }))
    )
  }

  const handleTeamSelect = (t: TeamSlug) => {
    setTeam(t)
    initClubRows(t)
  }

  const handleNext = () => {
    if (step === 1) {
      const valid = SEASON_REGEX.test(season.trim())
      if (!valid) {
        setSeasonError('Use format XXXX/XX (e.g. 2024/25)')
        return
      }
      setSeasonError('')
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handlePrev = () => setStep((s) => Math.max(s - 1, 0))

  const updateClubRow = (idx: number, field: keyof ClubCompetitionRow, value: number) => {
    setClubRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    )
  }

  const updateIntRow = (idx: number, field: keyof IntCompetitionRow, value: number) => {
    setIntRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    )
  }

  const toggleClubTrophy = (id: ClubTrophyId) => {
    setClubTrophies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleIntTrophy = (id: IntTrophyId) => {
    setIntTrophies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const addAward = () => setAwards((a) => [...a, { award: '', quantity: 1 }])
  const removeAward = (idx: number) => setAwards((a) => a.filter((_, i) => i !== idx))
  const updateAward = (idx: number, field: 'award' | 'quantity', value: string | number) => {
    setAwards((a) =>
      a.map((x, i) =>
        i === idx
          ? { ...x, [field]: field === 'quantity' ? Number(value) || 0 : value }
          : x
      )
    )
  }

  const handleSave = async () => {
    if (!team || !season.trim()) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const base = { season: season.trim(), team }
      for (const row of clubRows) {
        if (row.apps > 0 || row.goals > 0 || row.assists > 0 || row.avgrating > 0) {
          await postJson(apiUrl('/api/season_data'), { ...base, ...row })
        }
      }
      for (const t of clubTrophies) {
        await postJson(apiUrl('/api/season_trophies'), { season: season.trim(), competition: t })
      }
      for (const row of intRows) {
        if (row.apps > 0 || row.goals > 0 || row.assists > 0 || row.avgrating > 0) {
          await postJson(apiUrl('/api/int_data'), { season: season.trim(), ...row })
        }
      }
      for (const t of intTrophies) {
        await postJson(apiUrl('/api/int_trophies'), { season: season.trim(), competition: t })
      }
      for (const a of awards) {
        if (a.award.trim()) {
          await postJson(apiUrl('/api/season_awards'), {
            season: season.trim(),
            award: a.award.trim(),
            quantity: a.quantity,
          })
        }
      }
      setSaveSuccess(true)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const progressPct = ((step + 1) / STEPS.length) * 100
  const selectedTeamLabel = TEAMS_SORTED_BY_LEAGUE.find((t) => t.id === team)?.label
  const showContext = team && season.trim() && !saveSuccess

  const resetForNewSeason = () => {
    setSaveSuccess(false)
    setSeason('')
    setClubTrophies([])
    setIntTrophies([])
    setAwards([])
    setSaveError(null)
    if (team) initClubRows(team)
    setIntRows(
      INT_COMPETITIONS.map((c) => ({
        competition: c.id,
        apps: 0,
        goals: 0,
        assists: 0,
        avgrating: 0,
      }))
    )
    setStep(1) // Back to Season step (keep team, enter new season)
  }

  return (
    <section className="dash-view dash-season-data">
      <header className="season-page-header">
        <span className="season-eyebrow">Career data</span>
        <h1 className="season-page-title">Season data</h1>
        <p className="season-page-desc">
          Walk through each step to record club stats, trophies, international play, and awards for one season.
        </p>
        {showContext && (
          <div className="season-context-pill" role="status">
            {TEAM_IMAGES[team] && (
              <img src={TEAM_IMAGES[team]} alt="" className="season-context-img" width={28} height={28} />
            )}
            <span className="season-context-text">{selectedTeamLabel} · {season.trim()}</span>
          </div>
        )}
        <div className="season-progress" aria-hidden>
          <div className="season-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="season-progress-label">
          Step <strong>{step + 1}</strong> of {STEPS.length}
          <span className="season-progress-name"> · {STEPS[step]}</span>
        </p>
      </header>

      <div className="season-stepper-wrap">
        <div className="season-stepper">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={
                'season-step' +
                (step === i ? ' season-step--active' : '') +
                (i < step ? ' season-step--done' : '')
              }
              onClick={() => setStep(i)}
            >
              <span className="season-step-num">{i < step ? '✓' : i + 1}</span>
              <span className="season-step-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="season-main-card">
      <div className="season-content">
        {step === 0 && (
          <div className="season-step-panel">
            <h3 className="season-panel-title">Choose your club</h3>
            <p className="season-panel-sub muted-text">Pick the team this season belongs to.</p>
            <div className="season-teams-by-league">
              {LEAGUES_WITH_TEAMS.map(({ leagueName, teams }) => (
                <div key={leagueName} className="season-league-section">
                  <h4 className="season-league-name">{leagueName}</h4>
                  <div className="season-team-grid">
                    {teams.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={'season-team-btn' + (team === t.id ? ' season-team-btn--active' : '')}
                        onClick={() => handleTeamSelect(t.id)}
                      >
                        {TEAM_IMAGES[t.id] && (
                          <img src={TEAM_IMAGES[t.id]} alt="" className="season-item-img" width={48} height={48} />
                        )}
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="season-step-panel season-step-panel--center">
            {team && (
              <div className="season-step-team-badge">
                {TEAM_IMAGES[team] && (
                  <img src={TEAM_IMAGES[team]} alt="" className="season-item-img" width={56} height={56} />
                )}
                <span className="season-step-team-label">{selectedTeamLabel}</span>
              </div>
            )}
            <h3 className="season-panel-title">Which season?</h3>
            <p className="season-panel-sub muted-text">Use the format <code className="season-code">XXXX/XX</code> — e.g. 2024/25</p>
            <div className="season-field-wrap">
              <input
                type="text"
                className="season-input season-input--large"
                placeholder="2024/25"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }}
                maxLength={7}
                autoComplete="off"
                spellCheck={false}
              />
              {seasonError && <p className="season-error">{seasonError}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="season-step-panel">
            <h3 className="season-panel-title">Club competitions</h3>
            <p className="season-panel-sub muted-text">
              Enter stats for each competition {team ? `(${TEAMS_SORTED_BY_LEAGUE.find((t) => t.id === team)?.label})` : ''}
            </p>
            <div className="season-comp-grid">
              {clubRows.map((row, i) => (
                <div key={row.competition} className="season-comp-card">
                  <div className="season-comp-header">
                    <img
                      src={CLUB_COMPETITION_IMAGES[row.competition]}
                      alt=""
                      className="season-comp-logo"
                    />
                    <span className="season-comp-name">{clubComps.find((c) => c.id === row.competition)?.label}</span>
                  </div>
                  <div className="season-comp-stats">
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Apps</span>
                      <input
                        type="number"
                        min={0}
                        value={row.apps || ''}
                        onChange={(e) => updateClubRow(i, 'apps', parseInt(e.target.value, 10) || 0)}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Goals</span>
                      <input
                        type="number"
                        min={0}
                        value={row.goals || ''}
                        onChange={(e) => updateClubRow(i, 'goals', parseInt(e.target.value, 10) || 0)}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Assists</span>
                      <input
                        type="number"
                        min={0}
                        value={row.assists || ''}
                        onChange={(e) => updateClubRow(i, 'assists', parseInt(e.target.value, 10) || 0)}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Rating</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.avgrating || ''}
                        onChange={(e) => updateClubRow(i, 'avgrating', parseFloat(e.target.value) || 0)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="season-step-panel">
            <h3 className="season-panel-title">Club trophies won</h3>
            <p className="season-panel-sub muted-text">
              Select trophies won this season.
              <span className="season-optional-hint"> Skip if none.</span>
            </p>
            <div className="season-check-grid">
              {(team ? (TEAM_CLUB_TROPHIES[team] ?? []).map((id) => CLUB_TROPHIES.find((c) => c.id === id)!)
                : CLUB_TROPHIES).filter(Boolean).map((t) => (
                <label key={t.id} className={'season-check-card' + (clubTrophies.includes(t.id) ? ' season-check-card--on' : '')}>
                  <input
                    type="checkbox"
                    className="season-check-input"
                    checked={clubTrophies.includes(t.id)}
                    onChange={() => toggleClubTrophy(t.id)}
                  />
                  <img src={CLUB_TROPHY_IMAGES[t.id]} alt="" className="season-item-img" width={36} height={36} />
                  <span className="season-check-text">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="season-step-panel">
            <h3 className="season-panel-title">International competitions</h3>
            <p className="season-panel-sub muted-text">
              Enter stats for national team competitions.
              <span className="season-optional-hint"> Leave blank if you didn&apos;t play internationally.</span>
            </p>
            <div className="season-comp-grid">
              {intRows.map((row, i) => (
                <div key={row.competition} className="season-comp-card">
                  <div className="season-comp-header">
                    <img
                      src={INT_COMPETITION_IMAGES[row.competition]}
                      alt=""
                      className="season-comp-logo"
                    />
                    <span className="season-comp-name">{INT_COMPETITIONS.find((c) => c.id === row.competition)?.label}</span>
                  </div>
                  <div className="season-comp-stats">
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Apps</span>
                      <input
                        type="number"
                        min={0}
                        value={row.apps || ''}
                        onChange={(e) => updateIntRow(i, 'apps', parseInt(e.target.value, 10) || 0)}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Goals</span>
                      <input
                        type="number"
                        min={0}
                        value={row.goals || ''}
                        onChange={(e) => updateIntRow(i, 'goals', parseInt(e.target.value, 10) || 0)}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Assists</span>
                      <input
                        type="number"
                        min={0}
                        value={row.assists || ''}
                        onChange={(e) => updateIntRow(i, 'assists', parseInt(e.target.value, 10) || 0)}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Rating</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.avgrating || ''}
                        onChange={(e) => updateIntRow(i, 'avgrating', parseFloat(e.target.value) || 0)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="season-step-panel">
            <h3 className="season-panel-title">International trophies won</h3>
            <p className="season-panel-sub muted-text">
              Select international trophies won this season.
              <span className="season-optional-hint"> Skip if none.</span>
            </p>
            <div className="season-check-grid">
              {INT_TROPHIES.map((t) => (
                <label key={t.id} className={'season-check-card' + (intTrophies.includes(t.id) ? ' season-check-card--on' : '')}>
                  <input
                    type="checkbox"
                    className="season-check-input"
                    checked={intTrophies.includes(t.id)}
                    onChange={() => toggleIntTrophy(t.id)}
                  />
                  <img src={INT_TROPHY_IMAGES[t.id]} alt="" className="season-item-img" width={36} height={36} />
                  <span className="season-check-text">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="season-step-panel">
            <h3 className="season-panel-title">Awards</h3>
            <p className="season-panel-sub muted-text">
              Add any individual awards received this season.
              <span className="season-optional-hint"> Skip if none.</span>
            </p>
            <div className="season-awards-list">
              {awards.map((a, i) => {
                const awardImg = getAwardImage(a.award)
                return (
                <div key={i} className="season-award-card">
                  {awardImg && (
                    <img src={awardImg} alt="" className="season-item-img" width={36} height={36} />
                  )}
                  <span className="season-award-fields">
                    <input
                      type="text"
                      className="season-award-input"
                      list="awards-list"
                      placeholder="Award name"
                      value={a.award}
                      onChange={(e) => updateAward(i, 'award', e.target.value)}
                    />
                    <span className="season-award-qty-wrap">
                      <label className="season-award-qty-label">Qty</label>
                      <input
                        type="number"
                        min={1}
                        className="season-award-qty"
                        value={a.quantity}
                        onChange={(e) => updateAward(i, 'quantity', e.target.value)}
                      />
                    </span>
                  </span>
                  <button type="button" className="season-award-remove" onClick={() => removeAward(i)}>
                    Remove
                  </button>
                </div>
                )
              })}
              <datalist id="awards-list">
                {COMMON_AWARDS.map((aw) => (
                  <option key={aw} value={aw} />
                ))}
              </datalist>
              {awards.length === 0 && (
                <p className="season-awards-empty muted-text">No awards added yet.</p>
              )}
              <button type="button" className="season-btn season-btn--add" onClick={addAward}>
                + Add award
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="season-actions">
        {step > 0 ? (
          <button type="button" className="season-btn season-btn--back" onClick={handlePrev}>
            ← Back
          </button>
        ) : (
          <span className="season-actions-spacer" />
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="season-btn season-btn--next"
            onClick={handleNext}
            disabled={step === 0 && !team}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="season-btn season-btn--save"
            onClick={handleSave}
            disabled={saving || !team || !season.trim()}
          >
            {saving ? 'Saving…' : 'Save season data'}
          </button>
        )}
      </div>
      </div>

      {saveError && (
        <div className="season-alert season-alert--error" role="alert">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="season-alert season-alert--success season-alert--with-action" role="status">
          <span>Season data saved successfully.</span>
          <button type="button" className="season-btn season-btn--outline" onClick={resetForNewSeason}>
            Add another season
          </button>
        </div>
      )}
    </section>
  )
}
