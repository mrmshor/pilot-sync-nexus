import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('🚀 Starting Pilot Sync Nexus...')

const initializeApp = async () => {
  try {
    // Check if Capacitor is available
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      console.log('📱 Running on native platform:', window.Capacitor.getPlatform())
      
      // Native platform optimizations can be added here when Capacitor is installed
    } else {
      console.log('🌐 Running in web browser')
    }

    // Initialize React
    const root = document.getElementById('root')
    if (!root) {
      throw new Error('Root element not found')
    }

    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )

    console.log('✅ App initialized successfully')
  } catch (error) {
    console.error('❌ App initialization failed:', error)
    
    // Emergency fallback UI
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; text-align: center;">
        <h1 style="color: #e53e3e;">Application Error</h1>
        <p>Failed to start Pilot Sync Nexus</p>
        <details style="margin: 20px 0; text-align: left;">
          <summary>Error Details</summary>
          <pre style="background: #f7fafc; padding: 10px; border-radius: 5px; overflow: auto;">
${error instanceof Error ? error.message : 'Unknown error'}
${error instanceof Error ? error.stack || '' : ''}
          </pre>
        </details>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #3182ce; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Reload Application
        </button>
      </div>
    `
  }
}

// Start the application
initializeApp()