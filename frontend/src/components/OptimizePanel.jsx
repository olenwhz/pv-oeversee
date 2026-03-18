import React, { useState } from 'react'
import { optimizeZyklen, optimizeFixverguetung, optimizeReset } from '../api/client.js'
import { useApp } from '../App.jsx'

export default function OptimizePanel() {
  const { params, setParams, forceCalculate } = useApp()
  const [status, setStatus] = useState({})

  async function handleReset() {
    setStatus(s => ({ ...s, reset: 'loading' }))
    try {
      const defaults = await optimizeReset()
      setParams(defaults)
      setStatus(s => ({ ...s, reset: 'done' }))
    } catch (e) {
      setStatus(s => ({ ...s, reset: 'error' }))
    }
  }

  async function handleZyklen() {
    setStatus(s => ({ ...s, zyklen: 'loading' }))
    try {
      const optimized = await optimizeZyklen(params)
      setParams(optimized)
      setStatus(s => ({ ...s, zyklen: 'done' }))
    } catch (e) {
      setStatus(s => ({ ...s, zyklen: 'error' }))
    }
  }

  async function handleFixverguetung() {
    setStatus(s => ({ ...s, fix: 'loading' }))
    try {
      const optimized = await optimizeFixverguetung(params)
      setParams(optimized)
      setStatus(s => ({ ...s, fix: 'done' }))
    } catch (e) {
      setStatus(s => ({ ...s, fix: 'error' }))
    }
  }

  return { handleReset, handleZyklen, handleFixverguetung, status }
}
