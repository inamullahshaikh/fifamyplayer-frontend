import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  getCupStageOptionsForClubCompetition,
  getCupStageOptionsForIntCompetition,
  getFinishModeForClubCompetitionId,
  getFinishModeForIntCompetitionId,
  getMaxLeaguePlaceForTeam,
  INT_COMPETITIONS,
  INT_TROPHIES,
  isSelectableAwardForTeam,
  QUALIFIER_OUTCOME_OPTIONS,
  SEASON_REGEX,
  LEAGUES_WITH_TEAMS,
  getSupercupStageOptionsForClubCompetition,
  SUPERCUP_STAGE_OPTIONS,
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
import { useCareer } from '../career/CareerContext'
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
  _id?: string
  competition: ClubCompetitionId
  apps: number
  goals: number
  assists: number
  avgrating: number
  finish: string
}

type IntCompetitionRow = {
  _id?: string
  competition: IntCompetitionId
  apps: number
  goals: number
  assists: number
  avgrating: number
  finish: string
}

type AwardRow = { award: string; quantity: number }

function CompetitionFinishField({
  competitionId,
  scope,
  clubTeamId,
  value,
  onChange,
}: {
  competitionId: string
  scope: 'club' | 'int'
  /** Used to cap domestic league place (1..18 or 1..20). */
  clubTeamId?: string
  value: string
  onChange: (next: string) => void
}) {
  const mode =
    scope === 'club'
      ? getFinishModeForClubCompetitionId(competitionId)
      : getFinishModeForIntCompetitionId(competitionId)

  if (mode === 'none') return null

  if (mode === 'league') {
    const maxPlace =
      scope === 'club' && clubTeamId
        ? getMaxLeaguePlaceForTeam(clubTeamId) ?? 20
        : 20
    const trimmed = String(value ?? '').trim()
    const parsed = parseInt(trimmed, 10)
    const inRange =
      trimmed !== '' &&
      Number.isFinite(parsed) &&
      parsed >= 1 &&
      parsed <= maxPlace &&
      String(parsed) === trimmed

    const placeOptions: { value: string; label: string }[] = [
      { value: '', label: 'Not set' },
      ...Array.from({ length: maxPlace }, (_, i) => {
        const v = String(i + 1)
        return { value: v, label: v }
      }),
    ]
    if (trimmed !== '' && !inRange) {
      placeOptions.push({ value: trimmed, label: `${trimmed} (saved)` })
    }

    const selectValue = placeOptions.some((o) => o.value === trimmed) ? trimmed : ''

    return (
      <label className="season-comp-stat season-comp-stat--finish season-comp-stat--finish-league">
        <span className="season-comp-stat-label">Team league place</span>
        <select
          className="season-comp-finish-select"
          value={selectValue}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeOptions.map((o) => (
            <option key={o.value || '__empty'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  const options =
    mode === 'cup'
      ? scope === 'club'
        ? getCupStageOptionsForClubCompetition(competitionId)
        : getCupStageOptionsForIntCompetition(competitionId)
      : mode === 'supercup'
        ? scope === 'club'
          ? getSupercupStageOptionsForClubCompetition(competitionId)
          : SUPERCUP_STAGE_OPTIONS
        : QUALIFIER_OUTCOME_OPTIONS

  const trimmed = String(value ?? '').trim()
  const optionSet = new Set(options.map((o) => o.value))
  const mergedOptions =
    trimmed !== '' && !optionSet.has(trimmed)
      ? [...options, { value: trimmed, label: `${trimmed} (saved)` }]
      : options
  const selectValue = mergedOptions.some((o) => o.value === trimmed) ? trimmed : ''

  const label =
    mode === 'cup'
      ? 'Team cup run'
      : mode === 'supercup'
        ? 'Team result'
        : 'Team qualifying outcome'

  return (
    <label className="season-comp-stat season-comp-stat--finish">
      <span className="season-comp-stat-label">{label}</span>
      <select
        className="season-comp-finish-select"
        value={selectValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {mergedOptions.map((o) => (
          <option key={o.value || '__empty'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function seasonRowHasStats(
  row: Pick<ClubCompetitionRow, 'apps' | 'goals' | 'assists' | 'avgrating' | 'finish'>,
) {
  return (
    row.apps > 0 ||
    row.goals > 0 ||
    row.assists > 0 ||
    row.avgrating > 0 ||
    Boolean(row.finish?.trim())
  )
}

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

async function putJson(url: string, body: object) {
  const res = await apiFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

async function deleteJson(url: string) {
  const res = await apiFetch(url, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
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
  const { players, activeCareerPlayerId } = useCareer()
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
      finish: '',
    }))
  )
  const [seasonEditMode, setSeasonEditMode] = useState(false)
  /** `${team}|${season}` last hydrated from API for edit mode (avoids duplicate fetches). */
  const seasonHydratedRef = useRef<string | null>(null)
  const [intTrophies, setIntTrophies] = useState<IntTrophyId[]>([])
  const [awards, setAwards] = useState<AwardRow[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  useEffect(() => {
    const sel = activeCareerPlayerId
    const row = sel ? players.find((p) => String(p._id) === sel) : players[0]
    setPlayerNationality(row?.nationality ? String(row.nationality) : '')
  }, [players, activeCareerPlayerId])

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
        if (existing) {
          return {
            ...existing,
            finish: existing.finish ?? '',
          }
        }
        return {
          competition: c.id,
          apps: 0,
          goals: 0,
          assists: 0,
          avgrating: 0,
          finish: '',
        }
      }),
    )
    setIntTrophies((prev) => prev.filter((id) => availableIntTrophies.some((t) => t.id === id)))
  }, [availableIntCompetitions, availableIntTrophies])

  const clubComps = team ? (TEAM_CLUB_COMPETITIONS[team] ?? []) : []

  const initClubRows = useCallback((selectedTeam: TeamSlug) => {
    const comps = TEAM_CLUB_COMPETITIONS[selectedTeam] ?? []
    setClubRows(
      comps.map((c) => ({
        competition: c.id,
        apps: 0,
        goals: 0,
        assists: 0,
        avgrating: 0,
        finish: '',
      })),
    )
  }, [])

  const loadExistingSeasonSnapshot = useCallback(async (
    seasonTrim: string,
    teamSlug: TeamSlug,
    intComps: { id: IntCompetitionId }[],
    intTrophyOpts: { id: IntTrophyId }[],
  ) => {
    const [sdRaw, intRaw, stRaw, itRaw, awRaw] = await Promise.all([
      apiFetch('/api/season_data').then((r) => r.json()),
      apiFetch('/api/int_data').then((r) => r.json()),
      apiFetch('/api/season_trophies').then((r) => r.json()),
      apiFetch('/api/int_trophies').then((r) => r.json()),
      apiFetch('/api/season_awards').then((r) => r.json()),
    ])
    type Doc = Record<string, unknown>
    const sd = sdRaw as Doc[]
    const intd = intRaw as Doc[]
    const clubTrophyAllow = new Set(TEAM_CLUB_TROPHIES[teamSlug] ?? [])
    const intTrophyAllow = new Set(intTrophyOpts.map((t) => t.id))

    setClubRows(
      (TEAM_CLUB_COMPETITIONS[teamSlug] ?? []).map((c) => {
        const doc = sd.find(
          (d) =>
            String(d.season) === seasonTrim &&
            String(d.team) === teamSlug &&
            String(d.competition) === c.id,
        )
        if (!doc?._id) {
          return {
            competition: c.id,
            apps: 0,
            goals: 0,
            assists: 0,
            avgrating: 0,
            finish: '',
          }
        }
        return {
          _id: String(doc._id),
          competition: c.id,
          apps: Number(doc.apps) || 0,
          goals: Number(doc.goals) || 0,
          assists: Number(doc.assists) || 0,
          avgrating: Number(doc.avgrating) || 0,
          finish: doc.finish != null ? String(doc.finish) : '',
        }
      }),
    )

    setIntRows(
      intComps.map((c) => {
        const doc = intd.find(
          (d) => String(d.season) === seasonTrim && String(d.competition) === c.id,
        )
        if (!doc?._id) {
          return {
            competition: c.id,
            apps: 0,
            goals: 0,
            assists: 0,
            avgrating: 0,
            finish: '',
          }
        }
        return {
          _id: String(doc._id),
          competition: c.id,
          apps: Number(doc.apps) || 0,
          goals: Number(doc.goals) || 0,
          assists: Number(doc.assists) || 0,
          avgrating: Number(doc.avgrating) || 0,
          finish: doc.finish != null ? String(doc.finish) : '',
        }
      }),
    )

    setClubTrophies(
      (stRaw as Doc[])
        .filter(
          (t) =>
            String(t.season) === seasonTrim &&
            clubTrophyAllow.has(String(t.competition) as ClubTrophyId),
        )
        .map((t) => String(t.competition) as ClubTrophyId),
    )
    setIntTrophies(
      (itRaw as Doc[])
        .filter(
          (t) =>
            String(t.season) === seasonTrim &&
            intTrophyAllow.has(String(t.competition) as IntTrophyId),
        )
        .map((t) => String(t.competition) as IntTrophyId),
    )
    setAwards(
      (awRaw as Doc[])
        .filter((a) => String(a.season) === seasonTrim)
        .map((a) => ({
          award: String(a.award ?? ''),
          quantity: Math.max(1, Number(a.quantity) || 1),
        })),
    )
  }, [])

  const handleTeamSelect = (t: TeamSlug) => {
    setTeam(t)
    setSeasonEditMode(false)
    seasonHydratedRef.current = null
    initClubRows(t)
  }

  useEffect(() => {
    if (step < 2 || !team || !SEASON_REGEX.test(season.trim())) return
    const sTrim = season.trim()
    const key = `${team}|${sTrim}`

    if (!dataEntry.existingSeasons.includes(sTrim)) {
      if (seasonHydratedRef.current !== null) {
        seasonHydratedRef.current = null
        initClubRows(team)
        setIntRows(
          availableIntCompetitions.map((c) => ({
            competition: c.id,
            apps: 0,
            goals: 0,
            assists: 0,
            avgrating: 0,
            finish: '',
          })),
        )
        setClubTrophies([])
        setIntTrophies([])
        setAwards([])
      }
      setSeasonEditMode(false)
      return
    }

    if (seasonHydratedRef.current === key) return

    let cancelled = false
    setSeasonError('')
    ;(async () => {
      try {
        await loadExistingSeasonSnapshot(
          sTrim,
          team,
          availableIntCompetitions,
          availableIntTrophies,
        )
        if (!cancelled) {
          seasonHydratedRef.current = key
          setSeasonEditMode(true)
        }
      } catch (e) {
        if (!cancelled) {
          seasonHydratedRef.current = key
          setSeasonEditMode(false)
          setSeasonError(
            e instanceof Error ? e.message : 'Could not load saved season data',
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    step,
    team,
    season,
    dataEntry.existingSeasons,
    availableIntCompetitions,
    availableIntTrophies,
    loadExistingSeasonSnapshot,
    initClubRows,
  ])

  const handleNext = () => {
    if (step === 1) {
      const valid = SEASON_REGEX.test(season.trim())
      if (!valid) {
        setSeasonError('Use format XXXX/XX (e.g. 2024/25)')
        return
      }
      setSeasonError('')
      if (team && !dataEntry.existingSeasons.includes(season.trim())) {
        seasonHydratedRef.current = null
        initClubRows(team)
        setIntRows(
          availableIntCompetitions.map((c) => ({
            competition: c.id,
            apps: 0,
            goals: 0,
            assists: 0,
            avgrating: 0,
            finish: '',
          })),
        )
        setClubTrophies([])
        setIntTrophies([])
        setAwards([])
        setSeasonEditMode(false)
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handlePrev = () => setStep((s) => Math.max(s - 1, 0))

  const patchClubRow = (idx: number, patch: Partial<ClubCompetitionRow>) => {
    setClubRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const patchIntRow = (idx: number, patch: Partial<IntCompetitionRow>) => {
    setIntRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
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
      const seasonTrim = season.trim()
      const base = { season: seasonTrim, team }

      for (const row of clubRows) {
        const finish = row.finish?.trim() ?? ''
        const hasStats = seasonRowHasStats(row)
        const body = {
          ...base,
          competition: row.competition,
          apps: row.apps,
          goals: row.goals,
          assists: row.assists,
          avgrating: row.avgrating,
          finish,
        }
        if (row._id) {
          if (!hasStats) {
            await deleteJson(`/api/season_data/${row._id}`)
          } else {
            await putJson(`/api/season_data/${row._id}`, body)
          }
        } else if (hasStats) {
          await postJson('/api/season_data', body)
        }
      }

      for (const row of intRows) {
        const finish = row.finish?.trim() ?? ''
        const hasStats = seasonRowHasStats(row)
        const body = {
          season: seasonTrim,
          competition: row.competition,
          apps: row.apps,
          goals: row.goals,
          assists: row.assists,
          avgrating: row.avgrating,
          finish,
        }
        if (row._id) {
          if (!hasStats) {
            await deleteJson(`/api/int_data/${row._id}`)
          } else {
            await putJson(`/api/int_data/${row._id}`, body)
          }
        } else if (hasStats) {
          await postJson('/api/int_data', body)
        }
      }

      if (seasonEditMode) {
        const stList = (await apiFetch('/api/season_trophies').then((r) =>
          r.json(),
        )) as { _id?: string; season?: string }[]
        for (const t of stList.filter((x) => String(x.season) === seasonTrim)) {
          if (t._id) await deleteJson(`/api/season_trophies/${t._id}`)
        }
        for (const t of clubTrophies) {
          await postJson('/api/season_trophies', {
            season: seasonTrim,
            competition: t,
          })
        }
        const itList = (await apiFetch('/api/int_trophies').then((r) =>
          r.json(),
        )) as { _id?: string; season?: string }[]
        for (const t of itList.filter((x) => String(x.season) === seasonTrim)) {
          if (t._id) await deleteJson(`/api/int_trophies/${t._id}`)
        }
        for (const t of intTrophies) {
          await postJson('/api/int_trophies', {
            season: seasonTrim,
            competition: t,
          })
        }
        const awList = (await apiFetch('/api/season_awards').then((r) =>
          r.json(),
        )) as { _id?: string; season?: string }[]
        for (const a of awList.filter((x) => String(x.season) === seasonTrim)) {
          if (a._id) await deleteJson(`/api/season_awards/${a._id}`)
        }
        for (const a of awards) {
          if (a.award.trim()) {
            const q = awardUsesQuantity(a.award)
              ? Math.max(1, Math.floor(Number(a.quantity)) || 1)
              : 1
            await postJson('/api/season_awards', {
              season: seasonTrim,
              award: a.award.trim(),
              quantity: q,
            })
          }
        }
      } else {
        for (const t of clubTrophies) {
          await postJson('/api/season_trophies', {
            season: seasonTrim,
            competition: t,
          })
        }
        for (const t of intTrophies) {
          await postJson('/api/int_trophies', {
            season: seasonTrim,
            competition: t,
          })
        }
        for (const a of awards) {
          if (a.award.trim()) {
            const q = awardUsesQuantity(a.award)
              ? Math.max(1, Math.floor(Number(a.quantity)) || 1)
              : 1
            await postJson('/api/season_awards', {
              season: seasonTrim,
              award: a.award.trim(),
              quantity: q,
            })
          }
        }
      }

      setSaveSuccess(true)
      dataEntry.refresh()
      if (seasonEditMode && team) {
        try {
          await loadExistingSeasonSnapshot(
            seasonTrim,
            team,
            availableIntCompetitions,
            availableIntTrophies,
          )
        } catch {
          /* non-fatal */
        }
      }
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
    setSeasonEditMode(false)
    seasonHydratedRef.current = null
    if (team) initClubRows(team)
    setIntRows(
      availableIntCompetitions.map((c) => ({
        competition: c.id,
        apps: 0,
        goals: 0,
        assists: 0,
        avgrating: 0,
        finish: '',
      })),
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
        {seasonEditMode && step >= 2 && (
          <p className="season-panel-sub season-edit-hint muted-text" role="status">
            Editing saved data for this season. Changes are applied when you tap Save. Clear every stat and team placement
            (league/cup finish) for a competition and save to remove that row.
          </p>
        )}
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
            <p className="season-panel-sub muted-text">
              Use the format <code className="season-code">XXXX/XX</code> — e.g. 2024/25.
              If this season is already saved, the next step loads it so you can edit stats, where the team finished in each
              competition, trophies, and awards.
            </p>
            <div className="season-field-wrap">
              <input
                type="text"
                className="season-input season-input--large"
                placeholder="2024/25"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleNext()
                  }
                }}
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
              Enter stats for each competition {team ? `(${TEAMS_SORTED_BY_LEAGUE.find((t) => t.id === team)?.label})` : ''}.
              Use the fields below the numbers for <strong>where the club finished</strong> in that competition (league
              position, cup run, etc.).
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
                        onChange={(e) => patchClubRow(i, { apps: parseInt(e.target.value, 10) || 0 })}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Goals</span>
                      <input
                        type="number"
                        min={0}
                        value={row.goals || ''}
                        onChange={(e) => patchClubRow(i, { goals: parseInt(e.target.value, 10) || 0 })}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Assists</span>
                      <input
                        type="number"
                        min={0}
                        value={row.assists || ''}
                        onChange={(e) => patchClubRow(i, { assists: parseInt(e.target.value, 10) || 0 })}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Rating</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.avgrating || ''}
                        onChange={(e) => patchClubRow(i, { avgrating: parseFloat(e.target.value) || 0 })}
                      />
                    </label>
                  </div>
                  <CompetitionFinishField
                    competitionId={row.competition}
                    scope="club"
                    clubTeamId={team ?? undefined}
                    value={row.finish}
                    onChange={(v) => patchClubRow(i, { finish: v })}
                  />
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
              The dropdowns below the numbers record <strong>how far the national team went</strong> (qualifying, tournament
              stage, etc.).
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
                        onChange={(e) => patchIntRow(i, { apps: parseInt(e.target.value, 10) || 0 })}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Goals</span>
                      <input
                        type="number"
                        min={0}
                        value={row.goals || ''}
                        onChange={(e) => patchIntRow(i, { goals: parseInt(e.target.value, 10) || 0 })}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Assists</span>
                      <input
                        type="number"
                        min={0}
                        value={row.assists || ''}
                        onChange={(e) => patchIntRow(i, { assists: parseInt(e.target.value, 10) || 0 })}
                      />
                    </label>
                    <label className="season-comp-stat">
                      <span className="season-comp-stat-label">Rating</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.avgrating || ''}
                        onChange={(e) => patchIntRow(i, { avgrating: parseFloat(e.target.value) || 0 })}
                      />
                    </label>
                  </div>
                  <CompetitionFinishField
                    competitionId={row.competition}
                    scope="int"
                    value={row.finish}
                    onChange={(v) => patchIntRow(i, { finish: v })}
                  />
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
