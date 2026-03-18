const BASE = '/api'

export async function getDefaults() {
  const res = await fetch(`${BASE}/defaults`)
  if (!res.ok) throw new Error('Failed to fetch defaults')
  return res.json()
}

export async function calculate(params) {
  const res = await fetch(`${BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Calculation failed')
  return res.json()
}

export async function optimizeReset() {
  const res = await fetch(`${BASE}/optimize/reset`, { method: 'POST' })
  if (!res.ok) throw new Error('Reset failed')
  return res.json()
}

export async function optimizeZyklen(params) {
  const res = await fetch(`${BASE}/optimize/zyklen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Zyklen optimization failed')
  return res.json()
}

export async function optimizeFixverguetung(params) {
  const res = await fetch(`${BASE}/optimize/fixverguetung`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Fixvergütung optimization failed')
  return res.json()
}
