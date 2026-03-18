import React from 'react'

export default function KPICard({ label, value, sub, accent, small }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '28px 32px',
      border: '1px solid #e8e8ed',
    }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        fontSize: small ? 32 : 48,
        fontWeight: 700,
        color: accent || '#1d1d1f',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 13, color: '#86868b', marginTop: 8 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
