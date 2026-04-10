export type PlayerRow = {
  _id?: string
  name?: string
  rating?: string | number
  nationality?: string
  position?: string
  value?: number | string
  retired?: boolean
  /** Public avatar URL (`https://...` R2) or `/uploads/avatars/...` (local). */
  avatarUrl?: string
}

export type TransferRow = {
  _id?: string
  season?: string
  from?: string
  to?: string
  value?: string
}

export type SeasonDataRow = {
  _id?: string
  season?: string
  competition?: string
  apps?: number
  goals?: number
  assists?: number
  avgrating?: number
  team?: string
}

export type YearlyDataRow = {
  _id?: string
  year?: string
  goals?: number
  assists?: number
}

export type IntDataRow = {
  _id?: string
  season?: string
  competition?: string
  apps?: number
  goals?: number
  assists?: number
  avgrating?: number
}

export type TrophyRow = {
  _id?: string
  season?: string
  competition?: string
}

export type AwardRow = {
  _id?: string
  season?: string
  award?: string
  quantity?: number
}

export type SeasonChartPoint = {
  season: string
  goals: number
  assists: number
}

export type YearlyChartPoint = {
  year: string
  goals: number
  assists: number
}
