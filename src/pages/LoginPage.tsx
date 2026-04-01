import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import footballLogo from '../assets/images/football.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = ((location.state as { from?: string } | null)?.from || '/dashboard') as string

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ username, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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

      <main className="auth-main auth-main--split">
        {/* Brand panel — left side */}
        <aside className="auth-brand-side">
          <div className="auth-brand-inner">
            <div className="auth-brand-logo-row">
              <img src={footballLogo} alt="" className="auth-brand-hero-img" />
              <span className="auth-brand-hero-name">VirtualXI</span>
            </div>
            <p className="auth-brand-slogan">
              Track Greatness.<br />
              Build Your Legacy.<br />
              Showcase Your FIFA Career.
            </p>
            <ul className="auth-feat-list">
              <li className="auth-feat"><span className="auth-feat-dot" />Season-by-season stats</li>
              <li className="auth-feat"><span className="auth-feat-dot" />Club & international trophies</li>
              <li className="auth-feat"><span className="auth-feat-dot" />Full transfer history</li>
              <li className="auth-feat"><span className="auth-feat-dot" />Awards timeline</li>
              <li className="auth-feat"><span className="auth-feat-dot" />Career analytics & charts</li>
            </ul>
          </div>
        </aside>

        {/* Form side — right */}
        <div className="auth-form-side">
          <div className="auth-card">
            <div className="auth-badge">Player Login</div>
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to your VirtualXI career hub.</p>

            <form onSubmit={onSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  className="auth-input"
                  type="text"
                  placeholder="e.g. inam_290"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="auth-input"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="auth-error-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button className="auth-btn" type="submit" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <p className="auth-switch">
              No account yet?{' '}
              <Link to="/register" className="auth-switch-link">Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
