import { useEffect, useRef, useCallback } from 'react'
import { SafeMemoryManager } from '../utils/safe-memory'

export const useCapacitorSafe = () => {
  const isNative = useRef(typeof window !== 'undefined' && window.Capacitor?.isNativePlatform() || false)
  const platform = useRef(typeof window !== 'undefined' && window.Capacitor?.getPlatform() || 'web')
  const cleanupFns = useRef<Array<() => void>>([])
  
  const addCleanup = useCallback((fn: () => void) => {
    cleanupFns.current.push(fn)
  }, [])
  
  useEffect(() => {
    // ✅ Platform optimizations
    if (isNative.current) {
      // Disable text selection on mobile
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      
      addCleanup(() => {
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
      })
    }
    
    // ✅ Cleanup on unmount
    return () => {
      cleanupFns.current.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.warn('Cleanup function failed:', error)
        }
      })
      cleanupFns.current = []
    }
  }, [addCleanup])
  
  return {
    isNative: isNative.current,
    platform: platform.current,
    addCleanup
  }
}