// @ts-nocheck

import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import footballLogo from './assets/images/football.png'
import Spline from '@splinetool/react-spline'
import "./App.css";

// ─── Social icon SVGs ────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
        fill="#f1f5f9"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <path
        d="M2 6l10 7 10-7"
        stroke="#ef4444"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M2 6l10 7 10-7v12H2V6z" fill="none" />
    </svg>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

interface FeatureProps {
  icon: string;
  title: string;
  desc: string;
}

function Feature({ icon, title, desc }: FeatureProps) {
  return (
    <div className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

// ─── Social link ─────────────────────────────────────────────────────────────

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  handle: string;
  color: string;
}

function SocialLink({ href, icon, label, handle, color }: SocialLinkProps) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="social-link"
      style={{ "--social-color": color } as React.CSSProperties}
    >
      <span className="social-icon-wrap">{icon}</span>
      <span className="social-info">
        <span className="social-label">{label}</span>
        <span className="social-handle">{handle}</span>
      </span>
      <svg
        className="social-arrow"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

type Player = {
  _id: string
  name: string
  rating: string
  nationality: string
  position: string
  value: number
}

function DashboardSection() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch('/api/players')
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)

        const data = (await res.json()) as Player[]
        setPlayers(Array.isArray(data) ? data : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load players')
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  return (
    <section className="dashboard" id="dashboard">
      <div className="section-inner">
        <div className="dashboard-back">
          <Link to="/" className="btn-ghost">
            ← Back to landing
          </Link>
        </div>
        <p className="section-eyebrow">Dashboard</p>
        <h2 className="section-heading">Your VirtualXI career hub</h2>
        <p className="section-sub">
          Quick preview of the player profiles stored in your backend. Season stats,
          trophies and transfers will be added next.
        </p>

        {loading && <p className="muted-text">Loading players…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="players-grid">
            {players.map((p) => (
              <div key={p._id} className="player-card">
                <div className="player-name">{p.name}</div>
                <div className="player-sub">
                  {p.position} • Rating {p.rating}
                </div>
                <div className="player-meta">Nationality: {p.nationality}</div>
                <div className="player-meta">Value: {p.value}</div>
              </div>
            ))}

            {players.length === 0 && (
              <p className="muted-text">No players found.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('virtualxi-theme')
    if (saved === 'light' || saved === 'dark') return saved
    const prefersDark =
      window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    localStorage.setItem('virtualxi-theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const [splineHover, setSplineHover] = useState(false)
  const splineHoverRef = useRef(splineHover)
  useEffect(() => {
    splineHoverRef.current = splineHover
  }, [splineHover])

  // Prevent mouse/trackpad wheel from zooming the Spline while hovering it.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!splineHoverRef.current) return
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const themeIcon = useMemo(() => {
    if (theme === 'dark') {
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )
    }

    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }, [theme])

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span className="logo-mark" aria-hidden="true">
              <img className="logo-img logo-img--light" src={footballLogo} alt="" />
              <img className="logo-img logo-img--dark" src={footballLogo} alt="" />
            </span>
            <span className="logo-name">VirtualXI</span>
          </a>
          <div className="nav-links">
            <button onClick={() => scrollTo("about")} className="nav-link">
              About
            </button>
            <button onClick={() => scrollTo("connect")} className="nav-link">
              Connect
            </button>
          </div>
          <button
            className="nav-theme"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            title="Toggle theme"
            type="button"
          >
            {themeIcon}
          </button>
          <button className="nav-cta" onClick={() => scrollTo("about")} type="button">
            Explore the app
          </button>
        </div>
      </nav>

      {location.pathname === "/dashboard" ? (
        <main>
          <DashboardSection />
        </main>
      ) : (
        <main>
          {/* ── Hero ── */}
          <section className="hero" id="hero">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="badge-dot" />
              FIFA Career Tracker
            </div>
            <h1 className="hero-headline">
              Track Greatness.
              <br />
              Build Your <span className="accent">Legacy.</span>
              <br />
              Showcase Your FIFA Career.
            </h1>
            <p className="hero-sub">
              VirtualXI is a personal career dashboard for your FIFA created
              player. Log every season, trophy, transfer and milestone — and
              watch your legacy unfold.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => scrollTo("about")}>
                Discover VirtualXI
              </button>
              <button className="btn-ghost" onClick={() => scrollTo("connect")}>
                Get in touch
              </button>
              <Link className="btn-ghost" to="/dashboard">
                Dashboard
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-val">Seasons</span>
                <span className="stat-lbl">Tracked per club</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-val">Trophies</span>
                <span className="stat-lbl">Club &amp; international</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-val">Transfers</span>
                <span className="stat-lbl">Full career history</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div
              className="hero-spline"
              onMouseEnter={() => setSplineHover(true)}
              onMouseLeave={() => setSplineHover(false)}
              onWheel={(e) => e.preventDefault()}
            >
              <Spline
                scene="https://prod.spline.design/qWUGvm4jqwfAxa0R/scene.splinecode"
                style={{ background: "transparent" }}
                onLoad={(splineApp) => {
                    // Remove grey background + disable zoom while keeping rotation.
                  try {
                      splineApp.setZoom(1)
                  } catch (e) {
                    // ignore if the scene doesn't support it
                  }
                    try {
                      splineApp.setBackgroundColor("rgba(0, 0, 0, 0)")
                    } catch (e) {
                      // ignore if not supported
                    }
                    try {
                      // Most Spline scenes use OrbitControls-like camera controls.
                      const controls: any = (splineApp as any).controls
                      if (controls) {
                        controls.enableZoom = false
                        controls.enablePan = false
                        controls.enableRotate = true
                        controls.zoomSpeed = 0
                      }
                    } catch (e) {
                      // ignore if controls can't be patched
                    }
                }}
              />
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="about" id="about">
          <div className="section-inner">
            <p className="section-eyebrow">What is VirtualXI?</p>
            <h2 className="section-heading">
              Your FIFA career deserves
              <br />
              to be remembered.
            </h2>
            <p className="section-sub">
              Most FIFA players put in hundreds of hours building their created
              player — but the stats, trophies and memories stay buried in a
              save file. VirtualXI pulls it all into one beautiful, shareable
              dashboard so your legacy lives beyond the game.
            </p>

            <div className="features-grid">
              <Feature
                icon="📊"
                title="Season-by-season stats"
                desc="Log goals, assists, appearances and average rating for every season, across every club and competition."
              />
              <Feature
                icon="🏆"
                title="Trophy cabinet"
                desc="Track every league title, cup and international trophy. Club glory and international glory, all in one place."
              />
              <Feature
                icon="🔁"
                title="Transfer history"
                desc="Record every club move, fee and season — build a complete picture of your player's career journey."
              />
              <Feature
                icon="🌍"
                title="International career"
                desc="Separate tracking for your international duty. Qualifiers, tournaments and friendlies all logged."
              />
              <Feature
                icon="🎖️"
                title="Awards & milestones"
                desc="Log individual awards like TOTY, POTM and POTY. Celebrate the highlights of each season."
              />
              <Feature
                icon="📈"
                title="Yearly progression"
                desc="A year-by-year goals and assists chart showing how your player developed from debut to peak."
              />
            </div>
          </div>
        </section>

        {/* ── Connect ── */}
        <section className="connect" id="connect">
          <div className="section-inner connect-inner">
            <div className="connect-text">
              <p className="section-eyebrow">Stay connected</p>
              <h2 className="section-heading">Follow the journey.</h2>
              <p className="section-sub">
                VirtualXI is actively being built. Follow along on social media
                for updates, sneak peeks and community highlights, or reach out
                directly via email.
              </p>
            </div>
            <div className="social-links">
              <SocialLink
                href="https://www.instagram.com/inam.290/"
                icon={<InstagramIcon />}
                label="Instagram"
                handle="@virtualxi"
                color="#e1306c"
              />
              <SocialLink
                href="https://www.linkedin.com/in/inam-ullah-shaikh/"
                icon={<LinkedInIcon />}
                label="LinkedIn"
                handle="VirtualXI"
                color="#0077b5"
              />
              <SocialLink
                href="https://www.youtube.com/@inamullahshaikh655"
                icon={<YouTubeIcon />}
                label="YouTube"
                handle="@VirtualXI"
                color="#ff0000"
              />
              <SocialLink
                href="mailto:inamullahshaikh01@gmail.com"
                icon={<GmailIcon />}
                label="Email"
                handle="inamullahshaikh01@gmail.com"
                color="#ea4335"
              />
            </div>
          </div>
        </section>
      </main>
      )}

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <a href="#" className="nav-logo">
            <span className="logo-mark" aria-hidden="true">
              <img className="logo-img logo-img--light" src={footballLogo} alt="" />
              <img className="logo-img logo-img--dark" src={footballLogo} alt="" />
            </span>
            <span className="logo-name">VirtualXI</span>
          </a>
          <p className="footer-slogan">
            Track Greatness. Build Your Legacy. Showcase Your FIFA Career.
          </p>
          <p className="footer-copy">
            © {new Date().getFullYear()} VirtualXI. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
