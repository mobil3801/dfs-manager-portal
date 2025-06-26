/**
 * Optimized Memory Management
 * Lightweight replacement for heavy memory leak detection
 */

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
}

interface OptimizedMemoryManager {
  getMemoryInfo: () => MemoryInfo;
  performCleanup: () => void;
  isMemoryHigh: () => boolean;
  setupCleanupInterval: (interval?: number) => () => void;
}

/**
 * Lightweight memory management without infinite loops
 */
export const createOptimizedMemoryManager = (): OptimizedMemoryManager => {
  let cleanupInterval: NodeJS.Timeout | null = null;

  const getMemoryInfo = (): MemoryInfo => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const used = memInfo.usedJSHeapSize || 0;
      const total = memInfo.totalJSHeapSize || 1;
      const percentage = used / total * 100;

      return { used, total, percentage };
    }

    return { used: 0, total: 1, percentage: 0 };
  };

  const performCleanup = (): void => {
    try {
      // Clear any cached data that might be consuming memory
      if (window.ezsite?.cache?.clear) {
        window.ezsite.cache.clear();
      }

      // Force garbage collection if available (dev only)
      if (process.env.NODE_ENV === 'development' && 'gc' in window) {
        (window as any).gc();
      }

      console.log('🧹 Memory cleanup performed');
    } catch (error) {
      console.warn('Memory cleanup failed:', error);
    }
  };

  const isMemoryHigh = (): boolean => {
    const memInfo = getMemoryInfo();
    return memInfo.percentage > 80; // 80% threshold
  };

  const setupCleanupInterval = (interval = 300000): (() => void) => {
    // Clear existing interval
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }

    // Setup new interval (default: 5 minutes)
    cleanupInterval = setInterval(() => {
      if (isMemoryHigh()) {
        console.log('⚠️ High memory usage detected, performing cleanup...');
        performCleanup();
      }
    }, interval);

    // Return cleanup function
    return () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    };
  };

  return {
    getMemoryInfo,
    performCleanup,
    isMemoryHigh,
    setupCleanupInterval
  };
};

// Global instance
export const optimizedMemoryManager = createOptimizedMemoryManager();

// Auto-setup cleanup interval
export const enableOptimizedMemoryManagement = () => {
  return optimizedMemoryManager.setupCleanupInterval();
};

export default optimizedMemoryManager;