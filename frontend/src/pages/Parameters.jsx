import React, { useState } from 'react'
import { useApp } from '../App.jsx'
import SeasonalityChart from '../components/SeasonalityChart.jsx'

function Section({ title, open, onToggle, children, fullWidth }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed',
      marginBottom: 16, overflow: 'hidden',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 600, color: '#1d1d1f',
        }}
      >
        {title}
        <span style={{ fontSize: 18, color: '#86868b', fontWeight: 300 }}>{open ? '−' : '+'}</span>
      </button>
      {open && <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f0f0f5' }}>{children}</div>}
    </div>
  )
}

function ParamRow({ label, hint, value, onChange, step = 0.001, min, max }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f7' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>{hint}</div>}
      </div>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          border: '1px solid #d2d2d7', borderRadius: 8, padding: '8px 12px',
          fontSize: 14, color: '#1d1d1f', textAlign: 'right',
          outline: 'none', width: '100%',
        }}
      />
    </div>
  )
}

function InfoRow({ label, info, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f7' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{label}</div>
        {info && <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>{info}</div>}
      </div>
      <div style={{ fontSize: 13, color: '#86868b', textAlign: 'right', padding: '8px 12px', background: '#f5f5f7', borderRadius: 8 }}>{value}</div>
    </div>
  )
}

function SubLabel({ text }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 8px' }}>
      {text}
    </div>
  )
}

export default function Parameters() {
  const { params, setParams, forceCalculate } = useApp()
  const [open, setOpen] = useState({
    general: true, ps: false,
    hm1: false, hm2: false, hm3: false, hm4: false, hm5: false, hm6: false,
    hme: false,
    seasonality: false,
  })

  if (!params) return <div style={{ color: '#86868b' }}>Lade…</div>

  function upd(section, key, val) {
    setParams(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: val }
    }))
  }

  const toggle = key => setOpen(s => ({ ...s, [key]: !s[key] }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Parameter</h1>
          <p style={{ color: '#86868b', fontSize: 15 }}>Änderungen werden automatisch nach 500ms berechnet</p>
        </div>
        <button
          onClick={forceCalculate}
          style={{
            background: '#0071e3', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Berechnen ▶
        </button>
      </div>

      {/* Full-width top sections */}
      <Section title="Allgemeine Parameter" open={open.general} onToggle={() => toggle('general')} fullWidth>
        <div style={{ paddingTop: 16 }}>
          <SubLabel text="Strompreis" />
          <ParamRow label="Achsenabschnitt (Basispreis)" hint="€/kWh" value={params.general.achsenabschnitt} onChange={v => upd('general','achsenabschnitt',v)} step={0.001} />
          <ParamRow label="Preisinflation p.a." hint="z.B. 0.02 = 2%" value={params.general.preisinflation} onChange={v => upd('general','preisinflation',v)} step={0.001} />
          <ParamRow label="Saisonalitätsamplitude" hint="0–1" value={params.general.s_amplitude} onChange={v => upd('general','s_amplitude',v)} step={0.01} min={0} max={1} />
          <ParamRow label="Upper Spread" hint="Aufschlag oberes Band" value={params.general.upper_spread} onChange={v => upd('general','upper_spread',v)} step={0.01} />
          <ParamRow label="Lower Spread" hint="Abschlag unteres Band" value={params.general.lower_spread} onChange={v => upd('general','lower_spread',v)} step={0.01} />

          <div style={{ marginTop: 8, marginBottom: 4 }}>
            <button
              onClick={() => toggle('seasonality')}
              style={{
                background: 'none', border: '1px solid #d2d2d7', borderRadius: 8,
                padding: '6px 14px', fontSize: 12, color: '#86868b', cursor: 'pointer',
              }}
            >
              {open.seasonality ? '▲ Saisonalität ausblenden' : '▼ Saisonalitätskurve anzeigen'}
            </button>
          </div>
          {open.seasonality && (
            <div style={{ marginBottom: 8 }}>
              <SeasonalityChart params={params.general} />
            </div>
          )}

          <SubLabel text="Wachstumsmodus Strompreis" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f7' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>Wachstumsmodell</div>
              <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>Exponentiell = Zinseszins, Linear = gleichmäßige Steigung</div>
            </div>
            <select
              value={params.general.preiswachstum_modus || 'exponentiell'}
              onChange={e => upd('general', 'preiswachstum_modus', e.target.value)}
              style={{
                border: '1px solid #d2d2d7', borderRadius: 8, padding: '8px 12px',
                fontSize: 14, color: '#1d1d1f', background: '#fff', width: '100%',
              }}
            >
              <option value="exponentiell">Exponentiell</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          <SubLabel text="Finanzierung" />
          <ParamRow label="Kalkulationszins" hint="Diskontierungszins für NPV" value={params.general.kalkulationszins} onChange={v => upd('general','kalkulationszins',v)} step={0.001} />
          <ParamRow label="EK-Zinssatz" hint="EK-Verzinsungsanspruch für WACC" value={params.general.ek_zins} onChange={v => upd('general','ek_zins',v)} step={0.001} />
          <ParamRow label="Zinssatz Jahre 1–10" hint="Darlehen" value={params.general.zinssatz_1_10} onChange={v => upd('general','zinssatz_1_10',v)} step={0.001} />
          <ParamRow label="Zinssatz Jahre 11–20" hint="Darlehen" value={params.general.zinssatz_11_20} onChange={v => upd('general','zinssatz_11_20',v)} step={0.001} />
          <ParamRow label="Kosten Zinscap" hint="€ einmalig Jahr 0" value={params.general.kosten_zinscap} onChange={v => upd('general','kosten_zinscap',v)} step={100} />
          <ParamRow label="OPEX-Inflation p.a." hint="2% = 0.02" value={params.general.opex_inflation} onChange={v => upd('general','opex_inflation',v)} step={0.001} />
          <ParamRow label="DSCR Minimum" hint="Mindest-DSCR" value={params.general.dscr_min} onChange={v => upd('general','dscr_min',v)} step={0.001} />

          <SubLabel text="Technisch" />
          <ParamRow label="Degradationsfaktor (monatlich)" hint="PV-Leistungsabnahme pro Monat" value={params.general.degradationsfaktor} onChange={v => upd('general','degradationsfaktor',v)} step={0.00001} />
          <ParamRow label="Profit Share" hint="Wattmanufaktur-Anteil 0–1" value={params.general.profit_share} onChange={v => upd('general','profit_share',v)} step={0.01} min={0} max={1} />
          <ParamRow label="Max. Zyklen/Tag" hint="4.5" value={params.general.max_zyklen} onChange={v => upd('general','max_zyklen',v)} step={0.01} />
        </div>
      </Section>

      <Section title="Profit-Share Verteilungen" open={open.ps} onToggle={() => toggle('ps')} fullWidth>
        <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
          <div>
            <SubLabel text="Batterie-Anteile" />
            <ParamRow label="Upper Bat" value={params.ps.upper_bat} onChange={v => upd('ps','upper_bat',v)} step={0.001} />
            <ParamRow label="Middle Bat" value={params.ps.middle_bat} onChange={v => upd('ps','middle_bat',v)} step={0.001} />
            <ParamRow label="Lower Bat" value={params.ps.lower_bat} onChange={v => upd('ps','lower_bat',v)} step={0.001} />
          </div>
          <div>
            <SubLabel text="PV-Anteile" />
            <ParamRow label="Upper PV" value={params.ps.upper_pv} onChange={v => upd('ps','upper_pv',v)} step={0.001} />
            <ParamRow label="Middle PV" value={params.ps.middle_pv} onChange={v => upd('ps','middle_pv',v)} step={0.001} />
            <ParamRow label="Lower PV" value={params.ps.lower_pv} onChange={v => upd('ps','lower_pv',v)} step={0.001} />
          </div>
        </div>
      </Section>

      {/* 2-column grid for HM sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        {[
          { key: 'hm1', label: 'HM1 – EEG + DV-Bonus', fields: [
            { k: 'dv_bonus_1_10', l: 'DV-Bonus Jahre 1–10', s: 0.001 },
            { k: 'dv_bonus_11_20', l: 'DV-Bonus Jahre 11–20', s: 0.0001 },
            { k: 'dv_kosten_11_20', l: 'DV-Kosten p.a. Jahre 11–20 (€)', s: 100 },
          ]},
          { key: 'hm2', label: 'HM2 – EEG (kein Bonus)', fields: [
            { k: 'dv_bonus_1_10', l: 'DV-Bonus Jahre 1–10', s: 0.001 },
            { k: 'dv_kosten_11_20', l: 'DV-Kosten p.a. Jahre 11–20 (€)', s: 100 },
          ]},
          { key: 'hm3', label: 'HM3 – Batterie PS + Fix-PV', fields: [
            { k: 'dv_bonus_1_10', l: 'DV-Bonus Jahre 1–10', s: 0.001 },
            { k: 'fix_verguetung_pv_11_20', l: 'Fixvergütung PV Jahre 11–20 (€/kWh)', s: 0.0001 },
            { k: 'dv_kosten_11_20', l: 'DV-Kosten p.a. Jahre 11–20 (€)', s: 100 },
          ]},
          { key: 'hm4', label: 'HM4 – Ganzheitl. Profit-Share + EEG', fields: [
            { k: 'dv_bonus_1_10', l: 'DV-Bonus Jahre 1–10', s: 0.001 },
            { k: 'dv_kosten_11_20', l: 'DV-Kosten p.a. Jahre 11–20 (€)', s: 100 },
            { type: 'info', l: 'Zyklen/Tag', info: 'Innovationsausschreibung — fixe 1,23 Zyklen/Tag, keine Erhöhung erlaubt', value: 'fix 1,23' },
          ]},
          { key: 'hm5', label: 'HM5 – Vollst. PS + EEG + opt. Ersatzinvest.', fields: [
            { k: 'dv_bonus_1_10', l: 'DV-Bonus Jahre 1–10', s: 0.001 },
            { k: 'untergrenze_kapazitaet', l: 'Kapazitäts-Schwelle (kWh)', h: 'Bei Unterschreitung: NPV-Prüfung ob Ersatz (2.926.080 €) sinnvoll', s: 10 },
            { k: 'zyklen_11_20', l: 'Zyklen/Tag Jahre 11–20 (optimierbar)', s: 0.01, min: 0, max: 4.5 },
            { k: 'dv_kosten_11_20', l: 'DV-Kosten p.a. Jahre 11–20 (€)', s: 100 },
          ]},
          { key: 'hm6', label: 'HM6 – Hybrid PS + Fix-PV + opt. Ersatzinvest.', fields: [
            { k: 'dv_bonus_1_10', l: 'DV-Bonus Jahre 1–10', s: 0.001 },
            { k: 'zyklen_11_20', l: 'Zyklen/Tag Jahre 11–20 (optimierbar)', s: 0.01, min: 0, max: 4.5 },
            { k: 'fix_verguetung_pv_11_20', l: 'Fixvergütung PV Jahre 11–20 (€/kWh)', s: 0.001 },
            { k: 'dv_kosten_11_20', l: 'DV-Kosten p.a. Jahre 11–20 (€)', s: 100 },
            { k: 'untergrenze_kapazitaet', l: 'Kapazitäts-Schwelle (kWh)', h: 'Bei Unterschreitung: NPV-Prüfung ob Ersatz (2.926.080 €) sinnvoll', s: 10 },
          ]},
        ].map(({ key, label, fields }) => (
          <Section key={key} title={label} open={open[key]} onToggle={() => toggle(key)}>
            <div style={{ paddingTop: 16 }}>
              {fields.map(f => f.type === 'info'
                ? <InfoRow key={f.l} label={f.l} info={f.info} value={f.value} />
                : <ParamRow key={f.k} label={f.l} hint={f.h} value={params[key][f.k]} onChange={v => upd(key, f.k, v)} step={f.s} min={f.min} max={f.max} />
              )}
            </div>
          </Section>
        ))}
      </div>

      <Section title="HME 1–3 (Jahre 21–30)" open={open.hme} onToggle={() => toggle('hme')} fullWidth>
        <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 40px' }}>
          <div>
            <SubLabel text="HME1 (für HM1 + HM2)" />
            <ParamRow label="DV-Bonus" value={params.hme1.dv_bonus} onChange={v => upd('hme1','dv_bonus',v)} step={0.001} />
            <ParamRow label="DV-Kosten (€)" value={params.hme1.dv_kosten} onChange={v => upd('hme1','dv_kosten',v)} step={100} />
            <ParamRow label="Zyklen/Tag" value={params.hme1.zyklen} onChange={v => upd('hme1','zyklen',v)} step={0.01} />
          </div>
          <div>
            <SubLabel text="HME2 (für HM3 + HM5)" />
            <ParamRow label="Fixvergütung PV (€/kWh)" value={params.hme2.fix_verguetung_pv} onChange={v => upd('hme2','fix_verguetung_pv',v)} step={0.001} />
            <ParamRow label="DV-Kosten (€)" value={params.hme2.dv_kosten} onChange={v => upd('hme2','dv_kosten',v)} step={100} />
            <ParamRow label="Zyklen/Tag" value={params.hme2.zyklen} onChange={v => upd('hme2','zyklen',v)} step={0.01} />
          </div>
          <div>
            <SubLabel text="HME3 (für HM4 + HM6)" />
            <ParamRow label="DV-Kosten (€)" value={params.hme3.dv_kosten} onChange={v => upd('hme3','dv_kosten',v)} step={100} />
            <ParamRow label="Zyklen/Tag" value={params.hme3.zyklen} onChange={v => upd('hme3','zyklen',v)} step={0.01} />
          </div>
        </div>
      </Section>
    </div>
  )
}
