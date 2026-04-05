import type { ReactNode } from 'react'

type Variant = 'season' | 'year' | 'dashboard'

const icons: Record<Variant, ReactNode> = {
  season: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  year: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
}

type Props = {
  variant: Variant
  title: string
  children: ReactNode
}

export default function DataCapNotice({ variant, title, children }: Props) {
  return (
    <div className={`data-cap-notice data-cap-notice--${variant}`} role="status">
      <div className="data-cap-notice-icon">{icons[variant]}</div>
      <div className="data-cap-notice-body">
        <p className="data-cap-notice-title">{title}</p>
        <p className="data-cap-notice-desc">{children}</p>
      </div>
    </div>
  )
}

export function DataCapNoticeGroup({ children }: { children: ReactNode }) {
  return <div className="data-cap-notice-group">{children}</div>
}