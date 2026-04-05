import { useEffect, useMemo, useState } from 'react'
import {
  CLUB_COMPETITION_IMAGES,
  CLUB_TROPHY_IMAGES,
  getAwardImage,
  INT_COMPETITION_IMAGES,
  INT_TROPHY_IMAGES,
  TEAM_IMAGES,
} from '../config/seasonAssets'
import {
  awardUsesQuantity,
  CLUB_TROPHIES,
  getAwardSelectGroupsForTeam,
  INT_COMPETITIONS,
  INT_TROPHIES,
  isSelectableAwardForTeam,
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
import { apiFetch } from '../lib/api'
import { useDataEntryStatus } from '../hooks/useDataEntryStatus'
import DataCapNotice from '../components/DataCapNotice'
import { getConfederationByCode, getNationalityLabel, toNationalityCode } from '../config/nationalities'

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
type PlayerProfile = { _id?: string; nationality?: string }

async function postJson(url: string, body: object) {
  const res = await apiFetch(url, {
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

async function fetchJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}

const COMPETITION_SETS = {
  UEFA: ['friendly', 'wcq', 'wc', 'finalissima', 'euro', 'euq', 'unl'],
  CONMEBOL: ['friendly', 'wcq', 'wc', 'finalissima', 'copa-america', 'conmebol-qualifiers'],
  CONCACAF: ['friendly', 'wcq', 'wc', 'gold-cup', 'concacaf-nations-league'],
  AFC: ['friendly', 'wcq', 'wc', 'asian-cup', 'asian-cup-qualifiers'],
  CAF: ['friendly', 'wcq', 'wc', 'afcon', 'afcon-qualifiers'],
  OFC: ['friendly', 'wcq', 'wc', 'ofc-nations-cup'],
} as const

const TROPHY_SETS = {
  UEFA: ['world-cup', 'european-championship', 'nations-league'],
  CONMEBOL: ['world-cup', 'copa-america'],
  CONCACAF: ['world-cup', 'gold-cup'],
  AFC: ['world-cup', 'asian-cup'],
  CAF: ['world-cup', 'afcon'],
  OFC: ['world-cup', 'ofc-nations-cup'],
} as const

export default function SeasonDataPage() {
  const dataEntry = useDataEntryStatus()
  const [step, setStep] = useState(0)
  const [team, setTeam] = useState<TeamSlug | ''>('')
  const [playerNationality, setPlayerNationality] = useState('')
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
  useEffect(() => {
    let cancelled = false
    async function loadPlayerNationality() {
      try {
        const rows = await fetchJson<PlayerProfile[]>('/api/players')
        if (cancelled) return
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.nationality) {
          setPlayerNationality(String(rows[0].nationality))
        }
      } catch {
        // Optional context only; do not block form on failure.
      }
    }
    loadPlayerNationality()
    return () => {
      cancelled = true
    }
  }, [])

  const awardSelectGroups = useMemo(() => getAwardSelectGroupsForTeam(team), [team])

  useEffect(() => {
    if (!team) return
    const allowed = new Set(awardSelectGroups.flatMap((g) => [...g.awards]))
    setAwards((prev) =>
      prev.map((row) => {
        const name = row.award.trim()
        if (!name || allowed.has(name)) return row
        return { ...row, award: '' }
      }),
    )
  }, [team, awardSelectGroups])

  const nationalityCode = toNationalityCode(playerNationality)
  const nationalityLabel = playerNationality ? getNationalityLabel(playerNationality) : ''
  const confederation = nationalityCode ? getConfederationByCode(nationalityCode) : undefined

  const availableIntCompetitions = useMemo(
    () => {
      if (!confederation) return INT_COMPETITIONS
      const ids = new Set<string>(COMPETITION_SETS[confederation])
      return INT_COMPETITIONS.filter((c) => ids.has(c.id))
    },
    [confederation]
  )

  const availableIntTrophies = useMemo(
    () => {
      if (!confederation) return INT_TROPHIES
      const ids = new Set<string>(TROPHY_SETS[confederation])
      return INT_TROPHIES.filter((t) => ids.has(t.id))
    },
    [confederation]
  )

  useEffect(() => {
    setIntRows((prev) =>
      availableIntCompetitions.map((c) => {
        const existing = prev.find((p) => p.competition === c.id)
        return (
          existing ?? {
            competition: c.id,
            apps: 0,
            goals: 0,
            assists: 0,
            avgrating: 0,
          }
        )
      })
    )
    setIntTrophies((prev) => prev.filter((id) => availableIntTrophies.some((t) => t.id === id)))
  }, [availableIntCompetitions, availableIntTrophies])

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
      a.map((x, i) => {
        if (i !== idx) return x
        if (field === 'quantity') {
          return { ...x, quantity: Number(value) || 0 }
        }
        const nextAward = String(value)
        return {
          ...x,
          award: nextAward,
          quantity: awardUsesQuantity(nextAward) ? x.quantity || 1 : 1,
        }
      })
    )
  }

  const handleSave = async () => {
    if (newSeasonBlocked) {
      setSaveError(
        `You already have ${dataEntry.maxSeasons} seasons. Use a season you already logged (or edit/delete existing data) before adding a new season label.`,
      )
      return
    }
    if (!team || !season.trim()) return
    for (const a of awards) {
      const name = a.award.trim()
      if (!name) continue
      if (!isSelectableAwardForTeam(name, team)) {
        setSaveError('Each award must match your club’s league and the shared UEFA/FIFA list.')
        return
      }
    }
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const base = { season: season.trim(), team }
      for (const row of clubRows) {
        if (row.apps > 0 || row.goals > 0 || row.assists > 0 || row.avgrating > 0) {
          await postJson('/api/season_data', { ...base, ...row })
        }
      }
      for (const t of clubTrophies) {
        await postJson('/api/season_trophies', { season: season.trim(), competition: t })
      }
      for (const row of intRows) {
        if (row.apps > 0 || row.goals > 0 || row.assists > 0 || row.avgrating > 0) {
          await postJson('/api/int_data', { season: season.trim(), ...row })
        }
      }
      for (const t of intTrophies) {
        await postJson('/api/int_trophies', { season: season.trim(), competition: t })
      }
      for (const a of awards) {
        if (a.award.trim()) {
          const q = awardUsesQuantity(a.award)
            ? Math.max(1, Math.floor(Number(a.quantity)) || 1)
            : 1
          await postJson('/api/season_awards', {
            season: season.trim(),
            award: a.award.trim(),
            quantity: q,
          })
        }
      }
      setSaveSuccess(true)
      dataEntry.refresh()
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const progressPct = ((step + 1) / STEPS.length) * 100
  const selectedTeamLabel = TEAMS_SORTED_BY_LEAGUE.find((t) => t.id === team)?.label
  const showContext = team && season.trim() && !saveSuccess

  const seasonTrimmed = season.trim()
  const newSeasonBlocked =
    dataEntry.seasonCapReached &&
    Boolean(seasonTrimmed) &&
    !dataEntry.existingSeasons.includes(seasonTrimmed)

  const resetForNewSeason = () => {
    setSaveSuccess(false)
    setSeason('')
    setClubTrophies([])
    setIntTrophies([])
    setAwards([])
    setSaveError(null)
    if (team) initClubRows(team)
    setIntRows(
      availableIntCompetitions.map((c) => ({
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
      <header className="ph ph--season">
        <div className="ph-glow" aria-hidden />
        <div className="ph-inner">
          <div className="ph-text">
            <p className="ph-kicker">
              <span className="ph-kicker-dot" aria-hidden />
              Season Builder
            </p>
            <h1 className="ph-title">Season Data</h1>
            <p className="ph-desc">
              Log club stats, trophies, international play, and awards — one step at a time.
            </p>
          </div>
          <svg className="ph-deco" aria-hidden viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26"  cy="65" r="18" fill="currentColor" fillOpacity="0.12" />
            <circle cx="26"  cy="65" r="10" fill="currentColor" fillOpacity="0.2"  />
            <line x1="44" y1="65" x2="76" y2="65" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="94"  cy="65" r="18" fill="currentColor" fillOpacity="0.12" />
            <circle cx="94"  cy="65" r="10" fill="currentColor" fillOpacity="0.2"  />
            <line x1="112" y1="65" x2="144" y2="65" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="162" cy="65" r="18" fill="currentColor" fillOpacity="0.12" />
            <circle cx="162" cy="65" r="10" fill="currentColor" fillOpacity="0.2"  />
            <line x1="180" y1="65" x2="196" y2="65" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="4 3" />
            <text x="18" y="100" fontSize="9" fill="currentColor" fillOpacity="0.35">Club</text>
            <text x="79" y="100" fontSize="9" fill="currentColor" fillOpacity="0.35">Int.</text>
            <text x="145" y="100" fontSize="9" fill="currentColor" fillOpacity="0.35">Trophies</text>
          </svg>
        </div>

        {showContext && (
          <div className="ph-context" role="status">
            {TEAM_IMAGES[team] && (
              <img src={TEAM_IMAGES[team]} alt="" className="ph-context-img" width={24} height={24} />
            )}
            <span>{selectedTeamLabel} · {season.trim()}</span>
          </div>
        )}

        <div className="ph-progress-wrap">
          <div className="ph-progress-bar-outer" aria-hidden>
            <div className="ph-progress-bar-inner" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="ph-progress-label">
            Step <strong className="ph-progress-step">{step + 1}</strong> of {STEPS.length}
            <span className="ph-progress-name"> · {STEPS[step]}</span>
          </p>
        </div>
      </header>

      {dataEntry.seasonCapReached && (
        <DataCapNotice
          variant="season"
          title={`Season cap: ${dataEntry.seasonCount}/${dataEntry.maxSeasons} distinct seasons`}
        >
          You can still add club stats, trophies, and awards for any season you already use; you cannot start a new
          season label.
        </DataCapNotice>
      )}

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
              Enter stats for national team competitions
              {nationalityLabel ? ` (${nationalityLabel})` : ''}.
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
                    <span className="season-comp-name">{availableIntCompetitions.find((c) => c.id === row.competition)?.label}</span>
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
              Select international trophies won this season
              {nationalityLabel ? ` (${nationalityLabel})` : ''}.
              <span className="season-optional-hint"> Skip if none.</span>
            </p>
            <div className="season-check-grid">
              {availableIntTrophies.map((t) => (
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
              Pick awards for your club’s league and cups, plus UEFA Champions League and international honours.
              Quantity appears only for Player of the Month and Man of the Match (e.g. multiple wins).
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
                    <select
                      className="season-award-input season-award-select"
                      aria-label="Award"
                      value={a.award}
                      onChange={(e) => updateAward(i, 'award', e.target.value)}
                    >
                      <option value="">Select an award…</option>
                      {awardSelectGroups.map((g) => (
                        <optgroup key={g.label} label={g.label}>
                          {g.awards.map((aw) => (
                            <option key={aw} value={aw}>
                              {aw}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {awardUsesQuantity(a.award) && (
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
                    )}
                  </span>
                  <button type="button" className="season-award-remove" onClick={() => removeAward(i)}>
                    Remove
                  </button>
                </div>
                )
              })}
              {awards.length === 0 && (
                <p className="season-awards-empty muted-text">No awards added yet.</p>
              )}
              <button
                type="button"
                className="season-btn season-btn--add"
                onClick={addAward}
              >
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
            disabled={saving || !team || !season.trim() || newSeasonBlocked}
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
          <button
            type="button"
            className="season-btn season-btn--outline"
            onClick={resetForNewSeason}
          >
            Add another season
          </button>
        </div>
      )}
    </section>
  )
}
