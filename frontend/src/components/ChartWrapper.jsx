import React from 'react'

export default function ChartWrapper({ title, children, style }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e8e8ed',
      padding: '24px 24px 16px',
      ...style,
    }}>
      {title && (
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 20 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
