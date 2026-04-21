import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import footballLogo from '../assets/images/football.png'
import { SECURITY_QUESTIONS } from '../config/securityQuestions'

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0] ?? '')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/select-career" replace state={{ from: '/dashboard' }} />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register({
        username,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        securityQuestion,
        securityAnswer: securityAnswer.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
            <div className="auth-badge">New Account</div>
            <h1 className="auth-heading">Create account</h1>
            <p className="auth-subheading">One account — multiple created-player careers.</p>

            <form onSubmit={onSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  className="auth-input"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-name">Display name</label>
                <input
                  id="reg-name"
                  className="auth-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  className="auth-input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-sec-q">
                  Security question (for password reset)
                </label>
                <select
                  id="reg-sec-q"
                  className="auth-input"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  required
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="reg-sec-a">Your answer</label>
                <input
                  id="reg-sec-a"
                  className="auth-input"
                  type="text"
                  placeholder="You’ll need this exact meaning if you forget your password"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  autoComplete="off"
                  minLength={2}
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
                {submitting ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-switch-link">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
