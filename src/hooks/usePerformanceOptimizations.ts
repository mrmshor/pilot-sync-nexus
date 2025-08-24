import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

// Debounce hook לחיפוש מהיר
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling לרשימות גדולות
export const useVirtualization = (
  itemCount: number, 
  itemHeight: number, 
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );
  
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(i);
  }
  
  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight: itemCount * itemHeight,
    setScrollTop
  };
};

// Performance monitoring
export const usePerformanceMonitor = () => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Component render #${renderCountRef.current}, Time since last: ${timeSinceLastRender}ms`);
    }
  });
  
  return {
    renderCount: renderCountRef.current,
    resetCount: () => { renderCountRef.current = 0; }
  };
};

// Memory cleanup hook
export const useCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

// Optimized state updates
export const useBatchedUpdates = () => {
  const [pendingUpdates, setPendingUpdates] = useState<(() => void)[]>([]);
  
  const batchUpdate = useCallback((updateFn: () => void) => {
    setPendingUpdates(prev => [...prev, updateFn]);
  }, []);
  
  useEffect(() => {
    if (pendingUpdates.length > 0) {
      const timeoutId = setTimeout(() => {
        pendingUpdates.forEach(updateFn => updateFn());
        setPendingUpdates([]);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pendingUpdates]);
  
  return { batchUpdate };
};

// Large dataset handler
export const useOptimizedData = <T>(
  data: T[], 
  pageSize: number = 50
) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));
  
  const loadPage = useCallback((page: number) => {
    setLoadedPages(prev => new Set([...prev, page]));
  }, []);
  
  const getVisibleData = useCallback(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(0, endIndex);
  }, [data, currentPage, pageSize]);
  
  return {
    visibleData: getVisibleData(),
    currentPage,
    setCurrentPage,
    loadPage,
    hasMore: (currentPage + 1) * pageSize < data.length
  };
};