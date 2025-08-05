import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// ✅ Safe app initialization without Capacitor imports for now
const initializeCapacitor = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.Capacitor?.isNativePlatform()) {
    console.log('Running in web browser')
    return
  }

  try {
    console.log(`Initializing Capacitor on ${window.Capacitor.getPlatform()}`)
    
    // ✅ Hide splash screen safely
    if (window.Capacitor.SplashScreen) {
      await window.Capacitor.SplashScreen.hide().catch((e: any) => 
        console.warn('SplashScreen.hide failed:', e)
      )
    }
    
    console.log('Capacitor initialized successfully')
  } catch (error) {
    console.error('Capacitor initialization failed:', error)
  }
}

// ✅ Safe app initialization
const initializeApp = async (): Promise<void> => {
  try {
    await initializeCapacitor()
    
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Root element not found')
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (error) {
    console.error('App initialization failed:', error)
    // ✅ Show error UI
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Application Error</h1>
        <p>Failed to initialize app: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()">Reload</button>
      </div>
    `
  }
}

// ✅ Start app safely
initializeApp()
