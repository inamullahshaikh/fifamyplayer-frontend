/** In-app paths allowed after picking a career (open redirect guard). */
const ALLOWED = new Set([
  '/dashboard',
  '/season-data',
  '/yearly-data',
  '/stats',
  '/trophy-cabinet',
  '/awards',
  '/account',
])

/**
 * Where to send the user after they confirm a career on `/select-career`.
 * `requested` usually comes from `location.state.from` after a prior RequireAuth redirect.
 */
export function postCareerDestination(requested: unknown): string {
  if (typeof requested !== 'string' || !requested.startsWith('/')) return '/dashboard'
  if (
    requested === '/login' ||
    requested === '/register' ||
    requested === '/select-career'
  ) {
    return '/dashboard'
  }
  if (ALLOWED.has(requested)) return requested
  return '/dashboard'
}
