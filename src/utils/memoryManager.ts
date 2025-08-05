// Memory Management Utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cache: Map<string, any> = new Map();
  private cacheSize: number = 0;
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  // Cache management with size limits
  set(key: string, value: any): void {
    const size = this.getObjectSize(value);
    
    if (this.cacheSize + size > this.maxCacheSize) {
      this.clearOldestEntries();
    }
    
    this.cache.set(key, { value, timestamp: Date.now(), size });
    this.cacheSize += size;
  }
  
  get(key: string): any {
    const entry = this.cache.get(key);
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      return entry.value;
    }
    return null;
  }
  
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.cacheSize -= entry.size;
      this.cache.delete(key);
    }
  }
  
  clear(): void {
    this.cache.clear();
    this.cacheSize = 0;
  }
  
  // Clear oldest 25% of entries
  private clearOldestEntries(): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const entriesToRemove = Math.floor(entries.length * 0.25);
    
    for (let i = 0; i < entriesToRemove; i++) {
      const [key, entry] = entries[i];
      this.cacheSize -= entry.size;
      this.cache.delete(key);
    }
  }
  
  // Rough object size calculation
  private getObjectSize(obj: any): number {
    let size = 0;
    
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'string':
          size = obj.length * 2; // 2 bytes per character
          break;
        case 'boolean':
          size = 4;
          break;
        case 'number':
          size = 8;
          break;
        case 'object':
          size = JSON.stringify(obj).length * 2;
          break;
        default:
          size = 0;
      }
    }
    
    return size;
  }
  
  // Memory usage stats
  getStats(): { cacheSize: number; entryCount: number; maxSize: number } {
    return {
      cacheSize: this.cacheSize,
      entryCount: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

// Image optimization and caching
export class ImageCache {
  private static cache: Map<string, HTMLImageElement> = new Map();
  private static maxImages: number = 100;
  
  static async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (this.cache.size >= this.maxImages) {
          // Remove oldest entry
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
        
        this.cache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  static getImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
}

// Cleanup utilities
export const cleanupEventListeners = (element: Element) => {
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
  return clone;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};