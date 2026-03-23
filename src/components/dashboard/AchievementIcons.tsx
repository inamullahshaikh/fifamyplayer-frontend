import type { SVGProps } from 'react'

const size = { width: 28, height: 28, viewBox: '0 0 24 24' as const }

/** Club / domestic trophy — cup icon */
export function IconTrophyClub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 8H4a2 2 0 002 2M17 8h3a2 2 0 01-2 2" />
    </svg>
  )
}

/** International trophy — globe / world cup style */
export function IconTrophyIntl(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

/** Award / medal — Ballon d'Or, Golden Boot style */
export function IconAwardMedal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" />
    </svg>
  )
}
