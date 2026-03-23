/**
 * API URL helper for production deployments.
 *
 * In Vite, environment variables intended for the browser must start with `VITE_`.
 * We expect `VITE_API_BASE_URL` to be something like:
 *   https://your-backend.onrender.com
 * (without a trailing `/api`)
 */
export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  return typeof base === 'string' ? base : ''
}

export function apiUrl(path: string): string {
  // For local dev (or if Vercel env var is missing), keep relative paths.
  const base = getApiBaseUrl()
  if (!base) return path

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

