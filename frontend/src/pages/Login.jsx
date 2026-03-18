import React, { useState } from 'react'

const USERS = {
  'ole.nieuwenhuizen': '1234',
  'mattis.joost': '1234',
  'leon.petersen': '1234',
  'gavin.matthiesen': '1234',
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (USERS[username] && USERS[username] === password) {
      onLogin(username)
    } else {
      setError('Benutzername oder Passwort falsch.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '48px 40px',
        width: 360,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>☀</div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1d1d1f' }}>
            PV-Park Finanzrechner
          </div>
          <div style={{ fontSize: 12, color: '#86868b', marginTop: 4 }}>Översee 10,7 MWp</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868b', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Benutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              autoComplete="username"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d2d2d7',
                borderRadius: 8,
                fontSize: 14,
                color: '#1d1d1f',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#0071e3'}
              onBlur={e => e.target.style.borderColor = '#d2d2d7'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#86868b', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d2d2d7',
                borderRadius: 8,
                fontSize: 14,
                color: '#1d1d1f',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#0071e3'}
              onBlur={e => e.target.style.borderColor = '#d2d2d7'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff0f0',
              border: '1px solid #ffc0c0',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 16,
              color: '#cc0000',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              background: '#0071e3',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = '#0077ed'}
            onMouseLeave={e => e.target.style.background = '#0071e3'}
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  )
}
