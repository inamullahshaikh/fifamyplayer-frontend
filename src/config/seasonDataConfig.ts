/**
 * Configuration for the Season Data form.
 * Matches the structure used in the backend (seasondatas, seasontrophies, intdatas, inttrophies, seasonawards).
 */

/** Slug from display name: lowercase, spaces to hyphens, remove diacritics */
export function toTeamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
}

export type TeamSlug = string

export type ClubCompetitionId =
  | 'll'   // La Liga
  | 'cdr'  // Copa del Rey
  | 'sde'  // Supercopa de España
  | 'ucl'  // Champions League
  | 'uesc' // UEFA Super Cup
  | 'uecl' // Europa Conference League
  | 'usc'  // UEFA Super Cup
  | 'pl'   // Premier League
  | 'fa'   // FA Cup
  | 'efl'  // Carabao/EFL Cup
  | 'cs'   // Community Shield
  | 'bl'   // Bundesliga
  | 'dfb'  // DFB-Pokal
  | 'dfl'  // DFL-Supercup
  | 'sa'   // Serie A
  | 'ci'   // Coppa Italia
  | 'si'   // Supercoppa Italiana
  | 'l1'   // Ligue 1
  | 'cdf'  // Coupe de France
  | 'tdc'  // Trophée des Champions

export type ClubTrophyId =
  | 'll-trophy' | 'cdr-trophy' | 'sde-trophy'
  | 'ucl-trophy' | 'uesc-trophy' | 'uecl-trophy' | 'usc-trophy'
  | 'pl-trophy' | 'fa-trophy' | 'efl-trophy' | 'cs-trophy'
  | 'bl-trophy' | 'dfb-trophy' | 'dfl-trophy'
  | 'sa-trophy' | 'ci-trophy' | 'si-trophy'
  | 'l1-trophy' | 'cdf-trophy' | 'tdc-trophy'

export type IntCompetitionId =
  | 'friendly'
  | 'wcq'
  | 'wc'
  | 'finalissima'
  | 'euro'
  | 'euq'
  | 'unl'
  | 'copa-america'
  | 'conmebol-qualifiers'
  | 'gold-cup'
  | 'concacaf-nations-league'
  | 'asian-cup'
  | 'asian-cup-qualifiers'
  | 'afcon'
  | 'afcon-qualifiers'
  | 'ofc-nations-cup'

export type IntTrophyId =
  | 'european-championship'
  | 'world-cup'
  | 'nations-league'
  | 'copa-america'
  | 'gold-cup'
  | 'asian-cup'
  | 'afcon'
  | 'ofc-nations-cup'

/** La Liga teams */
const LA_LIGA_COMPETITIONS = [
  { id: 'll' as const, label: 'La Liga' },
  { id: 'cdr' as const, label: 'Copa del Rey' },
  { id: 'sde' as const, label: 'Supercopa de España' },
  { id: 'ucl' as const, label: 'UEFA Champions League' },
  { id: 'uesc' as const, label: 'UEFA Super Cup' },
  { id: 'uecl' as const, label: 'UEFA Europa Conference League' },
  { id: 'usc' as const, label: 'UEFA Super Cup' },
]

const LA_LIGA_TROPHIES: ClubTrophyId[] = ['ll-trophy', 'cdr-trophy', 'sde-trophy', 'ucl-trophy', 'uesc-trophy', 'uecl-trophy', 'usc-trophy']

/** Premier League teams */
const PREMIER_LEAGUE_COMPETITIONS = [
  { id: 'pl' as const, label: 'Premier League' },
  { id: 'fa' as const, label: 'FA Cup' },
  { id: 'efl' as const, label: 'Carabao Cup' },
  { id: 'ucl' as const, label: 'UEFA Champions League' },
  { id: 'uesc' as const, label: 'UEFA Super Cup' },
  { id: 'uecl' as const, label: 'UEFA Europa Conference League' },
  { id: 'usc' as const, label: 'UEFA Super Cup' },
  { id: 'cs' as const, label: 'Community Shield' },
]

const PREMIER_LEAGUE_TROPHIES: ClubTrophyId[] = ['pl-trophy', 'fa-trophy', 'efl-trophy', 'ucl-trophy', 'uesc-trophy', 'uecl-trophy', 'usc-trophy', 'cs-trophy']

/** Bundesliga teams */
const BUNDESLIGA_COMPETITIONS = [
  { id: 'bl' as const, label: 'Bundesliga' },
  { id: 'dfb' as const, label: 'DFB-Pokal' },
  { id: 'dfl' as const, label: 'DFL-Supercup' },
  { id: 'ucl' as const, label: 'UEFA Champions League' },
  { id: 'uesc' as const, label: 'UEFA Super Cup' },
  { id: 'uecl' as const, label: 'UEFA Europa Conference League' },
  { id: 'usc' as const, label: 'UEFA Super Cup' },
]

const BUNDESLIGA_TROPHIES: ClubTrophyId[] = ['bl-trophy', 'dfb-trophy', 'dfl-trophy', 'ucl-trophy', 'uesc-trophy', 'uecl-trophy', 'usc-trophy']

/** Serie A teams */
const SERIE_A_COMPETITIONS = [
  { id: 'sa' as const, label: 'Serie A' },
  { id: 'ci' as const, label: 'Coppa Italia' },
  { id: 'si' as const, label: 'Supercoppa Italiana' },
  { id: 'ucl' as const, label: 'UEFA Champions League' },
  { id: 'uesc' as const, label: 'UEFA Super Cup' },
  { id: 'uecl' as const, label: 'UEFA Europa Conference League' },
  { id: 'usc' as const, label: 'UEFA Super Cup' },
]

const SERIE_A_TROPHIES: ClubTrophyId[] = ['sa-trophy', 'ci-trophy', 'si-trophy', 'ucl-trophy', 'uesc-trophy', 'uecl-trophy', 'usc-trophy']

/** Ligue 1 teams */
const LIGUE_1_COMPETITIONS = [
  { id: 'l1' as const, label: 'Ligue 1' },
  { id: 'cdf' as const, label: 'Coupe de France' },
  { id: 'tdc' as const, label: 'Trophée des Champions' },
  { id: 'ucl' as const, label: 'UEFA Champions League' },
  { id: 'uesc' as const, label: 'UEFA Super Cup' },
  { id: 'uecl' as const, label: 'UEFA Europa Conference League' },
  { id: 'usc' as const, label: 'UEFA Super Cup' },
]

const LIGUE_1_TROPHIES: ClubTrophyId[] = ['l1-trophy', 'cdf-trophy', 'tdc-trophy', 'ucl-trophy', 'uesc-trophy', 'uecl-trophy', 'usc-trophy']

/** All teams from assets/images/teams/ */
export const TEAMS: { id: TeamSlug; label: string }[] = [
  { id: 'ac-milan', label: 'AC Milan' },
  { id: 'arsenal-fc', label: 'Arsenal FC' },
  { id: 'as-monaco', label: 'AS Monaco' },
  { id: 'as-roma', label: 'AS Roma' },
  { id: 'aston-villa', label: 'Aston Villa' },
  { id: 'athletic-bilbao', label: 'Athletic Bilbao' },
  { id: 'atletico-de-madrid', label: 'Atlético de Madrid' },
  { id: 'bayer-04-leverkusen', label: 'Bayer 04 Leverkusen' },
  { id: 'bayern-munich', label: 'Bayern Munich' },
  { id: 'borussia-dortmund', label: 'Borussia Dortmund' },
  { id: 'borussia-monchengladbach', label: 'Borussia Mönchengladbach' },
  { id: 'chelsea-fc', label: 'Chelsea FC' },
  { id: 'eintracht-frankfurt', label: 'Eintracht Frankfurt' },
  { id: 'barcelona', label: 'FC Barcelona' },
  { id: 'inter-milan', label: 'Inter Milan' },
  { id: 'juventus-fc', label: 'Juventus FC' },
  { id: 'liverpool-fc', label: 'Liverpool FC' },
  { id: 'losc-lille', label: 'LOSC Lille' },
  { id: 'manchester-city', label: 'Manchester City' },
  { id: 'manchester-united', label: 'Manchester United' },
  { id: 'newcastle-united', label: 'Newcastle United' },
  { id: 'ogc-nice', label: 'OGC Nice' },
  { id: 'olympique-lyon', label: 'Olympique Lyon' },
  { id: 'olympique-marseille', label: 'Olympique Marseille' },
  { id: 'paris-saint-germain', label: 'Paris Saint-Germain' },
  { id: 'rb-leipzig', label: 'RB Leipzig' },
  { id: 'real-madrid', label: 'Real Madrid' },
  { id: 'sevilla-fc', label: 'Sevilla FC' },
  { id: 'ss-lazio', label: 'SS Lazio' },
  { id: 'ssc-napoli', label: 'SSC Napoli' },
  { id: 'tottenham-hotspur', label: 'Tottenham Hotspur' },
  { id: 'valencia-cf', label: 'Valencia CF' },
  { id: 'vfl-wolfsburg', label: 'VfL Wolfsburg' },
  { id: 'villarreal-cf', label: 'Villarreal CF' },
]

const LA_LIGA_TEAMS = ['athletic-bilbao', 'atletico-de-madrid', 'barcelona', 'real-madrid', 'sevilla-fc', 'valencia-cf', 'villarreal-cf']
const PREMIER_LEAGUE_TEAMS = ['arsenal-fc', 'aston-villa', 'chelsea-fc', 'liverpool-fc', 'manchester-city', 'manchester-united', 'newcastle-united', 'tottenham-hotspur']
const BUNDESLIGA_TEAMS = ['bayer-04-leverkusen', 'bayern-munich', 'borussia-dortmund', 'borussia-monchengladbach', 'eintracht-frankfurt', 'rb-leipzig', 'vfl-wolfsburg']
const SERIE_A_TEAMS = ['ac-milan', 'inter-milan', 'juventus-fc', 'ss-lazio', 'ssc-napoli', 'as-roma']
const LIGUE_1_TEAMS = ['as-monaco', 'losc-lille', 'ogc-nice', 'olympique-lyon', 'olympique-marseille', 'paris-saint-germain']

/** Top-five league bucket for filtering selectable awards (Season Data). */
export type DomesticLeagueKey =
  | 'premier-league'
  | 'la-liga'
  | 'bundesliga'
  | 'serie-a'
  | 'ligue-1'

const TEAM_DOMESTIC_LEAGUE: Record<string, DomesticLeagueKey> = Object.fromEntries([
  ...LA_LIGA_TEAMS.map((id) => [id, 'la-liga' as const]),
  ...PREMIER_LEAGUE_TEAMS.map((id) => [id, 'premier-league' as const]),
  ...BUNDESLIGA_TEAMS.map((id) => [id, 'bundesliga' as const]),
  ...SERIE_A_TEAMS.map((id) => [id, 'serie-a' as const]),
  ...LIGUE_1_TEAMS.map((id) => [id, 'ligue-1' as const]),
]) as Record<string, DomesticLeagueKey>

export function getDomesticLeagueKeyForTeam(teamId: string): DomesticLeagueKey | null {
  return TEAM_DOMESTIC_LEAGUE[teamId] ?? null
}

const TEAM_BY_ID = Object.fromEntries(TEAMS.map((t) => [t.id, t]))

/** Labels for team IDs. */
export const TEAM_LABELS: Record<string, string> = Object.fromEntries(TEAMS.map((t) => [t.id, t.label]))

/** Teams ordered by league: La Liga → Premier League → Bundesliga → Serie A → Ligue 1 */
export const TEAMS_SORTED_BY_LEAGUE: { id: TeamSlug; label: string }[] = [
  ...LA_LIGA_TEAMS.map((id) => TEAM_BY_ID[id]),
  ...PREMIER_LEAGUE_TEAMS.map((id) => TEAM_BY_ID[id]),
  ...BUNDESLIGA_TEAMS.map((id) => TEAM_BY_ID[id]),
  ...SERIE_A_TEAMS.map((id) => TEAM_BY_ID[id]),
  ...LIGUE_1_TEAMS.map((id) => TEAM_BY_ID[id]),
]

/** Leagues with their teams for grouped display */
export const LEAGUES_WITH_TEAMS: { leagueName: string; teams: { id: TeamSlug; label: string }[] }[] = [
  { leagueName: 'La Liga', teams: LA_LIGA_TEAMS.map((id) => TEAM_BY_ID[id]) },
  { leagueName: 'Premier League', teams: PREMIER_LEAGUE_TEAMS.map((id) => TEAM_BY_ID[id]) },
  { leagueName: 'Bundesliga', teams: BUNDESLIGA_TEAMS.map((id) => TEAM_BY_ID[id]) },
  { leagueName: 'Serie A', teams: SERIE_A_TEAMS.map((id) => TEAM_BY_ID[id]) },
  { leagueName: 'Ligue 1', teams: LIGUE_1_TEAMS.map((id) => TEAM_BY_ID[id]) },
]

/** Club competitions available per team (based on league). */
export const TEAM_CLUB_COMPETITIONS: Record<string, { id: ClubCompetitionId; label: string }[]> = Object.fromEntries(
  [
    ...LA_LIGA_TEAMS.map((t) => [t, LA_LIGA_COMPETITIONS]),
    ...PREMIER_LEAGUE_TEAMS.map((t) => [t, PREMIER_LEAGUE_COMPETITIONS]),
    ...BUNDESLIGA_TEAMS.map((t) => [t, BUNDESLIGA_COMPETITIONS]),
    ...SERIE_A_TEAMS.map((t) => [t, SERIE_A_COMPETITIONS]),
    ...LIGUE_1_TEAMS.map((t) => [t, LIGUE_1_COMPETITIONS]),
  ]
)

/** Club trophies available per team. */
export const TEAM_CLUB_TROPHIES: Record<string, ClubTrophyId[]> = Object.fromEntries([
  ...LA_LIGA_TEAMS.map((t) => [t, LA_LIGA_TROPHIES]),
  ...PREMIER_LEAGUE_TEAMS.map((t) => [t, PREMIER_LEAGUE_TROPHIES]),
  ...BUNDESLIGA_TEAMS.map((t) => [t, BUNDESLIGA_TROPHIES]),
  ...SERIE_A_TEAMS.map((t) => [t, SERIE_A_TROPHIES]),
  ...LIGUE_1_TEAMS.map((t) => [t, LIGUE_1_TROPHIES]),
])

/** All club trophy options. */
export const CLUB_TROPHIES: { id: ClubTrophyId; label: string }[] = [
  { id: 'll-trophy', label: 'La Liga' },
  { id: 'cdr-trophy', label: 'Copa del Rey' },
  { id: 'sde-trophy', label: 'Supercopa de España' },
  { id: 'ucl-trophy', label: 'UEFA Champions League' },
  { id: 'uesc-trophy', label: 'UEFA Super Cup' },
  { id: 'uecl-trophy', label: 'UEFA Europa Conference League' },
  { id: 'usc-trophy', label: 'UEFA Super Cup' },
  { id: 'pl-trophy', label: 'Premier League' },
  { id: 'fa-trophy', label: 'FA Cup' },
  { id: 'efl-trophy', label: 'Carabao Cup' },
  { id: 'cs-trophy', label: 'Community Shield' },
  { id: 'bl-trophy', label: 'Bundesliga' },
  { id: 'dfb-trophy', label: 'DFB-Pokal' },
  { id: 'dfl-trophy', label: 'DFL-Supercup' },
  { id: 'sa-trophy', label: 'Serie A' },
  { id: 'ci-trophy', label: 'Coppa Italia' },
  { id: 'si-trophy', label: 'Supercoppa Italiana' },
  { id: 'l1-trophy', label: 'Ligue 1' },
  { id: 'cdf-trophy', label: 'Coupe de France' },
  { id: 'tdc-trophy', label: 'Trophée des Champions' },
]

/** International competitions. */
export const INT_COMPETITIONS: { id: IntCompetitionId; label: string }[] = [
  { id: 'friendly', label: 'Friendlies' },
  { id: 'wcq', label: 'World Cup Qualifiers' },
  { id: 'wc', label: 'FIFA World Cup' },
  { id: 'finalissima', label: 'Finalissima' },
  { id: 'euro', label: 'UEFA European Championship' },
  { id: 'euq', label: 'Euro Qualifiers' },
  { id: 'unl', label: 'UEFA Nations League' },
  { id: 'copa-america', label: 'Copa America' },
  { id: 'conmebol-qualifiers', label: 'CONMEBOL Qualifiers' },
  { id: 'gold-cup', label: 'CONCACAF Gold Cup' },
  { id: 'concacaf-nations-league', label: 'CONCACAF Nations League' },
  { id: 'asian-cup', label: 'AFC Asian Cup' },
  { id: 'asian-cup-qualifiers', label: 'AFC Asian Cup Qualifiers' },
  { id: 'afcon', label: 'Africa Cup of Nations' },
  { id: 'afcon-qualifiers', label: 'AFCON Qualifiers' },
  { id: 'ofc-nations-cup', label: 'OFC Nations Cup' },
]

/** Labels for competition IDs (club + international). */
const ALL_CLUB_COMPETITIONS = [
  ...LA_LIGA_COMPETITIONS,
  ...PREMIER_LEAGUE_COMPETITIONS,
  ...BUNDESLIGA_COMPETITIONS,
  ...SERIE_A_COMPETITIONS,
  ...LIGUE_1_COMPETITIONS,
]

export const COMPETITION_LABELS: Record<string, string> = {
  ...Object.fromEntries(ALL_CLUB_COMPETITIONS.map((c) => [c.id, c.label])),
  ...Object.fromEntries(INT_COMPETITIONS.map((c) => [c.id, c.label])),
}

/** International trophies. */
export const INT_TROPHIES: { id: IntTrophyId; label: string }[] = [
  { id: 'european-championship', label: 'European Championship' },
  { id: 'world-cup', label: 'World Cup' },
  { id: 'nations-league', label: 'UEFA Nations League' },
  { id: 'copa-america', label: 'Copa America' },
  { id: 'gold-cup', label: 'CONCACAF Gold Cup' },
  { id: 'asian-cup', label: 'AFC Asian Cup' },
  { id: 'afcon', label: 'Africa Cup of Nations' },
  { id: 'ofc-nations-cup', label: 'OFC Nations Cup' },
]

/** Optgroup + options for the Season Data awards &lt;select&gt;. */
export type AwardSelectGroup = { label: string; awards: readonly string[] }

/** UEFA / FIFA honours any club player can earn (plus global individual awards). */
const SHARED_AWARD_GROUPS: AwardSelectGroup[] = [
  {
    label: 'UEFA Champions League',
    awards: ['UEFA Champions League Best Player', 'UEFA Champions League Top Goalscorer'],
  },
  {
    label: 'UEFA national team',
    awards: ['UEFA EURO Best Player', 'UEFA EURO Golden Boot'],
  },
  {
    label: 'FIFA World Cup',
    awards: ['FIFA World Cup Golden Ball', 'FIFA World Cup Golden Boot'],
  },
  {
    label: 'Global & other',
    awards: [
      'Ballon d\'Or',
      'Golden Boot',
      'FIFA Best Player',
      'FIFPro World XI',
      'UEFA Team of the Year',
      'Man of the match',
    ],
  },
]

/**
 * League + domestic cup awards only for that country’s competitions
 * (aligned with real league honours and EA FC-style POTM / golden boot / cup MVP naming).
 */
const DOMESTIC_AWARD_GROUPS: Record<DomesticLeagueKey, AwardSelectGroup[]> = {
  'premier-league': [
    {
      label: 'Premier League',
      awards: [
        'Premier League Golden Boot',
        'Premier League Player of the Month',
        'Premier League Player of the Season',
        'Premier League Team of the season',
      ],
    },
    {
      label: 'English cups',
      awards: ['FA Cup Best Player', 'Carabao Cup Best Player'],
    },
  ],
  'la-liga': [
    {
      label: 'La Liga',
      awards: ['La Liga Player of the Month', 'La Liga Player of the Season', 'Pichichi'],
    },
    {
      label: 'Spanish cups',
      awards: ['Copa del Rey Best Player', 'Copa Trophy'],
    },
  ],
  bundesliga: [
    {
      label: 'Bundesliga',
      awards: [
        'Bundesliga Golden Boot',
        'Bundesliga Player of the Month',
        'Bundesliga Player of the Season',
        'Bundesliga Team of the Season',
      ],
    },
    {
      label: 'German cups',
      awards: ['DFB-Pokal Best Player', 'DFL-Supercup Best Player'],
    },
  ],
  'serie-a': [
    {
      label: 'Serie A',
      awards: [
        'Serie A Player of the Month',
        'Serie A Player of the Season',
        'Capocannoniere',
        'Serie A Team of the Season',
      ],
    },
    {
      label: 'Italian cups',
      awards: ['Coppa Italia Best Player', 'Supercoppa Italiana Best Player'],
    },
  ],
  'ligue-1': [
    {
      label: 'Ligue 1',
      awards: [
        'Ligue 1 Golden Boot',
        'Ligue 1 Player of the Month',
        'Ligue 1 Player of the Season',
        'Ligue 1 Team of the season',
      ],
    },
    {
      label: 'French cups',
      awards: ['Coupe de France Best Player', 'Trophée des Champions Best Player'],
    },
  ],
}

/** Awards shown in Season Data for the selected club (domestic + shared UEFA/FIFA/global). */
export function getAwardSelectGroupsForTeam(teamId: string): AwardSelectGroup[] {
  const league = teamId ? getDomesticLeagueKeyForTeam(teamId) : null
  if (!league) return [...SHARED_AWARD_GROUPS]
  const domestic = DOMESTIC_AWARD_GROUPS[league]
  return [...domestic, ...SHARED_AWARD_GROUPS]
}

function collectAllSelectableAwards(): string[] {
  const u = new Set<string>()
  for (const g of SHARED_AWARD_GROUPS) for (const a of g.awards) u.add(a)
  for (const groups of Object.values(DOMESTIC_AWARD_GROUPS)) {
    for (const g of groups) for (const a of g.awards) u.add(a)
  }
  return [...u].sort((a, b) => a.localeCompare(b))
}

export const ALL_SELECTABLE_AWARDS: string[] = collectAllSelectableAwards()

/** @deprecated Prefer ALL_SELECTABLE_AWARDS or getAwardSelectGroupsForTeam */
export const COMMON_AWARDS = ALL_SELECTABLE_AWARDS

export function isSelectableAwardForTeam(awardName: string, teamId: string): boolean {
  const t = awardName.trim()
  if (!t) return true
  for (const g of getAwardSelectGroupsForTeam(teamId)) {
    if (g.awards.includes(t)) return true
  }
  return false
}

/** MOTM and monthly POTM can repeat in one season; all other awards save as quantity 1. */
export function awardUsesQuantity(awardName: string): boolean {
  const s = awardName.trim().toLowerCase()
  if (!s) return false
  if (s === 'man of the match') return true
  return s.includes('player of the month')
}

/** Season format: XXXX/XX */
export const SEASON_REGEX = /^\d{4}\/\d{2}$/
