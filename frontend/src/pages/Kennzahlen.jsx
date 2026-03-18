import React, { useState } from 'react'
import { useApp } from '../App.jsx'

const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']
const HM_COLORS = {
  hm1: '#0071e3', hm2: '#34aadc', hm3: '#30d158',
  hm4: '#ff9f0a', hm5: '#ff453a', hm6: '#bf5af2'
}

function fmt(v, type) {
  if (v === null || v === undefined) return '—'
  if (type === 'eur') return Math.round(v).toLocaleString('de-DE') + ' €'
  if (type === 'pct') return (v * 100).toFixed(2) + '%'
  if (type === 'pct4') return (v * 100).toFixed(4) + '%'
  if (type === 'x') return v.toFixed(4) + '×'
  if (type === 'yr') return v != null ? `Jahr ${v}` : '—'
  if (type === 'bool') return v ? '✓' : '✗'
  if (type === 'ct') return (v * 100).toFixed(4) + ' ct/kWh'
  return String(v)
}

const KPI_GROUPS = [
  {
    label: 'Wertschöpfung',
    kpis: [
      { key: 'npv_20', label: 'NPV 0–20 Jahre', type: 'eur' },
      { key: 'npv_30', label: 'NPV 0–30 Jahre', type: 'eur' },
      { key: 'irr', label: 'IRR (30J)', type: 'pct' },
      { key: 'eff_20', label: 'Eff. Überschuss 20J', type: 'eur' },
      { key: 'eff_30', label: 'Eff. Überschuss 30J', type: 'eur' },
    ]
  },
  {
    label: 'Amortisation',
    kpis: [
      { key: 'amort_dyn_20', label: 'Dyn. Amortisation 20J', type: 'yr' },
      { key: 'amort_dyn_30', label: 'Dyn. Amortisation 30J', type: 'yr' },
      { key: 'amort_stat_20', label: 'Stat. Amortisation', type: 'yr' },
    ]
  },
  {
    label: 'Kapitalstruktur & Schulden',
    kpis: [
      { key: 'dscr_min', label: 'DSCR Minimum', type: 'x' },
      { key: 'dscr_ok', label: 'DSCR erfüllt', type: 'bool' },
      { key: 'llcr', label: 'LLCR', type: 'x' },
      { key: 'wacc', label: 'WACC', type: 'pct' },
    ]
  },
  {
    label: 'Rendite',
    kpis: [
      { key: 'roi_20', label: 'ROI 20J', type: 'pct' },
      { key: 'roi_30', label: 'ROI 30J', type: 'pct' },
      { key: 'gk_rent_initial', label: 'GK-Rendite Jahr 1', type: 'pct' },
      { key: 'gk_rent_avg', label: 'GK-Rendite Ø 20J', type: 'pct' },
      { key: 'ek_rent_initial', label: 'EK-Rendite Jahr 1', type: 'pct' },
      { key: 'ek_rent_avg', label: 'EK-Rendite Ø 20J', type: 'pct' },
      { key: 'lcoe', label: 'LCOE', type: 'ct' },
    ]
  }
]

export default function Kennzahlen() {
  const { results } = useApp()
  const [filter, setFilter] = useState('all')

  if (!results) return <div style={{ color: '#86868b' }}>Lade…</div>

  const displayHMs = filter === 'all' ? HM_KEYS : [filter]

  function exportCSV() {
    const rows = [['Gruppe', 'KPI', ...HM_KEYS.map(h => h.toUpperCase())]]
    for (const group of KPI_GROUPS) {
      for (const kpi of group.kpis) {
        rows.push([
          group.label, kpi.label,
          ...HM_KEYS.map(hm => {
            const v = results[hm]?.kpis?.[kpi.key]
            return v !== null && v !== undefined ? v : ''
          })
        ])
      }
    }
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'kennzahlen.csv'; a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Kennzahlen</h1>
          <p style={{ color: '#86868b', fontSize: 15 }}>Alle berechneten Finanzkennzahlen im Vergleich</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ border: '1px solid #d2d2d7', borderRadius: 8, padding: '8px 14px', fontSize: 14, background: '#fff' }}
          >
            <option value="all">Alle HMs</option>
            {HM_KEYS.map(hm => <option key={hm} value={hm}>{hm.toUpperCase()}</option>)}
          </select>
          <button
            onClick={exportCSV}
            style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
          >
            CSV Export
          </button>
        </div>
      </div>

      {KPI_GROUPS.map(group => (
        <div key={group.label} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #e8e8ed', fontSize: 13, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {group.label}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f5' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: '#86868b', width: 220 }}>KPI</th>
                {displayHMs.map(hm => (
                  <th key={hm} style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: HM_COLORS[hm] }}>
                    {hm.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.kpis.map((kpi, ki) => {
                const vals = displayHMs.map(hm => results[hm]?.kpis?.[kpi.key])
                let bestIdx = -1
                if (['eur', 'pct', 'x', 'ct', 'pct4'].includes(kpi.type) && kpi.key !== 'dscr_ok') {
                  const numVals = vals.map(v => (v !== null && v !== undefined ? v : -Infinity))
                  bestIdx = numVals.indexOf(Math.max(...numVals))
                }
                if (kpi.type === 'yr') {
                  const numVals = vals.map(v => (v !== null && v !== undefined ? v : Infinity))
                  const min = Math.min(...numVals)
                  if (min !== Infinity) bestIdx = numVals.indexOf(min)
                }
                return (
                  <tr key={kpi.key} style={{ borderBottom: '1px solid #f5f5f7', background: ki % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '9px 20px', color: '#515154' }}>{kpi.label}</td>
                    {displayHMs.map((hm, hi) => {
                      const val = vals[hi]
                      const isBest = hi === bestIdx && val !== null && val !== undefined
                      const isDscrBool = kpi.key === 'dscr_ok'
                      return (
                        <td key={hm} style={{
                          padding: '9px 16px', textAlign: 'right',
                          fontWeight: isBest ? 600 : 400,
                          color: isDscrBool
                            ? (val ? '#00875a' : '#cc0000')
                            : isBest ? '#0071e3' : '#1d1d1f',
                        }}>
                          {isDscrBool ? (val ? '● ✓' : '● ✗') : fmt(val, kpi.type)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
