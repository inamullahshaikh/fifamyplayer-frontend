import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './AppRouter'
import RenderErrorBoundary from './components/RenderErrorBoundary'
import { THEME_STORAGE_KEY } from './components/ThemeToggle'
import { AuthProvider } from './auth/AuthContext'
import { CareerProvider } from './career/CareerContext'

/* Apply saved theme before paint to avoid flash on dashboard-only visits */
try {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.dataset.theme = saved
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CareerProvider>
        <BrowserRouter>
          <RenderErrorBoundary
            fallback={
              <div
                style={{
                  minHeight: '100dvh',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 24,
                  fontFamily: 'system-ui, sans-serif',
                  color: '#334155',
                  textAlign: 'center',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong</p>
                  <p style={{ fontSize: 14, marginBottom: 16 }}>
                    Try a hard refresh. If this persists, open the browser console (F12) and check for errors.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Reload
                  </button>
                </div>
              </div>
            }
          >
            <AppRouter />
          </RenderErrorBoundary>
        </BrowserRouter>
      </CareerProvider>
    </AuthProvider>
  </StrictMode>,
)
