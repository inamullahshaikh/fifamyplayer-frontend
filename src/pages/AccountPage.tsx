import { useEffect, useState } from 'react'
import { SECURITY_QUESTIONS } from '../config/securityQuestions'
import { useAuth } from '../auth/AuthContext'
import { apiFetch, getAuthToken, setAuthSession, type AuthUser } from '../lib/api'

type MeResponse = {
  username?: string
  name?: string
  email?: string
  hasSecurityRecovery?: boolean
  securityQuestion?: string | null
}

export default function AccountPage() {
  const { user: authUser, syncUserFromStorage } = useAuth()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [pwErr, setPwErr] = useState<string | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  const [secCurPw, setSecCurPw] = useState('')
  const [secQ, setSecQ] = useState(SECURITY_QUESTIONS[0] ?? '')
  const [secA, setSecA] = useState('')
  const [secMsg, setSecMsg] = useState<string | null>(null)
  const [secErr, setSecErr] = useState<string | null>(null)
  const [secSaving, setSecSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch('/api/me')
        const data = (await res.json().catch(() => ({}))) as MeResponse & { error?: string }
        if (!res.ok) throw new Error(data.error || 'Could not load account')
        if (!cancelled) {
          setMe(data)
          setProfileName(data.name ?? '')
          setProfileEmail(data.email ?? '')
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (me?.securityQuestion && SECURITY_QUESTIONS.includes(me.securityQuestion)) {
      setSecQ(me.securityQuestion)
    }
  }, [me?.securityQuestion])

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwErr(null)
    setPwMsg(null)
    setPwSaving(true)
    try {
      const res = await apiFetch('/api/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not update password')
      setPwMsg('Password updated.')
      setCurPw('')
      setNewPw('')
    } catch (e) {
      setPwErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setPwSaving(false)
    }
  }

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErr(null)
    setProfileMsg(null)
    setProfileSaving(true)
    try {
      const res = await apiFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim().toLowerCase(),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        username?: string
        name?: string
        email?: string
      }
      if (!res.ok) throw new Error(data.error || 'Could not save profile')
      setProfileMsg('Profile saved.')
      setMe((m) =>
        m
          ? {
              ...m,
              username: data.username ?? m.username,
              name: data.name ?? '',
              email: data.email ?? '',
            }
          : m,
      )
      if (authUser) {
        const next: AuthUser = {
          id: authUser.id,
          username: data.username ?? authUser.username,
          name: data.name ?? profileName.trim(),
          email: data.email ?? profileEmail.trim().toLowerCase(),
        }
        setAuthSession(getAuthToken(), next)
        syncUserFromStorage()
      }
    } catch (e) {
      setProfileErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setProfileSaving(false)
    }
  }

  const submitSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecErr(null)
    setSecMsg(null)
    setSecSaving(true)
    try {
      const res = await apiFetch('/api/me/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: secCurPw,
          securityQuestion: secQ,
          securityAnswer: secA,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not save recovery settings')
      setSecMsg('Security question and answer saved.')
      setSecCurPw('')
      setSecA('')
      setMe((m) =>
        m
          ? { ...m, hasSecurityRecovery: true, securityQuestion: secQ }
          : m,
      )
    } catch (e) {
      setSecErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSecSaving(false)
    }
  }

  return (
    <section className="dash-view">
      <header className="ph ph--dashboard">
        <div className="ph-inner">
          <div className="ph-text">
            <p className="ph-kicker">
              <span className="ph-kicker-dot" aria-hidden />
              Settings
            </p>
            <h1 className="ph-title">Account</h1>
            <p className="ph-desc">
              Profile, password, and recovery options for your VirtualXI login.
            </p>
          </div>
        </div>
      </header>

      {loadError && (
        <div className="dash-api-error" role="alert">
          {loadError}
        </div>
      )}

      {me && (
        <p className="muted-text" style={{ marginTop: -8 }}>
          Signed in as <strong>{me.username}</strong>
        </p>
      )}

      <div className="account-settings-grid">
        <div className="account-card">
          <h2 className="account-card-title">Profile</h2>
          <p className="account-card-desc">Your display name and email (used for notifications and password reset).</p>
          <form className="auth-form account-inner-form" onSubmit={submitProfile}>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-name">
                Name
              </label>
              <input
                id="acc-name"
                className="auth-input"
                type="text"
                autoComplete="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-email">
                Email
              </label>
              <input
                id="acc-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
              />
            </div>
            {profileErr && <div className="auth-error-box">{profileErr}</div>}
            {profileMsg && <p className="account-success">{profileMsg}</p>}
            <button type="submit" className="auth-btn" disabled={profileSaving}>
              {profileSaving ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>

        <div className="account-card">
          <h2 className="account-card-title">Change password</h2>
          <p className="account-card-desc">Use your current password to set a new one.</p>
          <form className="auth-form account-inner-form" onSubmit={submitPassword}>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-cur-pw">
                Current password
              </label>
              <input
                id="acc-cur-pw"
                className="auth-input"
                type="password"
                autoComplete="current-password"
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-new-pw">
                New password
              </label>
              <input
                id="acc-new-pw"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
            </div>
            {pwErr && <div className="auth-error-box">{pwErr}</div>}
            {pwMsg && <p className="account-success">{pwMsg}</p>}
            <button type="submit" className="auth-btn" disabled={pwSaving}>
              {pwSaving ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="account-card">
          <h2 className="account-card-title">Forgot-password recovery</h2>
          <p className="account-card-desc">
            {me?.hasSecurityRecovery
              ? 'You can reset your password using this question if you forget your login. You may change it below (current password required).'
              : 'Set a security question and answer so you can reset your password from the login page.'}
          </p>
          {me?.hasSecurityRecovery && me.securityQuestion && (
            <p className="account-recovery-current">
              Current question: <em>{me.securityQuestion}</em>
            </p>
          )}
          <form className="auth-form account-inner-form" onSubmit={submitSecurity}>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-sec-cur">
                Current password
              </label>
              <input
                id="acc-sec-cur"
                className="auth-input"
                type="password"
                autoComplete="current-password"
                value={secCurPw}
                onChange={(e) => setSecCurPw(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-sec-q">
                Security question
              </label>
              <select
                id="acc-sec-q"
                className="auth-input"
                value={secQ}
                onChange={(e) => setSecQ(e.target.value)}
              >
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="acc-sec-a">
                Answer
              </label>
              <input
                id="acc-sec-a"
                className="auth-input"
                type="text"
                autoComplete="off"
                value={secA}
                onChange={(e) => setSecA(e.target.value)}
                required
                minLength={2}
                placeholder="Remember: matching is not case-sensitive"
              />
            </div>
            {secErr && <div className="auth-error-box">{secErr}</div>}
            {secMsg && <p className="account-success">{secMsg}</p>}
            <button type="submit" className="auth-btn" disabled={secSaving}>
              {secSaving ? 'Saving…' : 'Save recovery settings'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
