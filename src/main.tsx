import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './AppRouter'
import { THEME_STORAGE_KEY } from './components/ThemeToggle'

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
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
  </StrictMode>,
)
