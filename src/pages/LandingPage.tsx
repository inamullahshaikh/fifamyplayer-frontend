import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

import footballLogo from '../assets/images/football.png'
import FeatureCard from '../components/FeatureCard'
import SocialLink from '../components/SocialLink'
import ThemeToggle from '../components/ThemeToggle'
import {
  GmailIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from '../components/SocialIcons'

export default function LandingPage() {
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
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
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
            <button
              onClick={() => scrollTo('about')}
              className="nav-link"
              type="button"
            >
              About
            </button>
            <button
              onClick={() => scrollTo('connect')}
              className="nav-link"
              type="button"
            >
              Connect
            </button>
          </div>

          <ThemeToggle buttonClassName="nav-theme" />

          <Link className="nav-cta" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </nav>

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
              <button
                className="btn-primary"
                onClick={() => scrollTo('about')}
                type="button"
              >
                Discover VirtualXI
              </button>
              <button
                className="btn-ghost"
                onClick={() => scrollTo('connect')}
                type="button"
              >
                Get in touch
              </button>
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
                style={{ background: 'transparent' }}
                onLoad={(splineApp) => {
                  try {
                    splineApp.setZoom(1)
                  } catch {
                    // ignore if the scene doesn't support it
                  }

                  try {
                    splineApp.setBackgroundColor('rgba(0, 0, 0, 0)')
                  } catch {
                    // ignore if not supported
                  }

                  try {
                    const controls: any = (splineApp as any).controls
                    if (controls) {
                      controls.enableZoom = false
                      controls.enablePan = false
                      controls.enableRotate = true
                      controls.zoomSpeed = 0
                    }
                  } catch {
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
              <FeatureCard
                icon="📊"
                title="Season-by-season stats"
                desc="Log goals, assists, appearances and average rating for every season, across every club and competition."
              />
              <FeatureCard
                icon="🏆"
                title="Trophy cabinet"
                desc="Track every league title, cup and international trophy. Club glory and international glory, all in one place."
              />
              <FeatureCard
                icon="🔁"
                title="Transfer history"
                desc="Record every club move, fee and season — build a complete picture of your player's career journey."
              />
              <FeatureCard
                icon="🌍"
                title="International career"
                desc="Separate tracking for your international duty. Qualifiers, tournaments and friendlies all logged."
              />
              <FeatureCard
                icon="🎖️"
                title="Awards & milestones"
                desc="Log individual awards like TOTY, POTM and POTY. Celebrate the highlights of each season."
              />
              <FeatureCard
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

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <Link to="/" className="nav-logo">
            <span className="logo-mark" aria-hidden="true">
              <img className="logo-img logo-img--light" src={footballLogo} alt="" />
              <img className="logo-img logo-img--dark" src={footballLogo} alt="" />
            </span>
            <span className="logo-name">VirtualXI</span>
          </Link>
          <p className="footer-slogan">
            Track Greatness. Build Your Legacy. Showcase Your FIFA Career.
          </p>
          <p className="footer-copy">
            © {new Date().getFullYear()} VirtualXI. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}

