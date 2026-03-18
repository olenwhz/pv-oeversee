import React, { useState } from 'react'
import { useApp } from '../App.jsx'

const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']

function fmt(v) {
  if (v === null || v === undefined) return '—'
  return Math.round(v).toLocaleString('de-DE')
}

function exportCSV(years, hm) {
  const headers = ['Jahr','Erlöse','OPEX','AfA','EBIT','Zinsen','EBT','GewSt','EAT','CF Steuern','Tilgung','CF Tilgung','DSCR']
  const rows = years.map((y, i) => [
    y.year, Math.round(y.erloes), Math.round(y.opex), Math.round(y.afa),
    Math.round(y.ebit), Math.round(y.zinsen), Math.round(y.ebt),
    Math.round(y.gewst), Math.round(y.eat), Math.round(y.cf_steuern),
    Math.round(y.tilgung), Math.round(y.cf_tilgung), ''
  ])
  const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `zahlungsreihen_${hm}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function Zahlungsreihen() {
  const { results } = useApp()
  const [selectedHm, setSelectedHm] = useState('hm1')

  if (!results) return <div style={{ color: '#86868b' }}>Lade…</div>

  const years = results[selectedHm]?.years || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Zahlungsreihen</h1>
          <p style={{ color: '#86868b', fontSize: 15 }}>Vollständige GuV und Cashflow-Übersicht je Handlungsmodell</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={selectedHm}
            onChange={e => setSelectedHm(e.target.value)}
            style={{ border: '1px solid #d2d2d7', borderRadius: 8, padding: '8px 14px', fontSize: 14, background: '#fff' }}
          >
            {HM_KEYS.map(hm => <option key={hm} value={hm}>{hm.toUpperCase()}</option>)}
          </select>
          <button
            onClick={() => exportCSV(years, selectedHm)}
            style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
          >
            CSV Export
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #e8e8ed' }}>
                {['Jahr', 'Produktion MWh', 'Erlöse €', 'OPEX €', 'AfA €', 'EBIT €', 'Zinsen €', 'EBT €', 'GewSt €', 'EAT €', 'CF Steuern €', 'Tilgung €', 'CF Tilgung €', 'Restschuld €'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#86868b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((y, i) => (
                <tr key={y.year} style={{ borderBottom: '1px solid #f5f5f7', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{y.year}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.production / 1000)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.erloes)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#cc0000' }}>{fmt(y.opex)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.afa)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{fmt(y.ebit)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.zinsen)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.ebt)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.gewst)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.eat)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(y.cf_steuern)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.tilgung)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: y.cf_tilgung >= 0 ? '#00875a' : '#cc0000' }}>{fmt(y.cf_tilgung)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(y.restschuld_ende)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
