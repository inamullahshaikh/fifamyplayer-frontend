import type { CSSProperties, ReactNode } from 'react'

interface SocialLinkProps {
  href: string
  icon: ReactNode
  label: string
  handle: string
  color: string
}

export default function SocialLink({
  href,
  icon,
  label,
  handle,
  color,
}: SocialLinkProps) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="social-link"
      style={{ '--social-color': color } as CSSProperties}
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
  )
}

