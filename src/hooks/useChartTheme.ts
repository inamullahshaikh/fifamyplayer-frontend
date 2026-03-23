import { useEffect, useState } from 'react'

/** Recharts tick/grid colors that track `html[data-theme]`. */
export function useChartTheme() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
  )

  useEffect(() => {
    const el = document.documentElement
    const sync = () => setDark(el.dataset.theme === 'dark')
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  return {
    dark,
    axis: dark ? '#94a3b8' : '#64748b',
    grid: dark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.18)',
    tooltipBg: dark ? '#0f172a' : '#ffffff',
    tooltipBorder: dark ? 'rgba(148, 163, 184, 0.25)' : '#e2e8f0',
  }
}
