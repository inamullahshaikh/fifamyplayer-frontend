import { useState } from 'react'
import { TEAM_IMAGES } from '../../config/seasonAssets'
import { TEAMS, toTeamSlug, TEAM_LABELS } from '../../config/seasonDataConfig'
import { apiFetch } from '../../lib/api'
import type { TransferRow } from '../../types/dashboard'

type Props = {
  transfers: TransferRow[]
  loading: boolean
  onRefresh: () => void
}

function TeamInline({ name }: { name: string }) {
  const slug = toTeamSlug(name)
  const logo = TEAM_IMAGES[slug]
  return (
    <span className="dash-transfer-team">
      {logo ? (
        <img src={logo} alt="" className="dash-transfer-logo" width={22} height={22} />
      ) : (
        <span className="dash-transfer-logo dash-transfer-logo-placeholder" aria-hidden />
      )}
      <span>{TEAM_LABELS[slug] ?? name}</span>
    </span>
  )
}

const EMPTY_FORM = { season: '', from: '', to: '', value: '' }

function formatTransferFee(raw: string | undefined): string {
  if (!raw) return ''
  const input = String(raw).trim()
  if (!input) return ''

  // Keep non-numeric values like "Free Transfer" as-is.
  if (!/\d/.test(input)) return input

  const normalized = input.replace(/€/g, '').replace(/,/g, '').trim()
  const num = Number(normalized)
  if (!Number.isFinite(num)) return input
  if (num === 0) return 'Free Transfer'

  const compact = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)

  return `${compact.toUpperCase()} €`
}

export default function DashboardTransferHistory({ transfers, loading, onRefresh }: Props) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.season || !form.from || !form.to) {
      setFormError('Season, From, and To are required.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const res = await apiFetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save transfer')
      setForm(EMPTY_FORM)
      setAdding(false)
      onRefresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await apiFetch(`/api/transfers/${id}`, { method: 'DELETE' })
      onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  const sortedTransfers = [...transfers].sort((a, b) => {
    const ya = parseInt(String(a.season ?? '0').split('/')[0], 10)
    const yb = parseInt(String(b.season ?? '0').split('/')[0], 10)
    return ya - yb
  })

  return (
    <section className="dash-transfer-history" aria-label="Transfer history">
      <div className="dash-transfer-header">
        <div>
          <h2 className="dash-section-title">Transfer History</h2>
          <p className="dash-section-sub muted-text">Career moves.</p>
        </div>
        <button
          type="button"
          className="dash-transfer-add-btn"
          onClick={() => { setAdding((v) => !v); setFormError(null) }}
        >
          {adding ? '✕ Cancel' : '+ Add Transfer'}
        </button>
      </div>

      {/* Inline add form */}
      {adding && (
        <form className="dash-transfer-form" onSubmit={handleAdd}>
          <div className="dash-transfer-form-row">
            <div className="dash-transfer-form-field">
              <label className="dash-transfer-form-label" htmlFor="tf-season">Season</label>
              <input
                id="tf-season"
                className="dash-transfer-form-input"
                placeholder="e.g. 2024/25"
                value={form.season}
                onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
              />
            </div>
            <div className="dash-transfer-form-field">
              <label className="dash-transfer-form-label" htmlFor="tf-value">Fee</label>
              <input
                id="tf-value"
                className="dash-transfer-form-input"
                placeholder="e.g. €280M"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
          </div>
          <div className="dash-transfer-form-row">
            <div className="dash-transfer-form-field">
              <label className="dash-transfer-form-label" htmlFor="tf-from">From</label>
              <select
                id="tf-from"
                className="dash-transfer-form-input"
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
              >
                <option value="">Select club…</option>
                {TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="dash-transfer-form-field">
              <label className="dash-transfer-form-label" htmlFor="tf-to">To</label>
              <select
                id="tf-to"
                className="dash-transfer-form-input"
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              >
                <option value="">Select club…</option>
                {TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          {formError && <p className="dash-transfer-form-error">{formError}</p>}
          <button className="dash-transfer-form-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Transfer'}
          </button>
        </form>
      )}

      {loading && <p className="muted-text" style={{ marginTop: 12 }}>Loading transfers…</p>}

      {!loading && sortedTransfers.length === 0 && !adding && (
        <p className="muted-text" style={{ marginTop: 12 }}>
          No transfers recorded yet. Click <strong>+ Add Transfer</strong> to log one.
        </p>
      )}

      {sortedTransfers.length > 0 && (
        <ol className="dash-transfer-timeline">
          {sortedTransfers.map((transfer) => (
            <li key={transfer._id} className="dash-transfer-item">
              <span className="dash-transfer-dot" aria-hidden />
              <div className="dash-transfer-content">
                <span className="dash-transfer-date">{transfer.season ?? '—'}</span>
                <span className="dash-transfer-flow">
                  <TeamInline name={transfer.from ?? ''} />
                  <span className="dash-transfer-arrow" aria-hidden />
                  <TeamInline name={transfer.to ?? ''} />
                </span>
                {transfer.value && (
                  <span className="dash-transfer-amount">{formatTransferFee(transfer.value)}</span>
                )}
              </div>
              <button
                type="button"
                className="dash-transfer-delete"
                disabled={deletingId === transfer._id}
                onClick={() => transfer._id && handleDelete(transfer._id)}
                aria-label="Delete transfer"
                title="Delete"
              >
                {deletingId === transfer._id ? '…' : '✕'}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
