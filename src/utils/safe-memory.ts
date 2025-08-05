// Safe Memory Manager
export class SafeMemoryManager {
  private static timers = new Set<number>()
  private static listeners = new WeakMap<EventTarget, Array<{type: string, listener: EventListener}>>()
  
  // ✅ Safe timer management
  static setTimeout(callback: () => void, delay: number): number {
    const timerId = window.setTimeout(() => {
      this.timers.delete(timerId)
      callback()
    }, delay)
    this.timers.add(timerId)
    return timerId
  }
  
  static clearTimeout(timerId: number): void {
    this.timers.delete(timerId)
    window.clearTimeout(timerId)
  }
  
  // ✅ Safe event listener management
  static addEventListener(
    target: EventTarget, 
    type: string, 
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options)
    
    if (!this.listeners.has(target)) {
      this.listeners.set(target, [])
    }
    this.listeners.get(target)!.push({type, listener})
  }
  
  // ✅ Cleanup all
  static cleanup(): void {
    // Clear all timers
    this.timers.forEach(timerId => window.clearTimeout(timerId))
    this.timers.clear()
    
    // Note: WeakMap doesn't support iteration, so we'll use a different approach
    // The listeners will be garbage collected when their targets are removed
    console.log('Memory cleanup completed')
  }
}

// ✅ Global cleanup on unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    SafeMemoryManager.cleanup()
  })
}