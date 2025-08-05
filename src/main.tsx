import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize app without Capacitor for now (will be added when packages are installed)
const initializeApp = async () => {
  console.log('🚀 Starting Pilot Sync Nexus...')
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// Start the app
initializeApp()
