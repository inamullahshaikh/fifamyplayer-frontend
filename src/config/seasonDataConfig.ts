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
  | 'euro' | 'friendly' | 'wcq' | 'wc' | 'euq' | 'unl'  // unl = UEFA Nations League

export type IntTrophyId =
  | 'european-championship' | 'world-cup' | 'nations-league'

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
  { id: 'euro', label: 'UEFA European Championship' },
  { id: 'wc', label: 'FIFA World Cup' },
  { id: 'unl', label: 'UEFA Nations League' },
  { id: 'euq', label: 'Euro Qualifiers' },
  { id: 'wcq', label: 'World Cup Qualifiers' },
  { id: 'friendly', label: 'Friendlies' },
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
]

/** Common awards for autocomplete/selection. */
export const COMMON_AWARDS = [
  'Ballon d\'Or', 'Golden Boot', 'FIFA Best Player', 'Pichichi',
  'Laliga Player of the Season', 'Laliga Player of the Month', 'La Liga Player of the Season', 'La Liga Player of the Month',
  'Premier League Player of the Season', 'Premier League Golden Boot', 'Premier League Player of the Month',
  'UEFA Champions League Best Player', 'UEFA Champions League Top Goalscorer', 'UEFA Champions League Tops Goalscorer',
  'UEFA Team of the Year', 'FIFPro World XI', 'Man of the match', 'MOTM', 'POTM',
  'Copa del Rey Best Player', 'FA Cup Best Player', 'Carabao Cup Best Player',
  'UEFA EURO Best Player', 'UEFA EURO Golden Boot', 'FIFA World Cup Golden Ball', 'FIFA World Cup Golden Boot',
  'Copa Trophy', 'Premier League Team of the season', 'UEFA Tem of the Season',
]

/** Season format: XXXX/XX */
export const SEASON_REGEX = /^\d{4}\/\d{2}$/
