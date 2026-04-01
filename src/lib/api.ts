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

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
  })
  return res
}

