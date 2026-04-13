import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev CSP: Spline/WebGL + HMR. `unsafe-inline` on script-src is required so @vitejs/plugin-react can
// inject its Fast Refresh preamble (blocked CSP was causing "can't detect preamble" and a blank #root).
const devCsp =
  "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' 'unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' ws: wss: http://127.0.0.1:5000 http://localhost:5000 https:; frame-src https://app.spline.design https://*.spline.design https://*.splinetool.com https://*.splinecode.com"

/** Matches `vercel.json` (no localhost in connect-src). Use `npm run preview` to verify Spline before deploy. */
const previewCsp =
  "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' 'unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-src https://app.spline.design https://*.spline.design https://*.splinetool.com https://*.splinecode.com"

export default defineConfig({
  plugins: [react()],
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': previewCsp,
    },
  },
  server: {
    port: 5173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': devCsp,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
