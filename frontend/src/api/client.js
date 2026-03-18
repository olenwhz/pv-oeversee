const BASE = '/api'

function getUser() {
  return localStorage.getItem('pv_user') || 'unknown'
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'X-User': getUser() }
}

export async function getDefaults() {
  const res = await fetch(`${BASE}/defaults`, { headers: { 'X-User': getUser() } })
  if (!res.ok) throw new Error('Failed to fetch defaults')
  return res.json()
}

export async function calculate(params) {
  const res = await fetch(`${BASE}/calculate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Calculation failed')
  return res.json()
}

export async function optimizeReset() {
  const res = await fetch(`${BASE}/optimize/reset`, { method: 'POST', headers: authHeaders() })
  if (!res.ok) throw new Error('Reset failed')
  return res.json()
}

export async function optimizeZyklen(params) {
  const res = await fetch(`${BASE}/optimize/zyklen`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Zyklen optimization failed')
  return res.json()
}

export async function optimizeFixverguetung(params) {
  const res = await fetch(`${BASE}/optimize/fixverguetung`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Fixvergütung optimization failed')
  return res.json()
}

export async function logActivity(action, detail = '') {
  try {
    await fetch(`${BASE}/activity/log`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user: getUser(), action, detail }),
    })
  } catch {
    // Fire-and-forget; silently ignore errors
  }
}

export async function getRecentActivity() {
  const res = await fetch(`${BASE}/activity/recent`, { headers: { 'X-User': getUser() } })
  if (!res.ok) throw new Error('Failed to fetch activity')
  return res.json()
}
