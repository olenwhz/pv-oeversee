import React from 'react'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const SEASONAL_MULT = [
  1.024365392, 1.043321655, 0.968716752, 0.884811018,
  0.901377490, 0.966276564, 0.987173774, 1.001946733,
  1.065012471, 1.103649816, 1.053354121, 0.999994214
]

const MONTH_LABELS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export default function SeasonalityChart({ params }) {
  const base = params.achsenabschnitt
  const inflation = params.preisinflation
  const upperSpread = params.upper_spread
  const lowerSpread = params.lower_spread
  const linear = (params.preiswachstum_modus || 'exponentiell') === 'linear'

  const data = MONTH_LABELS.map((label, m) => {
    const t = m  // year 1 months 0-11
    const growth = linear
      ? 1 + inflation * t / 12
      : (1 + inflation / 12) ** t
    const spot = base * growth * SEASONAL_MULT[m]
    return {
      label,
      mult: parseFloat((SEASONAL_MULT[m]).toFixed(4)),
      spot: parseFloat((spot * 100).toFixed(3)),
      upper: parseFloat((spot * (1 + upperSpread) * 100).toFixed(3)),
      lower: parseFloat((spot * (1 - lowerSpread) * 100).toFixed(3)),
    }
  })

  return (
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Saisonalitätskurve — Jahr 1 (ct/kWh)
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0071e3" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0071e3" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#86868b' }} />
          <YAxis tickFormatter={v => `${v.toFixed(1)}ct`} tick={{ fontSize: 11, fill: '#86868b' }} />
          <Tooltip formatter={(v, n) => [`${v.toFixed(3)} ct/kWh`, n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="upper" name="Oberes Band" stroke="#34aadc" fill="url(#bandGrad)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          <Area type="monotone" dataKey="lower" name="Unteres Band" stroke="#ff9f0a" fill="transparent" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          <Line type="monotone" dataKey="spot" name="Spot Jahr 1" stroke="#0071e3" strokeWidth={2.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Saisonale Multiplikatoren
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#86868b' }} />
            <YAxis domain={[0.85, 1.15]} tickFormatter={v => v.toFixed(2)} tick={{ fontSize: 11, fill: '#86868b' }} />
            <Tooltip formatter={v => [v.toFixed(4), 'Multiplikator']} />
            <Area type="monotone" dataKey="mult" name="Saisonal-Mult." stroke="#30d158" fill="#30d15820" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
