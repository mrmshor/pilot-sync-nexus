// Debug helper without Capacitor dependency for now
export class DebugHelper {
  private static instance: DebugHelper
  private logs: string[] = []
  
  static getInstance(): DebugHelper {
    if (!DebugHelper.instance) {
      DebugHelper.instance = new DebugHelper()
    }
    return DebugHelper.instance
  }
  
  log(message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    
    console.log(logEntry, data)
    this.logs.push(logEntry)
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }
  
  error(message: string, error?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ERROR: ${message}`
    
    console.error(logEntry, error)
    this.logs.push(logEntry)
  }
  
  getSystemInfo() {
    return {
      platform: typeof window !== 'undefined' && window.Capacitor?.getPlatform() || 'web',
      isNative: typeof window !== 'undefined' && window.Capacitor?.isNativePlatform() || false,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      logs: this.logs.slice(-10) // Last 10 logs
    }
  }
  
  exportLogs() {
    return {
      systemInfo: this.getSystemInfo(),
      allLogs: this.logs
    }
  }
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    DebugHelper.getInstance().error('Global Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    DebugHelper.getInstance().error('Unhandled Promise Rejection', {
      reason: event.reason
    })
  })
}
