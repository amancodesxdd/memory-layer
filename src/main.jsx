
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error?.message || e.message)
  document.getElementById('root')?.classList.add('error-mode')
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason?.message || e.reason)
})

const root = createRoot(document.getElementById('root'))
root.render(<App />)
