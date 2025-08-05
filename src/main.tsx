import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize app without Capacitor imports for now (will be added when packages are installed)
const initApp = async () => {
  console.log('🚀 Starting Pilot Sync Nexus...')
  
  // Check if Capacitor is available
  if (typeof window !== 'undefined' && window.Capacitor) {
    console.log('Running on native platform:', window.Capacitor.getPlatform())
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

initApp()
