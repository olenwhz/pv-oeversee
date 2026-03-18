import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useApp } from '../App.jsx'
import ChartWrapper from '../components/ChartWrapper.jsx'

const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']
const HM_COLORS = {
  hm1: '#0071e3', hm2: '#34aadc', hm3: '#30d158',
  hm4: '#ff9f0a', hm5: '#ff453a', hm6: '#bf5af2'
}

export default function Ertraege() {
  const { results } = useApp()
  const [selectedHm, setSelectedHm] = useState('hm1')

  if (!results) return <div style={{ color: '#86868b' }}>Lade…</div>

  // Annual revenues comparison
  const revData = Array.from({ length: 30 }, (_, i) => {
    const row = { year: i + 1 }
    for (const hm of HM_KEYS) {
      row[hm] = (results[hm]?.years?.[i]?.erloes ?? 0) / 1000
    }
    return row
  })

  // Production for selected HM
  const prodData = (results[selectedHm]?.years || []).map(y => ({
    year: y.year,
    prod: (y.production ?? 0) / 1000,
    erloes: (y.erloes ?? 0) / 1000,
  }))

  function exportCSV() {
    const headers = ['Jahr', ...HM_KEYS.map(h => h.toUpperCase() + ' Erlös €')]
    const rows = revData.map(r => [r.year, ...HM_KEYS.map(h => Math.round((r[h] || 0) * 1000))])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'ertraege.csv'; a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Erträge</h1>
          <p style={{ color: '#86868b', fontSize: 15 }}>Jährliche Erlöse aller Handlungsmodelle über 30 Jahre</p>
        </div>
        <button
          onClick={exportCSV}
          style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
        >
          CSV Export
        </button>
      </div>

      <ChartWrapper title="Jährliche Erlöse alle HMs (T€)" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revData} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <YAxis tickFormatter={v => `${v}T`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip formatter={(v, n) => [`${v.toFixed(0)} T€`, n.toUpperCase()]} labelFormatter={l => `Jahr ${l}`} />
            <Legend formatter={k => k.toUpperCase()} />
            {HM_KEYS.map(hm => (
              <Bar key={hm} dataKey={hm} fill={HM_COLORS[hm]} opacity={0.85} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <label style={{ fontSize: 14, color: '#86868b' }}>Detailansicht:</label>
        <select
          value={selectedHm}
          onChange={e => setSelectedHm(e.target.value)}
          style={{ border: '1px solid #d2d2d7', borderRadius: 8, padding: '6px 12px', fontSize: 14, background: '#fff' }}
        >
          {HM_KEYS.map(hm => <option key={hm} value={hm}>{hm.toUpperCase()}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #e8e8ed' }}>
                {['Jahr', 'Produktion MWh', 'Erlöse €', '€/MWh'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#86868b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prodData.map((y, i) => (
                <tr key={y.year} style={{ borderBottom: '1px solid #f5f5f7', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 700 }}>{y.year}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{Math.round(y.prod).toLocaleString('de-DE')}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{Math.round(y.erloes * 1000).toLocaleString('de-DE')}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    {y.prod > 0 ? ((y.erloes * 1000) / (y.prod * 1000) * 1000).toFixed(2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
