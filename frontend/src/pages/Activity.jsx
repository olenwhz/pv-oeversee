import React, { useEffect, useState } from 'react'
import { getRecentActivity } from '../api/client.js'

function fmtTs(ts) {
  try {
    return new Date(ts).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return ts
  }
}

const ACTION_COLOR = {
  login: '#00875a',
  logout: '#cc0000',
  calculate: '#0071e3',
  optimize: '#ff9f0a',
}

export default function Activity() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRecentActivity()
      .then(data => { setEntries([...data].reverse()); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Aktivitätslog</h1>
        <p style={{ color: '#86868b', fontSize: 15 }}>Benutzeraktionen der letzten 100 Einträge</p>
      </div>

      {loading && <div style={{ color: '#86868b' }}>Lade…</div>}
      {error && <div style={{ color: '#cc0000' }}>Fehler: {error}</div>}

      {!loading && !error && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '2px solid #e8e8ed' }}>
                {['Zeitpunkt', 'Benutzer', 'Aktion', 'Detail'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#86868b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '20px 16px', color: '#86868b', textAlign: 'center' }}>Keine Einträge vorhanden</td>
                </tr>
              )}
              {entries.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f7', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px 16px', color: '#86868b', whiteSpace: 'nowrap' }}>{fmtTs(e.ts)}</td>
                  <td style={{ padding: '8px 16px', fontWeight: 500 }}>{e.user}</td>
                  <td style={{ padding: '8px 16px' }}>
                    <span style={{
                      background: (ACTION_COLOR[e.action] || '#86868b') + '18',
                      color: ACTION_COLOR[e.action] || '#86868b',
                      borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600,
                    }}>
                      {e.action}
                    </span>
                  </td>
                  <td style={{ padding: '8px 16px', color: '#515154' }}>{e.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
