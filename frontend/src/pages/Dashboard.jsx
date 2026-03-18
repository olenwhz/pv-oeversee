import React from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { useApp } from '../App.jsx'
import KPICard from '../components/KPICard.jsx'
import HMCompareTable from '../components/HMCompareTable.jsx'
import ChartWrapper from '../components/ChartWrapper.jsx'

const HM_COLORS = {
  hm1: '#0071e3', hm2: '#34aadc', hm3: '#30d158',
  hm4: '#ff9f0a', hm5: '#ff453a', hm6: '#bf5af2'
}
const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']
const HM_LABELS = { hm1: 'HM1', hm2: 'HM2', hm3: 'HM3', hm4: 'HM4', hm5: 'HM5', hm6: 'HM6' }

function fmtEur(v) {
  if (v === null || v === undefined) return '—'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}
function fmtPct(v) {
  if (v === null || v === undefined) return '—'
  return (v * 100).toFixed(2) + '%'
}

function SkeletonBlock({ h = 120 }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #f0f0f5 25%, #e8e8ed 50%, #f0f0f5 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 12,
      height: h,
    }} />
  )
}

export default function Dashboard() {
  const { results, loading } = useApp()

  if (loading && !results) {
    return (
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: '#86868b', marginBottom: 40 }}>Berechne…</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          <SkeletonBlock h={140} /><SkeletonBlock h={140} /><SkeletonBlock h={140} />
        </div>
        <SkeletonBlock h={300} />
      </div>
    )
  }

  if (!results) return (
    <div style={{ color: '#86868b', paddingTop: 80, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>☀</div>
      <div style={{ fontSize: 18 }}>Lade Berechnungen…</div>
    </div>
  )

  // Hero KPIs
  let bestNpv30 = { val: -Infinity, hm: '' }
  let bestIrr = { val: -Infinity, hm: '' }
  for (const hm of HM_KEYS) {
    const k = results[hm]?.kpis
    if (!k) continue
    if ((k.npv_30 ?? -Infinity) > bestNpv30.val) { bestNpv30 = { val: k.npv_30, hm } }
    if ((k.irr ?? -Infinity) > bestIrr.val) { bestIrr = { val: k.irr, hm } }
  }

  // NPV chart data
  const npvData = Array.from({ length: 31 }, (_, i) => {
    const row = { year: i }
    for (const hm of HM_KEYS) {
      const series = results[hm]?.kpis?.npv_series
      if (series) row[hm] = series[i] / 1000
    }
    return row
  })

  // Cashflow chart (years 1-20)
  const cfData = Array.from({ length: 20 }, (_, i) => {
    const row = { year: i + 1 }
    for (const hm of HM_KEYS) {
      const y = results[hm]?.years?.[i]
      if (y) row[hm] = (y.cf_tilgung ?? 0) / 1000
    }
    return row
  })

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: '#86868b', marginBottom: 40, fontSize: 15 }}>PV-Park 10,7 MWp — 30-Jahres-Analyse</p>

      {loading && (
        <div style={{ background: '#fff9e6', border: '1px solid #ffe066', borderRadius: 8, padding: '8px 16px', marginBottom: 20, fontSize: 13, color: '#856404' }}>
          Berechnung läuft…
        </div>
      )}

      {/* Hero KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        <KPICard
          label="Bester NPV (30J)"
          value={fmtEur(bestNpv30.val)}
          sub={`${HM_LABELS[bestNpv30.hm]} · Diskontierungszins 8%`}
          accent="#0071e3"
          small
        />
        <KPICard
          label="Beste IRR (30J)"
          value={fmtPct(bestIrr.val)}
          sub={`${HM_LABELS[bestIrr.hm]} · Interner Zinsfuß`}
          accent="#30d158"
          small
        />
        <KPICard
          label="Gesamtinvestition (CAPEX)"
          value="8.996.274 €"
          sub="EK: 1.396.274 € · FK: 7.600.000 €"
          small
        />
      </div>

      {/* Comparison table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', marginBottom: 40, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8ed' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Handlungsmodell-Vergleich</div>
          <div style={{ fontSize: 13, color: '#86868b', marginTop: 2 }}>Alle 6 HMs auf einen Blick — beste Werte in Blau</div>
        </div>
        <HMCompareTable results={results} />
      </div>

      {/* NPV Chart */}
      <ChartWrapper title="NPV-Verlauf über 30 Jahre (T€)" style={{ marginBottom: 32 }}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={npvData} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <YAxis tickFormatter={v => `${v}T`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip
              formatter={(v, name) => [`${Math.round(v).toLocaleString('de-DE')} T€`, HM_LABELS[name]]}
              labelFormatter={l => `Jahr ${l}`}
            />
            <Legend formatter={k => HM_LABELS[k]} />
            <ReferenceLine y={0} stroke="#1d1d1f" strokeDasharray="4 4" strokeWidth={1.5} />
            {HM_KEYS.map(hm => (
              <Line key={hm} type="monotone" dataKey={hm} stroke={HM_COLORS[hm]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Cashflow Chart */}
      <ChartWrapper title="Jährlicher Cashflow nach Tilgung — Jahre 1–20 (T€)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={cfData} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="year" tickFormatter={v => `J${v}`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <YAxis tickFormatter={v => `${v}T`} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip
              formatter={(v, name) => [`${Math.round(v).toLocaleString('de-DE')} T€`, HM_LABELS[name]]}
              labelFormatter={l => `Jahr ${l}`}
            />
            <Legend formatter={k => HM_LABELS[k]} />
            <ReferenceLine y={0} stroke="#1d1d1f" strokeWidth={1} />
            {HM_KEYS.map(hm => (
              <Bar key={hm} dataKey={hm} fill={HM_COLORS[hm]} opacity={0.85} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  )
}
