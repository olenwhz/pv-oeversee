import React, { useState } from 'react'
import { useApp } from '../App.jsx'

const HM_KEYS = ['hm1', 'hm2', 'hm3', 'hm4', 'hm5', 'hm6']

function fmt(v) {
  if (v === null || v === undefined) return '—'
  return Math.round(v).toLocaleString('de-DE')
}

function fmtX(v) {
  if (v === null || v === undefined) return '—'
  return v.toFixed(3) + '×'
}

function exportCSV(rows, years, hm) {
  const header = ['Kennzahl', ...years.map(y => `J${y.year}`)]
  const lines = rows.map(r => [r.label, ...years.map(y => r.get(y) ?? '')].join(';'))
  const csv = [header.join(';'), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `zahlungsreihen_${hm}.csv`; a.click()
  URL.revokeObjectURL(url)
}

const SECTION_STYLE = {
  background: '#f0f7ff',
  fontWeight: 700,
  fontSize: 11,
  color: '#0071e3',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '6px 12px',
  borderBottom: '1px solid #d0e8ff',
}

const METRIC_LABEL_STYLE = {
  padding: '6px 12px',
  fontWeight: 500,
  fontSize: 12,
  color: '#1d1d1f',
  background: '#fafafa',
  borderBottom: '1px solid #f0f0f5',
  whiteSpace: 'nowrap',
  position: 'sticky',
  left: 0,
  zIndex: 2,
  minWidth: 200,
}

const METRIC_HINT_STYLE = {
  fontSize: 11,
  color: '#86868b',
  fontWeight: 400,
}

const SECTION_LABEL_STYLE = {
  ...METRIC_LABEL_STYLE,
  ...SECTION_STYLE,
}

const YEAR_HEADER_STYLE = {
  padding: '6px 10px',
  textAlign: 'right',
  fontWeight: 600,
  fontSize: 11,
  color: '#86868b',
  background: '#fafafa',
  borderBottom: '2px solid #e8e8ed',
  whiteSpace: 'nowrap',
  minWidth: 80,
}

const CELL_STYLE = {
  padding: '6px 10px',
  textAlign: 'right',
  fontSize: 12,
  color: '#1d1d1f',
  borderBottom: '1px solid #f5f5f7',
  whiteSpace: 'nowrap',
}

function Row({ label, hint, years, get, color, bold, isSection }) {
  if (isSection) {
    return (
      <tr>
        <td style={SECTION_LABEL_STYLE} colSpan={1}>{label}</td>
        {years.map(y => (
          <td key={y.year} style={{ ...SECTION_STYLE, textAlign: 'right', padding: '6px 10px', minWidth: 80 }} />
        ))}
      </tr>
    )
  }
  return (
    <tr>
      <td style={METRIC_LABEL_STYLE}>
        {label}
        {hint && <span style={METRIC_HINT_STYLE}> ({hint})</span>}
      </td>
      {years.map((y, i) => {
        const val = get(y)
        return (
          <td key={y.year} style={{
            ...CELL_STYLE,
            background: i % 2 === 0 ? '#fff' : '#fafafe',
            color: color ? color(val, y) : '#1d1d1f',
            fontWeight: bold ? 600 : 400,
          }}>
            {val}
          </td>
        )
      })}
    </tr>
  )
}

export default function Zahlungsreihen() {
  const { results } = useApp()
  const [selectedHm, setSelectedHm] = useState('hm1')

  if (!results) return <div style={{ color: '#86868b' }}>Lade…</div>

  const data = results[selectedHm]
  const years = data?.years || []
  const consts = data?.constants || {}

  // Build row definitions
  const rows = [
    // === Ertrag ===
    { isSection: true, label: 'Ertrag' },
    { label: 'Produktion', hint: 'MWh', get: y => fmt(y.production / 1000) },
    { label: 'Erlöse', hint: '€', get: y => fmt(y.erloes), bold: true },

    // === Betriebskosten ===
    { isSection: true, label: 'Betriebskosten (OPEX)' },
    { label: 'OPEX gesamt', hint: '€', get: y => fmt(y.opex), color: () => '#cc0000', bold: true },
    { label: '  Betrieb & Wartung', hint: '€', get: y => fmt(y.opex_breakdown?.betrieb) },
    { label: '  Verwaltung', hint: '€', get: y => fmt(y.opex_breakdown?.verwaltung) },
    { label: '  Grünpflege', hint: '€', get: y => fmt(y.opex_breakdown?.gruenpflege) },
    { label: '  Eigenstrom', hint: '€', get: y => fmt(y.opex_breakdown?.eigenstrom) },
    { label: '  Versicherung', hint: '€', get: y => fmt(y.opex_breakdown?.versicherung) },
    { label: '  Pacht', hint: '€', get: y => fmt(y.opex_breakdown?.pacht) },
    { label: '  DV-Kosten', hint: '€', get: y => fmt(y.opex_breakdown?.dv_kosten) },
    { label: '  Ersatzinvestition', hint: '€', get: y => y.opex_breakdown?.ersatz > 0 ? fmt(y.opex_breakdown.ersatz) : '—', color: (v) => v !== '—' ? '#ff9f0a' : '#86868b' },

    // === GuV ===
    { isSection: true, label: 'Gewinn- und Verlustrechnung' },
    { label: 'AfA', hint: '€', get: y => fmt(y.afa) },
    { label: 'EBIT', hint: '€', get: y => fmt(y.ebit), bold: true, color: (v, y) => y.ebit >= 0 ? '#00875a' : '#cc0000' },
    { label: 'Zinsen', hint: '€', get: y => fmt(y.zinsen) },
    { label: 'EBT', hint: '€', get: y => fmt(y.ebt), bold: true },
    { label: 'Gewerbesteuer', hint: '€', get: y => fmt(y.gewst) },
    { label: 'EAT (Jahresüberschuss)', hint: '€', get: y => fmt(y.eat), bold: true },

    // === Cashflow ===
    { isSection: true, label: 'Cashflow' },
    { label: 'CF nach Steuern', hint: '€', get: y => fmt(y.cf_steuern), bold: true },
    { label: 'Tilgung', hint: '€', get: y => fmt(y.tilgung) },
    { label: 'CF nach Tilgung', hint: '€', get: y => fmt(y.cf_tilgung), bold: true, color: (v, y) => y.cf_tilgung >= 0 ? '#00875a' : '#cc0000' },

    // === Schulden ===
    { isSection: true, label: 'Kapitalstruktur' },
    { label: 'Restschuld Anfang', hint: '€', get: y => fmt(y.restschuld_anfang) },
    { label: 'Restschuld Ende', hint: '€', get: y => fmt(y.restschuld_ende) },
    { label: 'Kapitaldienst', hint: '€', get: y => fmt(y.kapitaldienst) },
    { label: 'DSCR', get: y => {
      const dscr = data.kpis?.dscr_values?.[y.year - 1]
      return dscr != null ? fmtX(dscr) : '—'
    }, color: (v) => v === '—' ? '#86868b' : parseFloat(v) >= 1.08 ? '#00875a' : '#cc0000' },
  ]

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
            onClick={() => exportCSV(rows.filter(r => !r.isSection), years, selectedHm)}
            style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
          >
            CSV Export
          </button>
        </div>
      </div>

      {/* Constants bar */}
      {consts.capex && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { l: 'CAPEX', v: fmt(consts.capex) + ' €' },
            { l: 'Darlehen', v: fmt(consts.darlehen) + ' €' },
            { l: 'Eigenkapital', v: fmt(consts.eigenkapital) + ' €' },
            { l: 'Zinscap', v: fmt(consts.kosten_zinscap) + ' €' },
          ].map(c => (
            <div key={c.l} style={{ background: '#fff', border: '1px solid #e8e8ed', borderRadius: 12, padding: '10px 16px', fontSize: 13 }}>
              <span style={{ color: '#86868b', marginRight: 6 }}>{c.l}</span>
              <span style={{ fontWeight: 600 }}>{c.v}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12, tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ ...YEAR_HEADER_STYLE, position: 'sticky', left: 0, zIndex: 3, minWidth: 200, textAlign: 'left' }}>
                  Kennzahl
                </th>
                {years.map(y => (
                  <th key={y.year} style={YEAR_HEADER_STYLE}>J{y.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <Row
                  key={idx}
                  label={row.label}
                  hint={row.hint}
                  years={years}
                  get={row.get}
                  color={row.color}
                  bold={row.bold}
                  isSection={row.isSection}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
