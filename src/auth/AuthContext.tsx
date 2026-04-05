import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  apiFetch,
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  setAuthSession,
  type AuthResponse,
  type AuthUser,
} from '../lib/api'

type Credentials = {
  username: string
  password: string
}

export type RegisterPayload = {
  username: string
  password: string
  securityQuestion: string
  securityAnswer: string
}

type AuthContextType = {
  token: string
  user: AuthUser | null
  isAuthenticated: boolean
  login: (creds: Credentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

async function submitAuth(path: string, creds: Credentials): Promise<AuthResponse> {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  })

  const body = (await res.json().catch(() => ({}))) as Partial<AuthResponse> & { error?: string }
  if (!res.ok || !body.token || !body.user) {
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return body as AuthResponse
}

async function submitRegister(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = (await res.json().catch(() => ({}))) as Partial<AuthResponse> & { error?: string }
  if (!res.ok || !body.token || !body.user) {
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return body as AuthResponse
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>(() => getAuthToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  const login = async (creds: Credentials) => {
    const auth = await submitAuth('/api/auth/login', creds)
    setAuthSession(auth.token, auth.user)
    setToken(auth.token)
    setUser(auth.user)
  }

  const register = async (payload: RegisterPayload) => {
    const auth = await submitRegister(payload)
    setAuthSession(auth.token, auth.user)
    setToken(auth.token)
    setUser(auth.user)
  }

  const logout = () => {
    clearAuthSession()
    setToken('')
    setUser(null)
  }

  const value = useMemo<AuthContextType>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

