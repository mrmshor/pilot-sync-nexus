import { useEffect, useRef } from 'react'

export const useCapacitorOptimizations = () => {
  const isNative = useRef(typeof window !== 'undefined' && window.Capacitor?.isNativePlatform() || false)
  const platform = useRef(typeof window !== 'undefined' && window.Capacitor?.getPlatform() || 'web')
  
  useEffect(() => {
    // Platform-specific optimizations
    if (isNative.current) {
      // Disable text selection on native platforms
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      
      // Disable context menu
      const handleContextMenu = (e: Event) => e.preventDefault()
      document.addEventListener('contextmenu', handleContextMenu)
      
      // Handle back button (Android)
      if (platform.current === 'android') {
        // Add back button handler if needed
      }
      
      return () => {
        // Cleanup
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
        document.removeEventListener('contextmenu', handleContextMenu)
      }
    }
  }, [])
  
  return {
    isNative: isNative.current,
    platform: platform.current
  }
}