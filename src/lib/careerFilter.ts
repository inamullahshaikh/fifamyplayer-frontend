import { getNationalityLabel } from '../config/nationalities'
import type { PlayerRow } from '../types/dashboard'

/** Case-insensitive match for career search (name, position, nationality, OVR, value, retired). */
export function careerMatchesQuery(p: PlayerRow, q: string): boolean {
  const name = (p.name || '').toLowerCase()
  const pos = (p.position || '').toLowerCase()
  const natRaw = String(p.nationality || '').toLowerCase()
  const natLabel = p.nationality ? getNationalityLabel(String(p.nationality)).toLowerCase() : ''
  const rating = String(p.rating ?? '').toLowerCase()
  const rawVal = p.value != null && p.value !== '' ? String(p.value) : ''
  const valueLocale =
    p.value != null && p.value !== '' && Number.isFinite(Number(p.value))
      ? Number(p.value).toLocaleString().toLowerCase()
      : ''
  const retired = p.retired ? 'retired' : ''
  const hay = [name, pos, natRaw, natLabel, rating, rawVal, valueLocale, retired].join(' ')
  return hay.includes(q)
}
