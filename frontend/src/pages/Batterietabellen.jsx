import React, { useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useApp } from '../App.jsx'
import ChartWrapper from '../components/ChartWrapper.jsx'

const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']
const HM_COLORS = {
  hm1: '#0071e3', hm2: '#34aadc', hm3: '#30d158',
  hm4: '#ff9f0a', hm5: '#ff453a', hm6: '#bf5af2'
}

export default function Batterietabellen() {
  const { results } = useApp()
  const [selectedHm, setSelectedHm] = useState('hm1')

  if (!results) return <div style={{ color: '#86868b' }}>Lade…</div>

  // All HMs yearly avg capacity
  const compareData = Array.from({ length: 30 }, (_, yi) => {
    const row = { year: yi + 1 }
    for (const hm of HM_KEYS) {
      const caps = results[hm]?.battery?.monthly_caps?.[yi] || []
      row[hm] = caps.length > 0 ? caps.reduce((a, b) => a + b, 0) / caps.length : 0
    }
    return row
  })

  const batData = results[selectedHm]?.battery || {}
  const ersatzJahr = batData.ersatz_jahr
  const monthlyCaps = batData.monthly_caps || []

  // Monthly data flat for selected HM
  const monthlyFlat = []
  monthlyCaps.forEach((yearCaps, yi) => {
    yearCaps.forEach((cap, m) => {
      monthlyFlat.push({ idx: yi * 12 + m + 1, cap, year: yi + 1, month: m + 1 })
    })
  })

  function exportCSV() {
    const headers = ['Jahr', 'Monat', 'Kapazität kWh']
    const rows = monthlyFlat.map(r => [r.year, r.month, Math.round(r.cap)])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `batterie_${selectedHm}.csv`; a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Batterietabellen</h1>
          <p style={{ color: '#86868b', fontSize: 15 }}>Degradation der Batteriekapazität über 30 Jahre</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={selectedHm}
            onChange={e => setSelectedHm(e.target.value)}
            style={{ border: '1px solid #d2d2d7', borderRadius: 8, padding: '8px 14px', fontSize: 14, background: '#fff' }}
          >
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

      {ersatzJahr && (
        <div style={{ background: '#fff0e6', border: '1px solid #ffd0a0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
          ⚡ Batterieersatzinvestition in <strong>Jahr {ersatzJahr}</strong> · Kosten: 2.926.080 €
        </div>
      )}

      <ChartWrapper title="Kapazitätsvergleich alle HMs (kWh Ø)" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={compareData} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <YAxis tickFormatter={v => `${Math.round(v)}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip formatter={(v, n) => [`${Math.round(v).toLocaleString('de-DE')} kWh`, n.toUpperCase()]} labelFormatter={l => `Jahr ${l}`} />
            <Legend formatter={k => k.toUpperCase()} />
            {HM_KEYS.map(hm => (
              <Line key={hm} type="monotone" dataKey={hm} stroke={HM_COLORS[hm]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title={`Monatliche Kapazität ${selectedHm.toUpperCase()} (kWh)`} style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyFlat} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="idx" tickFormatter={v => `M${v}`} tick={{ fontSize: 10, fill: '#86868b' }} interval={35} />
            <YAxis tickFormatter={v => `${Math.round(v)}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip formatter={v => [`${Math.round(v).toLocaleString('de-DE')} kWh`]} labelFormatter={l => `Monat ${l}`} />
            <Area type="monotone" dataKey="cap" stroke={HM_COLORS[selectedHm]} fill={`${HM_COLORS[selectedHm]}20`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #e8e8ed' }}>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#86868b' }}>Jahr</th>
                {['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez','Ø kWh'].map(h => (
                  <th key={h} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#86868b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyCaps.map((caps, yi) => {
                const avg = caps.reduce((a, b) => a + b, 0) / caps.length
                return (
                  <tr key={yi} style={{ borderBottom: '1px solid #f5f5f7', background: yi % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700 }}>{yi + 1}</td>
                    {caps.map((c, m) => (
                      <td key={m} style={{ padding: '6px 10px', textAlign: 'right' }}>{Math.round(c).toLocaleString('de-DE')}</td>
                    ))}
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{Math.round(avg).toLocaleString('de-DE')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
