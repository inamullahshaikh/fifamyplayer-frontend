import type { SVGProps } from 'react'

const size = { width: 36, height: 36, viewBox: '0 0 24 24' as const }

/** Generic appearances — calendar / matches played */
export function IconAppearances(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

/** Generic goals — soccer ball (classic pentagon panel) */
export function IconGoals(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9.25" />
      <polygon points="12,3.8 17.4,9.5 15.2,17.5 8.8,17.5 6.6,9.5" />
    </svg>
  )
}

/** Generic assists — curved through-ball with arrow to target */
export function IconAssists(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="5.5" cy="16" r="2" fill="currentColor" stroke="none" />
      <path d="M8 15.5c3-5.5 8.5-8 13-6.5" />
      <path d="M17.5 7.5L21 9.5 18.5 12" />
      <circle cx="18.5" cy="9.5" r="2.75" />
    </svg>
  )
}

/** Goals + assists — two contribution bars with plus (G+A) */
export function IconGoalInvolvements(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="4" y="8" width="5" height="12" rx="1.2" />
      <path d="M12 9v6M9 12h6" />
      <rect x="15" y="11" width="5" height="9" rx="1.2" />
    </svg>
  )
}

/** Generic rating — star */
export function IconRating(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
