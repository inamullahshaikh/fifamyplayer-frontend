import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import footballLogo from '../assets/images/football.png'
import { apiFetch } from '../lib/api'

type LookupResponse = {
  canRecover?: boolean
  securityQuestion?: string | null
}

type RecoveryMode = 'question' | 'email'

export default function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth()
  const [mode, setMode] = useState<RecoveryMode>('question')

  const [username, setUsername] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [question, setQuestion] = useState<string | null>(null)

  const [resetEmail, setResetEmail] = useState('')
  const [emailStep, setEmailStep] = useState<1 | 2>(1)
  const [resetCode, setResetCode] = useState('')
  const [emailNewPassword, setEmailNewPassword] = useState('')
  const [emailInfo, setEmailInfo] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const resetEmailFlow = () => {
    setEmailStep(1)
    setResetEmail('')
    setResetCode('')
    setEmailNewPassword('')
    setEmailInfo(null)
    setError(null)
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const u = username.trim().toLowerCase()
      if (!u) {
        setError('Enter your username')
        return
      }
      const res = await apiFetch('/api/auth/recovery/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u }),
      })
      const data = (await res.json().catch(() => ({}))) as LookupResponse & { error?: string }
      if (!res.ok) throw new Error(data.error || 'Request failed')
      if (!data.canRecover || !data.securityQuestion) {
        setError(
          'Recovery is not set up for this username. Use the exact account you registered, try email reset, or contact support.',
        )
        return
      }
      setQuestion(data.securityQuestion)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const u = username.trim().toLowerCase()
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
      const res = await apiFetch('/api/auth/recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: u,
          securityAnswer,
          newPassword,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not reset password')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setEmailInfo(null)
    try {
      const em = resetEmail.trim().toLowerCase()
      if (!em) {
        setError('Enter your account email')
        return
      }
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setEmailInfo(data.message || 'If an account exists for that email, a reset code was sent.')
      setEmailStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyCodeOnly = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const em = resetEmail.trim().toLowerCase()
      const code = resetCode.trim()
      if (!/^\d{6}$/.test(code)) {
        setError('Enter the 6-digit code from your email')
        return
      }
      const res = await apiFetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, code }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Invalid code')
      setEmailInfo('Code is valid. You can set your new password below.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const em = resetEmail.trim().toLowerCase()
      const code = resetCode.trim()
      if (!/^\d{6}$/.test(code)) {
        setError('Enter the 6-digit code from your email')
        return
      }
      if (emailNewPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: em,
          code,
          newPassword: emailNewPassword,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not reset password')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-root">
      <header className="auth-nav">
        <Link to="/" className="auth-nav-logo">
          <img src={footballLogo} alt="" className="auth-nav-logo-img" />
          <span>VirtualXI</span>
        </Link>
        <ThemeToggle buttonClassName="auth-nav-theme" />
      </header>

      <main className="auth-main">
        <div className="auth-card" style={{ maxWidth: 440 }}>
          <div className="auth-badge">Account recovery</div>
          <h1 className="auth-heading">Reset password</h1>

          <div className="auth-field" style={{ marginBottom: 16 }}>
            <span className="auth-field-label">Method</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button
                type="button"
                className={mode === 'question' ? 'auth-btn' : 'auth-input'}
                style={{
                  flex: 1,
                  minWidth: 120,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setMode('question')
                  setError(null)
                  setEmailInfo(null)
                }}
              >
                Security question
              </button>
              <button
                type="button"
                className={mode === 'email' ? 'auth-btn' : 'auth-input'}
                style={{
                  flex: 1,
                  minWidth: 120,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setMode('email')
                  setError(null)
                  setStep(1)
                  setQuestion(null)
                  resetEmailFlow()
                }}
              >
                Email code
              </button>
            </div>
          </div>

          {mode === 'question' ? (
            <p className="auth-subheading">
              Answer the security question you chose when you registered.
            </p>
          ) : (
            <p className="auth-subheading">
              We’ll email a 6-digit code (valid 15 minutes) to the address on your account.
            </p>
          )}

          {done ? (
            <>
              <p className="auth-subheading" style={{ marginBottom: 20 }}>
                Your password was updated. You can sign in with the new password.
              </p>
              <Link
                to="/login"
                className="auth-btn"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
              >
                Back to login
              </Link>
            </>
          ) : mode === 'question' ? (
            step === 1 ? (
              <form onSubmit={handleLookup} className="auth-form">
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="fp-username">
                    Username
                  </label>
                  <input
                    id="fp-username"
                    className="auth-input"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="auth-error-box">{error}</div>}
                <button type="submit" className="auth-btn" disabled={submitting}>
                  {submitting ? 'Checking…' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="auth-form">
                <div className="auth-field">
                  <p className="auth-field-label" style={{ marginBottom: 8 }}>
                    Security question
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: 'var(--text-2)',
                      lineHeight: 1.45,
                    }}
                  >
                    {question}
                  </p>
                </div>
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="fp-answer">
                    Your answer
                  </label>
                  <input
                    id="fp-answer"
                    className="auth-input"
                    type="text"
                    autoComplete="off"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="fp-newpw">
                    New password
                  </label>
                  <input
                    id="fp-newpw"
                    className="auth-input"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="auth-error-box">{error}</div>}
                <button type="submit" className="auth-btn" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Set new password'}
                </button>
                <button
                  type="button"
                  className="auth-switch-link"
                  style={{
                    display: 'block',
                    marginTop: 16,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    font: 'inherit',
                  }}
                  onClick={() => {
                    setStep(1)
                    setError(null)
                    setSecurityAnswer('')
                    setNewPassword('')
                  }}
                >
                  ← Use a different username
                </button>
              </form>
            )
          ) : emailStep === 1 ? (
            <form onSubmit={handleForgotEmail} className="auth-form">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="fp-email">
                  Email
                </label>
                <input
                  id="fp-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {error && <div className="auth-error-box">{error}</div>}
              <button type="submit" className="auth-btn" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailReset} className="auth-form">
              {emailInfo && (
                <p className="account-success" style={{ marginBottom: 12 }}>
                  {emailInfo}
                </p>
              )}
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="fp-code">
                  6-digit code
                </label>
                <input
                  id="fp-code"
                  className="auth-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="fp-email-npw">
                  New password
                </label>
                <input
                  id="fp-email-npw"
                  className="auth-input"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={emailNewPassword}
                  onChange={(e) => setEmailNewPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="auth-error-box">{error}</div>}
              <button type="submit" className="auth-btn" disabled={submitting}>
                {submitting ? 'Saving…' : 'Reset password'}
              </button>
              <button
                type="button"
                className="auth-switch-link"
                style={{
                  display: 'block',
                  marginTop: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  font: 'inherit',
                }}
                onClick={() => void handleVerifyCodeOnly()}
                disabled={submitting}
              >
                Verify code only
              </button>
              <button
                type="button"
                className="auth-switch-link"
                style={{
                  display: 'block',
                  marginTop: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  font: 'inherit',
                }}
                onClick={() => {
                  resetEmailFlow()
                  setError(null)
                }}
              >
                ← Use a different email
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/login" className="auth-switch-link">
              Back to login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
