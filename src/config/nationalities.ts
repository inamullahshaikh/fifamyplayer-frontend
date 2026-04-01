export type NationalityOption = {
  code: string
  name: string
}

export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC'

// Commonly used football nationalities + extra supported codes.
export const NATIONALITY_OPTIONS: NationalityOption[] = [
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KR', name: 'Korea, Republic of' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LY', name: 'Libya' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PA', name: 'Panama' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russian Federation' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syrian Arab Republic' },
  { code: 'TW', name: 'Taiwan, Republic Of China' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
]

const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  NATIONALITY_OPTIONS.map((n) => [n.code, n.name]),
)

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  NATIONALITY_OPTIONS.map((n) => [normalizeText(n.name), n.code]),
)

export function toNationalityCode(value: string): string | undefined {
  if (!value) return undefined
  const raw = String(value).trim()
  if (!raw) return undefined

  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase()

  const byName = NAME_TO_CODE[normalizeText(raw)]
  if (byName) return byName

  // Support values like "Pakistan (PK)" from suggestion UI
  const parenCode = raw.match(/\(([A-Za-z]{2})\)\s*$/)?.[1]
  if (parenCode) return parenCode.toUpperCase()

  return undefined
}

export function getNationalityLabel(value: string): string {
  const code = toNationalityCode(value)
  if (code && CODE_TO_NAME[code]) return CODE_TO_NAME[code]
  return value
}

export function getFlagUrlByCode(code: string, size = 64): string {
  return `https://flagsapi.com/${code.toUpperCase()}/flat/${size}.png`
}

const UEFA_CODES = new Set([
  'AL', 'AD', 'AM', 'AT', 'AZ', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI',
  'FR', 'GE', 'DE', 'GI', 'GR', 'HU', 'IS', 'IE', 'IL', 'IT', 'XK', 'LV', 'LI', 'LT', 'LU',
  'MT', 'MD', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES',
  'SE', 'CH', 'TR', 'UA', 'GB', 'VA',
])
const CONMEBOL_CODES = new Set(['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE'])
const CONCACAF_CODES = new Set([
  'AG', 'BS', 'BB', 'BZ', 'CA', 'CR', 'CU', 'DM', 'DO', 'SV', 'GD', 'GT', 'HT', 'HN', 'JM',
  'MX', 'NI', 'PA', 'KN', 'LC', 'VC', 'TT', 'US',
])
const AFC_CODES = new Set([
  'AF', 'BH', 'BD', 'BN', 'KH', 'CN', 'IN', 'ID', 'IR', 'IQ', 'JP', 'JO', 'KZ', 'KW', 'KG',
  'LB', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP', 'KR', 'OM', 'PK', 'PH', 'QA', 'SA', 'SG', 'LK',
  'SY', 'TW', 'TJ', 'TH', 'TL', 'TM', 'AE', 'UZ', 'VN', 'YE',
])
const CAF_CODES = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ',
  'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG',
  'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO',
  'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW',
])
const OFC_CODES = new Set(['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC', 'WS', 'TO', 'TV'])

export function getConfederationByCode(code: string): Confederation | undefined {
  const c = String(code || '').toUpperCase()
  if (!c) return undefined
  if (UEFA_CODES.has(c)) return 'UEFA'
  if (CONMEBOL_CODES.has(c)) return 'CONMEBOL'
  if (CONCACAF_CODES.has(c)) return 'CONCACAF'
  if (AFC_CODES.has(c)) return 'AFC'
  if (CAF_CODES.has(c)) return 'CAF'
  if (OFC_CODES.has(c)) return 'OFC'
  return undefined
}

