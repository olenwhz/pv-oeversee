import React from 'react'

const HM_LABELS = { hm1: 'HM1', hm2: 'HM2', hm3: 'HM3', hm4: 'HM4', hm5: 'HM5', hm6: 'HM6' }
const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']

function fmt(val, type) {
  if (val === null || val === undefined) return '—'
  if (type === 'eur') return (val / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' T€'
  if (type === 'pct') return (val * 100).toFixed(2) + '%'
  if (type === 'x') return val.toFixed(3) + '×'
  if (type === 'yr') return 'Jahr ' + val
  if (type === 'bool') return val ? '✓' : '✗'
  return val
}

export default function HMCompareTable({ results }) {
  if (!results) return null

  const rows = [
    { label: 'NPV 0–20 Jahre', key: 'npv_20', type: 'eur' },
    { label: 'NPV 0–30 Jahre', key: 'npv_30', type: 'eur' },
    { label: 'IRR (30J)', key: 'irr', type: 'pct' },
    { label: 'Dyn. Amort. 20J', key: 'amort_dyn_20', type: 'yr' },
    { label: 'Dyn. Amort. 30J', key: 'amort_dyn_30', type: 'yr' },
    { label: 'Stat. Amortisation', key: 'amort_stat_20', type: 'yr' },
    { label: 'Eff. Überschuss 20J', key: 'eff_20', type: 'eur' },
    { label: 'Eff. Überschuss 30J', key: 'eff_30', type: 'eur' },
    { label: 'DSCR Minimum', key: 'dscr_min', type: 'x' },
    { label: 'DSCR erfüllt', key: 'dscr_ok', type: 'bool' },
    { label: 'LLCR', key: 'llcr', type: 'x' },
    { label: 'ROI 20J', key: 'roi_20', type: 'pct' },
    { label: 'ROI 30J', key: 'roi_30', type: 'pct' },
    { label: 'WACC', key: 'wacc', type: 'pct' },
    { label: 'GK-Rendite Ø', key: 'gk_rent_avg', type: 'pct' },
    { label: 'EK-Rendite Ø', key: 'ek_rent_avg', type: 'pct' },
    { label: 'LCOE', key: 'lcoe', type: 'pct' },
  ]

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e8e8ed' }}>
            <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#86868b', width: 200 }}>KPI</th>
            {HM_KEYS.map(hm => (
              <th key={hm} style={{ textAlign: 'right', padding: '10px 16px', fontWeight: 600, color: '#1d1d1f' }}>
                {HM_LABELS[hm]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const vals = HM_KEYS.map(hm => results[hm]?.kpis?.[row.key])

            let bestIdx = -1
            if (row.type === 'eur' || row.type === 'pct' || row.type === 'x') {
              const numVals = vals.map(v => (v !== null && v !== undefined ? v : -Infinity))
              bestIdx = numVals.indexOf(Math.max(...numVals))
            } else if (row.type === 'yr') {
              const numVals = vals.map(v => (v !== null && v !== undefined ? v : Infinity))
              const minVal = Math.min(...numVals)
              if (minVal !== Infinity) bestIdx = numVals.indexOf(minVal)
            }

            return (
              <tr key={row.key} style={{ borderBottom: '1px solid #f0f0f5', background: ri % 2 === 0 ? '#fafafa' : '#fff' }}>
                <td style={{ padding: '9px 16px', color: '#86868b', fontWeight: 500 }}>{row.label}</td>
                {HM_KEYS.map((hm, hi) => {
                  const val = vals[hi]
                  const isBest = hi === bestIdx && val !== null && val !== undefined
                  const isDscrOk = row.key === 'dscr_ok' && val === true
                  const isDscrFail = row.key === 'dscr_ok' && val === false
                  return (
                    <td key={hm} style={{
                      padding: '9px 16px',
                      textAlign: 'right',
                      fontWeight: isBest ? 600 : 400,
                      color: isBest ? '#0071e3' : isDscrFail ? '#cc0000' : '#1d1d1f',
                    }}>
                      {isDscrOk ? <span style={{ color: '#00a96e' }}>●&nbsp;✓</span>
                        : isDscrFail ? <span style={{ color: '#cc0000' }}>●&nbsp;✗</span>
                        : fmt(val, row.type)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
