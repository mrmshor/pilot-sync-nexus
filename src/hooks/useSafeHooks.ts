import { useState, useCallback, useMemo } from 'react'

// ✅ Safe debounce function
export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const [timeoutId, setTimeoutId] = useState<number | null>(null)

  return useCallback((...args: T) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    const newTimeoutId = window.setTimeout(() => {
      callback(...args)
      setTimeoutId(null)
    }, delay)
    
    setTimeoutId(newTimeoutId)
  }, [callback, delay, timeoutId])
}

// ✅ Safe optimized data hook
export const useOptimizedData = <T>(data: T[], searchTerm: string = '') => {
  return useMemo(() => {
    if (!searchTerm.trim()) return data
    
    return data.filter((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      return String(item).toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [data, searchTerm])
}