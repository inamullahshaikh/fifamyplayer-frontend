/**
 * API URL helper for production deployments.
 *
 * In Vite, environment variables intended for the browser must start with `VITE_`.
 * We expect `VITE_API_BASE_URL` to be something like:
 *   https://your-backend.onrender.com
 * (without a trailing `/api`)
 */
export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  return typeof base === 'string' ? base : ''
}

export function apiUrl(path: string): string {
  // For local dev (or if Vercel env var is missing), keep relative paths.
  const base = getApiBaseUrl()
  if (!base) return path

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

/** Absolute URL for uploaded static files (`/uploads/...`) when API is on another origin. */
export function publicUploadUrl(relativePath: string | undefined | null): string {
  if (!relativePath || typeof relativePath !== 'string') return ''
  const p = relativePath.trim()
  if (!p.startsWith('/uploads')) return ''
  const base = getApiBaseUrl()
  if (!base) return p
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  return `${b}${p}`
}

/** Multipart upload (e.g. avatar). Do not set Content-Type — browser sets boundary. */
export async function apiUploadFile(
  pathStr: string,
  fieldName: string,
  file: File,
): Promise<Response> {
  const formData = new FormData()
  formData.append(fieldName, file)
  const headers = new Headers()
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const careerId = getActiveCareerPlayerId()
  if (careerId) headers.set('X-Career-Player-Id', careerId)
  return fetch(apiUrl(pathStr), { method: 'POST', body: formData, headers })
}

export type AuthUser = {
  id: string
  username: string
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

const AUTH_TOKEN_KEY = 'vx-auth-token'
const AUTH_USER_KEY = 'vx-auth-user'
const CAREER_PLAYER_KEY = 'vx-active-career-player-id'
const CAREER_FOR_USER_KEY = 'vx-career-bound-user-id'

export function getActiveCareerPlayerId(): string {
  try {
    return localStorage.getItem(CAREER_PLAYER_KEY) || ''
  } catch {
    return ''
  }
}

/** Clears stored career if it was saved for a different account. */
export function clearCareerIfUserMismatch(userId: string): void {
  try {
    const bound = localStorage.getItem(CAREER_FOR_USER_KEY)
    if (bound && bound !== userId) {
      localStorage.removeItem(CAREER_PLAYER_KEY)
      localStorage.removeItem(CAREER_FOR_USER_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function setActiveCareerPlayerIdForUser(userId: string, careerPlayerId: string): void {
  try {
    localStorage.setItem(CAREER_FOR_USER_KEY, userId)
    localStorage.setItem(CAREER_PLAYER_KEY, careerPlayerId)
  } catch {
    /* ignore */
  }
}

export function clearCareerSelection(): void {
  try {
    localStorage.removeItem(CAREER_PLAYER_KEY)
    localStorage.removeItem(CAREER_FOR_USER_KEY)
  } catch {
    /* ignore */
  }
}

export function getAuthToken(): string {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } catch {
    // ignore storage failures
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    clearCareerSelection()
  } catch {
    // ignore storage failures
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {})
  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const careerId = getActiveCareerPlayerId()
  const isPlayerList =
    path === '/api/players' || path.startsWith('/api/players?')
  if (careerId && !isPlayerList) {
    headers.set('X-Career-Player-Id', careerId)
  }

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
  })
  return res
}

