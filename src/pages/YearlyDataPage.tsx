import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { normalizeYearlyData } from '../lib/dashboardAggregates'
import { useChartTheme } from '../hooks/useChartTheme'
import { apiFetch } from '../lib/api'
import { useCareer } from '../career/CareerContext'
import { useDataEntryStatus } from '../hooks/useDataEntryStatus'
import DataCapNotice from '../components/DataCapNotice'
import type { YearlyDataRow } from '../types/dashboard'

const GOALS_COLOR = '#2563eb'
const ASSISTS_COLOR = '#0ea5e9'

const API = '/api/yearly_data'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

async function postJson(url: string, body: object) {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

async function putJson(url: string, body: object) {
  const res = await apiFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

async function deleteJson(url: string) {
  const res = await apiFetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}

const YEAR_REGEX = /^\d{4}$/

export default function YearlyDataPage() {
  const { activeCareerPlayerId } = useCareer()
  const dataEntry = useDataEntryStatus()
  const [data, setData] = useState<YearlyDataRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState('')
  const [goals, setGoals] = useState('')
  const [assists, setAssists] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editYear, setEditYear] = useState('')
  const [editGoals, setEditGoals] = useState('')
  const [editAssists, setEditAssists] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const rows = await fetchJson<YearlyDataRow[]>(API)
      const sorted = (Array.isArray(rows) ? rows : []).sort((a, b) =>
        String(a.year ?? '').localeCompare(String(b.year ?? ''), undefined, { numeric: true })
      )
      setData(sorted)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeCareerPlayerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (dataEntry.yearCapReached) {
      setFormError(
        `You already have ${dataEntry.maxYears} calendar years. Delete or edit an existing year to change totals.`,
      )
      return
    }
    const y = year.trim()
    const g = parseInt(goals, 10) || 0
    const a = parseInt(assists, 10) || 0

    if (!YEAR_REGEX.test(y)) {
      setFormError('Enter a valid 4-digit year (e.g. 2024)')
      return
    }

    if (data.some((d) => String(d.year) === y)) {
      setFormError('This year already exists. Use edit to update.')
      return
    }

    setSaving(true)
    try {
      await postJson(API, { year: y, goals: g, assists: a })
      setYear('')
      setGoals('')
      setAssists('')
      dataEntry.refresh()
      await loadData()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (row: YearlyDataRow) => {
    setEditId(row._id ?? null)
    setEditYear(String(row.year ?? ''))
    setEditGoals(String(row.goals ?? ''))
    setEditAssists(String(row.assists ?? ''))
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditYear('')
    setEditGoals('')
    setEditAssists('')
  }

  const saveEdit = async () => {
    if (!editId) return
    const g = parseInt(editGoals, 10) || 0
    const a = parseInt(editAssists, 10) || 0
    if (!YEAR_REGEX.test(editYear.trim())) return

    setSaving(true)
    try {
      await putJson(`${API}/${editId}`, { year: editYear.trim(), goals: g, assists: a })
      cancelEdit()
      dataEntry.refresh()
      await loadData()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this year?')) return
    try {
      await deleteJson(`${API}/${id}`)
      dataEntry.refresh()
      await loadData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const totalGoals = data.reduce((s, d) => s + (Number(d.goals) || 0), 0)
  const totalAssists = data.reduce((s, d) => s + (Number(d.assists) || 0), 0)
  const chartData = normalizeYearlyData(data)
  const chartTheme = useChartTheme()
  const tooltipStyle = {
    backgroundColor: chartTheme.tooltipBg,
    border: `1px solid ${chartTheme.tooltipBorder}`,
    borderRadius: 10,
    fontSize: 12,
  }

  return (
    <section className="dash-view dash-yearly-data">
      <header className="ph ph--yearly">
        <div className="ph-glow" aria-hidden />
        <div className="ph-inner">
          <div className="ph-text">
            <p className="ph-kicker"><span className="ph-kicker-dot" aria-hidden />Progression</p>
            <h1 className="ph-title">Yearly Data</h1>
            <p className="ph-desc">
              Track goals and assists by calendar year. Build your career arc from debut to peak.
            </p>
          </div>
          <svg className="ph-deco" aria-hidden viewBox="0 0 200 130" fill="none">
            <polyline
              points="10,110 40,90 70,70 100,50 130,40 160,25 190,15"
              stroke="currentColor" strokeWidth="3" strokeOpacity="0.35"
              fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
            <polyline
              points="10,110 40,90 70,70 100,50 130,40 160,25 190,15"
              stroke="currentColor" strokeWidth="10" strokeOpacity="0.05"
              fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="10"  cy="110" r="5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="70"  cy="70"  r="5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="130" cy="40"  r="5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="190" cy="15"  r="6" fill="currentColor" fillOpacity="0.65" />
            <line x1="10" y1="118" x2="190" y2="118" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
          </svg>
        </div>
        {data.length > 0 && (
          <div className="ph-bottom">
            <div className="ph-stat">
              <span className="ph-stat-n">{data.length}</span>
              <span className="ph-stat-l">Years tracked</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{totalGoals}</span>
              <span className="ph-stat-l">Total goals</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{totalAssists}</span>
              <span className="ph-stat-l">Total assists</span>
            </div>
            <span className="ph-div" aria-hidden />
            <div className="ph-stat">
              <span className="ph-stat-n">{totalGoals + totalAssists}</span>
              <span className="ph-stat-l">G+A combined</span>
            </div>
          </div>
        )}
      </header>

      {dataEntry.yearCapReached && (
        <DataCapNotice variant="year" title={`Year cap: ${dataEntry.yearCount}/${dataEntry.maxYears} calendar years`}>
          You cannot add another year; you can still edit or delete rows in the table below.
        </DataCapNotice>
      )}

      <div className="yearly-main">
        {chartData.length > 0 && (
          <div className="yearly-charts">
            <div className="yearly-chart-card yearly-chart-card--bar">
              <div className="yearly-chart-head">
                <h3 className="yearly-chart-title">Goals & assists by year</h3>
                <p className="yearly-chart-sub">Compare your output across seasons</p>
              </div>
              <div className="yearly-chart-canvas">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: chartTheme.axis, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                    />
                    <YAxis
                      tick={{ fill: chartTheme.axis, fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: chartTheme.axis }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="goals" name="Goals" fill={GOALS_COLOR} radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="assists" name="Assists" fill={ASSISTS_COLOR} radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="yearly-chart-card yearly-chart-card--line">
              <div className="yearly-chart-head">
                <h3 className="yearly-chart-title">Career trend</h3>
                <p className="yearly-chart-sub">Goals and assists over time</p>
              </div>
              <div className="yearly-chart-canvas">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: chartTheme.axis, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                    />
                    <YAxis
                      tick={{ fill: chartTheme.axis, fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: chartTheme.axis }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="goals"
                      name="Goals"
                      stroke={GOALS_COLOR}
                      strokeWidth={2.5}
                      dot={{ fill: GOALS_COLOR, strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="assists"
                      name="Assists"
                      stroke={ASSISTS_COLOR}
                      strokeWidth={2.5}
                      dot={{ fill: ASSISTS_COLOR, strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="yearly-form-card">
          <div className="yearly-form-card-head">
            <div className="yearly-form-card-icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="yearly-form-card-titles">
              <h3 className="yearly-form-title">Add a year</h3>
              <p className="yearly-form-subtitle">Calendar-year totals for goals and assists.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="yearly-form">
            <div className="yearly-form-panel">
              <div className="yearly-form-layout">
                <label className="yearly-field">
                  <span className="yearly-field-label">Year</span>
                  <input
                    type="text"
                    className="yearly-input"
                    placeholder="e.g. 2024"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="off"
                    disabled={dataEntry.yearCapReached}
                  />
                </label>
                <label className="yearly-field">
                  <span className="yearly-field-label">Goals</span>
                  <input
                    type="number"
                    min={0}
                    className="yearly-input"
                    placeholder="0"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    disabled={dataEntry.yearCapReached}
                  />
                </label>
                <label className="yearly-field">
                  <span className="yearly-field-label">Assists</span>
                  <input
                    type="number"
                    min={0}
                    className="yearly-input"
                    placeholder="0"
                    value={assists}
                    onChange={(e) => setAssists(e.target.value)}
                    disabled={dataEntry.yearCapReached}
                  />
                </label>
                <div className="yearly-form-submit-wrap">
                  <button type="submit" className="yearly-btn yearly-btn--submit" disabled={saving || dataEntry.yearCapReached}>
                    {saving ? 'Adding…' : 'Add year'}
                  </button>
                </div>
              </div>
              {formError && <p className="yearly-form-error">{formError}</p>}
            </div>
          </form>
        </div>

        <div className="yearly-summary">
          {data.length > 0 && (
            <div className="yearly-summary-cards">
              <div className="yearly-summary-card">
                <span className="yearly-summary-value">{data.length}</span>
                <span className="yearly-summary-label">Years tracked</span>
              </div>
              <div className="yearly-summary-card yearly-summary-card--goals">
                <span className="yearly-summary-value">{totalGoals.toLocaleString()}</span>
                <span className="yearly-summary-label">Total goals</span>
              </div>
              <div className="yearly-summary-card yearly-summary-card--assists">
                <span className="yearly-summary-value">{totalAssists.toLocaleString()}</span>
                <span className="yearly-summary-label">Total assists</span>
              </div>
              <div className="yearly-summary-card yearly-summary-card--total">
                <span className="yearly-summary-value">{(totalGoals + totalAssists).toLocaleString()}</span>
                <span className="yearly-summary-label">Goals + assists</span>
              </div>
            </div>
          )}

          <div className="yearly-list-wrap">
            <h3 className="yearly-list-title">Your years</h3>
            {loading ? (
              <p className="yearly-empty muted-text">Loading…</p>
            ) : error ? (
              <div className="yearly-alert yearly-alert--error" role="alert">
                {error}
              </div>
            ) : data.length === 0 ? (
              <div className="yearly-empty-state">
                <div className="yearly-empty-icon">📊</div>
                <p className="yearly-empty-title">No yearly data yet</p>
                <p className="yearly-empty-desc muted-text">
                  Add your first year above to start tracking goals and assists.
                </p>
              </div>
            ) : (
              <div className="yearly-grid">
                {data.map((row) => (
                  <div key={row._id} className="yearly-card">
                    {editId === row._id ? (
                      <div className="yearly-card-edit">
                        <input
                          type="text"
                          className="yearly-input yearly-input--sm"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          maxLength={4}
                          placeholder="Year"
                        />
                        <input
                          type="number"
                          min={0}
                          className="yearly-input yearly-input--sm"
                          value={editGoals}
                          onChange={(e) => setEditGoals(e.target.value)}
                          placeholder="Goals"
                        />
                        <input
                          type="number"
                          min={0}
                          className="yearly-input yearly-input--sm"
                          value={editAssists}
                          onChange={(e) => setEditAssists(e.target.value)}
                          placeholder="Assists"
                        />
                        <div className="yearly-card-actions">
                          <button
                            type="button"
                            className="yearly-btn yearly-btn--sm yearly-btn--primary"
                            onClick={saveEdit}
                            disabled={saving}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="yearly-btn yearly-btn--sm yearly-btn--ghost"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="yearly-card-header">
                          <span className="yearly-card-year">{row.year}</span>
                          <div className="yearly-card-actions">
                            <button
                              type="button"
                              className="yearly-btn-icon"
                              onClick={() => startEdit(row)}
                              aria-label="Edit"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              className="yearly-btn-icon yearly-btn-icon--danger"
                              onClick={() => row._id && handleDelete(row._id)}
                              aria-label="Delete"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="yearly-card-stats">
                          <div className="yearly-stat yearly-stat--goals">
                            <span className="yearly-stat-value">{Number(row.goals) || 0}</span>
                            <span className="yearly-stat-label">Goals</span>
                          </div>
                          <div className="yearly-stat yearly-stat--assists">
                            <span className="yearly-stat-value">{Number(row.assists) || 0}</span>
                            <span className="yearly-stat-label">Assists</span>
                          </div>
                          <div className="yearly-stat yearly-stat--total">
                            <span className="yearly-stat-value">{(Number(row.goals) || 0) + (Number(row.assists) || 0)}</span>
                            <span className="yearly-stat-label">Total</span>
                          </div>
                        </div>
                        <div className="yearly-card-bars">
                          <div className="yearly-bar-item">
                            <div className="yearly-bar-track">
                              <div
                                className="yearly-bar-fill yearly-bar-fill--goals"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (100 * (Number(row.goals) || 0)) /
                                      Math.max(1, ...data.map((d) => Number(d.goals) || 0))
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="yearly-bar-legend">G</span>
                          </div>
                          <div className="yearly-bar-item">
                            <div className="yearly-bar-track">
                              <div
                                className="yearly-bar-fill yearly-bar-fill--assists"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (100 * (Number(row.assists) || 0)) /
                                      Math.max(1, ...data.map((d) => Number(d.assists) || 0))
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="yearly-bar-legend">A</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
