import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import { optimizeReset, optimizeZyklen, optimizeFixverguetung } from '../api/client.js'

function OptCard({ icon, title, desc, detail, action, loading, done, error, onAction }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, border: '1px solid #e8e8ed',
      padding: '32px', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#515154', lineHeight: 1.5 }}>{desc}</div>
        <div style={{ fontSize: 12, color: '#86868b', marginTop: 8 }}>{detail}</div>
      </div>
      {done && (
        <div style={{ background: '#f0fff8', border: '1px solid #b8f5dc', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#00875a' }}>
          ✓ Abgeschlossen
        </div>
      )}
      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffc0c0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#cc0000' }}>
          Fehler aufgetreten
        </div>
      )}
      {loading && (
        <div style={{ background: '#f0f7ff', border: '1px solid #b3d7ff', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#0071e3' }}>
          ⟳ Läuft…
        </div>
      )}
      <button
        onClick={onAction}
        disabled={loading}
        style={{
          background: loading ? '#e8e8ed' : '#0071e3',
          color: loading ? '#86868b' : '#fff',
          border: 'none', borderRadius: 10,
          padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: 'auto',
        }}
      >
        {loading ? 'Läuft…' : action}
      </button>
    </div>
  )
}

export default function Optimierungen() {
  const { params, setParams, forceCalculate } = useApp()
  const [states, setStates] = useState({ reset: {}, zyklen: {}, fix: {} })

  function setState(key, s) {
    setStates(prev => ({ ...prev, [key]: { ...prev[key], ...s } }))
  }

  async function handleReset() {
    setState('reset', { loading: true, done: false, error: false })
    try {
      const defaults = await optimizeReset()
      setParams(defaults)
      setState('reset', { loading: false, done: true })
    } catch {
      setState('reset', { loading: false, error: true })
    }
  }

  async function handleZyklen() {
    if (!params) return
    setState('zyklen', { loading: true, done: false, error: false })
    try {
      const optimized = await optimizeZyklen(params)
      setParams(optimized)
      setState('zyklen', { loading: false, done: true })
    } catch {
      setState('zyklen', { loading: false, error: true })
    }
  }

  async function handleFix() {
    if (!params) return
    setState('fix', { loading: true, done: false, error: false })
    try {
      const optimized = await optimizeFixverguetung(params)
      setParams(optimized)
      setState('fix', { loading: false, done: true })
    } catch {
      setState('fix', { loading: false, error: true })
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Optimierungen</h1>
      <p style={{ color: '#86868b', fontSize: 15, marginBottom: 40 }}>Makro-basierte Parameter-Optimierungen</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <OptCard
          icon="🔄"
          title="Reset"
          desc="Setzt alle Parameter auf die Excel-Standardwerte zurück."
          detail="Entspricht VBA Reset_Alle_Eingabewerte"
          action="Reset"
          loading={states.reset.loading}
          done={states.reset.done}
          error={states.reset.error}
          onAction={handleReset}
        />
        <OptCard
          icon="⚡"
          title="Zyklen-Optimierung"
          desc="Optimiert Zyklen/Tag für HM5 und HM6 unabhängig voneinander, um den NPV (30J) zu maximieren."
          detail="Bereich: 0 – 4,5 Zyklen/Tag · Schrittweite: 0,01 · Constraint: DSCR ≥ Min"
          action="Optimieren ▶"
          loading={states.zyklen.loading}
          done={states.zyklen.done}
          error={states.zyklen.error}
          onAction={handleZyklen}
        />
        <OptCard
          icon="💰"
          title="Vergütungs-Optimierung"
          desc="Maximiert Fixvergütungen unter DSCR-Constraint mit 8-stelliger Präzision."
          detail="Für HM1 (dv_bonus_11_20), HM3 (fix_pv_11_20), HM6 (fix_pv_11_20) · Sukzessivapproximation"
          action="Optimieren ▶"
          loading={states.fix.loading}
          done={states.fix.done}
          error={states.fix.error}
          onAction={handleFix}
        />
      </div>

      {(states.zyklen.done || states.fix.done) && params && (
        <div style={{ marginTop: 32, background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', padding: '24px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Aktuelle optimierte Werte</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 13 }}>
            <div>
              <div style={{ color: '#86868b', marginBottom: 4 }}>HM1 – DV-Bonus 11–20</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{(params.hm1.dv_bonus_11_20 * 100).toFixed(6)}%</div>
            </div>
            <div>
              <div style={{ color: '#86868b', marginBottom: 4 }}>HM3 – Fixvergütung PV 11–20</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{(params.hm3.fix_verguetung_pv_11_20 * 100).toFixed(6)}%</div>
            </div>
            <div>
              <div style={{ color: '#86868b', marginBottom: 4 }}>HM5 – Zyklen 11–20</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{params.hm5.zyklen_11_20} /Tag</div>
            </div>
            <div>
              <div style={{ color: '#86868b', marginBottom: 4 }}>HM6 – Zyklen 11–20</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{params.hm6.zyklen_11_20} /Tag</div>
            </div>
            <div>
              <div style={{ color: '#86868b', marginBottom: 4 }}>HM6 – Fixvergütung PV 11–20</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{(params.hm6.fix_verguetung_pv_11_20 * 100).toFixed(6)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
