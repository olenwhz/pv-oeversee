import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useApp } from '../App.jsx'
import ChartWrapper from '../components/ChartWrapper.jsx'

export default function Strompreise() {
  const { results } = useApp()

  if (!results) return <div style={{ color: '#86868b' }}>Lade…</div>

  const hm1 = results.hm1
  const monthlyPrices = hm1?.monthly_prices || []

  // Aggregate to yearly average + upper/lower band (simplified from hm1 data)
  const yearlyData = monthlyPrices.map((months, yi) => ({
    year: yi + 1,
    avg: months.reduce((a, b) => a + b, 0) / 12 * 100,
    min: Math.min(...months) * 100,
    max: Math.max(...months) * 100,
  }))

  // Monthly detail first 5 years
  const monthlyDetail = []
  const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
  for (let y = 0; y < 5; y++) {
    const months = monthlyPrices[y] || []
    months.forEach((p, m) => {
      monthlyDetail.push({
        label: `J${y+1} ${MONTH_NAMES[m]}`,
        price: p * 100,
      })
    })
  }

  function exportCSV() {
    const headers = ['Jahr', 'Avg ct/kWh', 'Min ct/kWh', 'Max ct/kWh']
    const rows = yearlyData.map(r => [r.year, r.avg.toFixed(4), r.min.toFixed(4), r.max.toFixed(4)])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'strompreise.csv'; a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Strompreise</h1>
          <p style={{ color: '#86868b', fontSize: 15 }}>Modellierte Spotpreise über 30 Jahre (inkl. Inflation + Saisonalität)</p>
        </div>
        <button
          onClick={exportCSV}
          style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
        >
          CSV Export
        </button>
      </div>

      <ChartWrapper title="Jährliche Ø Spotpreise + Bandbreite (ct/kWh)" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yearlyData} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <YAxis tickFormatter={v => `${v.toFixed(1)}ct`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip formatter={v => [`${v.toFixed(3)} ct/kWh`]} labelFormatter={l => `Jahr ${l}`} />
            <Legend />
            <Line type="monotone" dataKey="max" name="Max (Upper)" stroke="#0071e3" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <Line type="monotone" dataKey="avg" name="Ø Spot" stroke="#1d1d1f" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="min" name="Min (Lower)" stroke="#ff9f0a" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title="Monatliche Saisonalität Jahre 1–5 (ct/kWh)" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyDetail} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#86868b' }} interval={5} />
            <YAxis tickFormatter={v => `${v.toFixed(2)}ct`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip formatter={v => [`${v.toFixed(4)} ct/kWh`]} />
            <Line type="monotone" dataKey="price" name="Spot" stroke="#0071e3" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #e8e8ed' }}>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#86868b' }}>Jahr</th>
                {['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez','Ø ct/kWh'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#86868b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyPrices.map((months, yi) => (
                <tr key={yi} style={{ borderBottom: '1px solid #f5f5f7', background: yi % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '7px 16px', textAlign: 'right', fontWeight: 700 }}>{yi + 1}</td>
                  {months.map((p, m) => (
                    <td key={m} style={{ padding: '7px 12px', textAlign: 'right' }}>{(p * 100).toFixed(3)}</td>
                  ))}
                  <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 600 }}>
                    {(months.reduce((a, b) => a + b, 0) / 12 * 100).toFixed(3)}
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
