import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { getDefaults, calculate, logActivity } from './api/client.js'
import Dashboard from './pages/Dashboard.jsx'
import Parameters from './pages/Parameters.jsx'
import Optimierungen from './pages/Optimierungen.jsx'
import HMDetail from './pages/HMDetail.jsx'
import Zahlungsreihen from './pages/Zahlungsreihen.jsx'
import Ertraege from './pages/Ertraege.jsx'
import Strompreise from './pages/Strompreise.jsx'
import Batterietabellen from './pages/Batterietabellen.jsx'
import Kennzahlen from './pages/Kennzahlen.jsx'
import Activity from './pages/Activity.jsx'
import Sidebar from './components/Sidebar.jsx'
import Login from './pages/Login.jsx'

export const AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('pv_user') || null)
  const [params, setParams] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  function handleLogin(username) {
    localStorage.setItem('pv_user', username)
    setUser(username)
    logActivity('login', username)
  }

  function handleLogout() {
    logActivity('logout', user || '')
    localStorage.removeItem('pv_user')
    setUser(null)
  }

  useEffect(() => {
    if (!user) return
    getDefaults().then(defaults => {
      setParams(defaults)
    }).catch(e => setError(e.message))
  }, [user])

  useEffect(() => {
    if (!params) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runCalculation(params)
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [params])

  async function runCalculation(p) {
    setLoading(true)
    setError(null)
    try {
      const res = await calculate(p)
      setResults(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const updateParams = useCallback((updater) => {
    setParams(prev => {
      if (typeof updater === 'function') return updater(prev)
      return updater
    })
  }, [])

  const forceCalculate = useCallback(() => {
    if (params) runCalculation(params)
  }, [params])

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <AppContext.Provider value={{ params, setParams: updateParams, results, loading, error, forceCalculate }}>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar user={user} onLogout={handleLogout} />
          <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', overflowY: 'auto', padding: '48px 48px 48px 32px' }}>
            {error && (
              <div style={{
                background: '#fff0f0', border: '1px solid #ffc0c0', borderRadius: 8,
                padding: '12px 16px', marginBottom: 24, color: '#cc0000', fontSize: 14
              }}>
                Fehler: {error}
              </div>
            )}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/parameters" element={<Parameters />} />
              <Route path="/optimierungen" element={<Optimierungen />} />
              <Route path="/hm/:id" element={<HMDetail />} />
              <Route path="/zahlungsreihen" element={<Zahlungsreihen />} />
              <Route path="/ertraege" element={<Ertraege />} />
              <Route path="/strompreise" element={<Strompreise />} />
              <Route path="/batterietabellen" element={<Batterietabellen />} />
              <Route path="/kennzahlen" element={<Kennzahlen />} />
              <Route path="/activity" element={<Activity />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
