import React from 'react'
import { useParams } from 'react-router-dom'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ReferenceDot, ResponsiveContainer
} from 'recharts'
import { useApp } from '../App.jsx'
import ChartWrapper from '../components/ChartWrapper.jsx'

const HM_COLORS = {
  hm1: '#0071e3', hm2: '#34aadc', hm3: '#30d158',
  hm4: '#ff9f0a', hm5: '#ff453a', hm6: '#bf5af2'
}
const HM_LABELS = { hm1: 'HM1', hm2: 'HM2', hm3: 'HM3', hm4: 'HM4', hm5: 'HM5', hm6: 'HM6' }
const HM_DESCS = {
  hm1: 'EEG anzulegender Wert + DV-Bonus (J11–20)',
  hm2: 'Nur EEG anzulegender Wert (kein Bonus J11–20)',
  hm3: 'Batterie Profit-Share + PV Fixvergütung (J11–20)',
  hm4: 'Vollständiger Profit-Share + EEG-Komponente (hohe Zyklen)',
  hm5: 'Profit-Share + EEG + einmalige Batterieersatzinvestition',
  hm6: 'Batterie Profit-Share + hohe PV-Fixvergütung (J11–20)',
}

function fmt(v) { return v !== null && v !== undefined ? Math.round(v).toLocaleString('de-DE') : '—' }
function fmtPct(v) { return v !== null && v !== undefined ? (v * 100).toFixed(2) + '%' : '—' }
function fmtX(v) { return v !== null && v !== undefined ? v.toFixed(3) + '×' : '—' }

export default function HMDetail() {
  const { id } = useParams()
  const { results } = useApp()
  const hm = id

  if (!results?.[hm]) return <div style={{ color: '#86868b', paddingTop: 40 }}>Lade…</div>

  const data = results[hm]
  const kpis = data.kpis
  const years = data.years
  const color = HM_COLORS[hm]

  // Chart: Erlöse / OPEX / Cashflow
  const financialData = years.map(y => ({
    year: y.year,
    erloes: y.erloes / 1000,
    opex: y.opex / 1000,
    cf: y.cf_tilgung / 1000,
    ebit: y.ebit / 1000,
  }))

  // Chart: NPV-Verlauf
  const npvData = (kpis.npv_series || []).map((v, i) => ({ year: i, npv: v / 1000 }))
  const amortYear = kpis.amort_dyn_30

  // Chart: Batterie-Kapazität (jährlich gemittelt)
  const batCaps = data.battery?.monthly_caps || []
  const batData = batCaps.map((monthCaps, yi) => ({
    year: yi + 1,
    cap: monthCaps.reduce((a, b) => a + b, 0) / 12,
  }))

  // Chart: Strompreise monatlich (Jahr 1–3)
  const pricesRaw = data.monthly_prices || []
  const priceData = []
  for (let y = 0; y < 3; y++) {
    const months = pricesRaw[y] || []
    months.forEach((p, m) => {
      priceData.push({ label: `J${y+1}M${m+1}`, price: p * 100 })
    })
  }

  const pills = [
    { l: 'NPV 30J', v: fmt(kpis.npv_30) + ' €' },
    { l: 'IRR', v: fmtPct(kpis.irr) },
    { l: 'DSCR', v: kpis.dscr_ok ? '✓ erfüllt' : '✗ nicht erfüllt', ok: kpis.dscr_ok },
    { l: 'Amort.', v: kpis.amort_dyn_30 ? `Jahr ${kpis.amort_dyn_30}` : 'n/a' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        borderRadius: 20, padding: '32px 36px', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Handlungsmodell
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: '#1d1d1f', marginBottom: 8 }}>
              {HM_LABELS[hm]}
            </h1>
            <p style={{ fontSize: 15, color: '#515154' }}>{HM_DESCS[hm]}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {pills.map(p => (
              <div key={p.l} style={{
                background: p.ok === false ? '#fff0f0' : p.ok === true ? '#f0fff8' : '#fff',
                border: `1px solid ${p.ok === false ? '#ffcccc' : p.ok === true ? '#b8f5dc' : '#e8e8ed'}`,
                borderRadius: 100, padding: '8px 16px', fontSize: 13,
              }}>
                <span style={{ color: '#86868b', marginRight: 6 }}>{p.l}</span>
                <span style={{ fontWeight: 600, color: p.ok === false ? '#cc0000' : p.ok === true ? '#00875a' : '#1d1d1f' }}>{p.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Charts 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <ChartWrapper title="Erlöse / OPEX / Cashflow (T€)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={financialData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tickFormatter={v => `${v}T`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip formatter={(v, n) => [`${v.toFixed(0)} T€`, n]} labelFormatter={l => `Jahr ${l}`} />
              <Legend />
              <Line type="monotone" dataKey="erloes" name="Erlöse" stroke={color} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="opex" name="OPEX" stroke="#ff453a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cf" name="CF Tilgung" stroke="#30d158" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Kumulativer NPV-Verlauf (T€)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={npvData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tickFormatter={v => `${Math.round(v)}T`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip formatter={v => [`${Math.round(v).toLocaleString('de-DE')} T€`]} labelFormatter={l => `Jahr ${l}`} />
              <ReferenceLine y={0} stroke="#1d1d1f" strokeDasharray="4 4" />
              {amortYear && (
                <ReferenceDot x={amortYear} y={0} r={5} fill={color} stroke="none" label={{ value: `J${amortYear}`, position: 'top', fontSize: 11 }} />
              )}
              <Line type="monotone" dataKey="npv" name="NPV" stroke={color} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Batterie-Kapazität (kWh Ø)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={batData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <YAxis tickFormatter={v => `${Math.round(v)}`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip formatter={v => [`${Math.round(v).toLocaleString('de-DE')} kWh`]} labelFormatter={l => `Jahr ${l}`} />
              <Area type="monotone" dataKey="cap" name="Kapazität" stroke={color} fill={`${color}20`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Strompreise Monate 1–36 (ct/kWh)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={priceData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="label" tick={false} />
              <YAxis tickFormatter={v => `${v.toFixed(1)}ct`} tick={{ fontSize: 11, fill: '#86868b' }} />
              <Tooltip formatter={v => [`${v.toFixed(3)} ct/kWh`]} />
              <Line type="monotone" dataKey="price" name="Spot" stroke="#ff9f0a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Detail Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8ed' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Jahresdetails — 30 Jahre</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e8e8ed' }}>
                {['J', 'Prod. MWh', 'Erlöse', 'OPEX', 'AfA', 'EBIT', 'Zinsen', 'EBT', 'GewSt', 'EAT', 'CF Steuern', 'Tilgung', 'CF Tilgung', 'DSCR'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#86868b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((y, i) => {
                const dscr = kpis.dscr_values?.[i]
                return (
                  <tr key={y.year} style={{ borderBottom: '1px solid #f5f5f7', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: color }}>{y.year}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.production / 1000)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.erloes)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#cc0000' }}>{fmt(y.opex)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.afa)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.ebit)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.zinsen)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.ebt)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.gewst)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.eat)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 500 }}>{fmt(y.cf_steuern)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(y.tilgung)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: y.cf_tilgung >= 0 ? '#00875a' : '#cc0000' }}>{fmt(y.cf_tilgung)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: dscr === null ? '#86868b' : dscr >= 1.08 ? '#00875a' : '#cc0000' }}>
                      {dscr !== null && dscr !== undefined ? dscr.toFixed(3) : '—'}
                    </td>
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
