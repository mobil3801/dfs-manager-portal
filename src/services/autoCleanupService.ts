// Auto Cleanup Service for Long-Running Sessions
// Prevents memory accumulation in production environments

interface CleanupConfig {
  sessionTimeoutMinutes: number;
  maxIdleTimeMinutes: number;
  memoryThresholdMB: number;
  cleanupIntervalMs: number;
  enableUserActivityTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableDataExpiration: boolean;
  dataExpirationMinutes: number;
}

interface SessionMetrics {
  sessionStart: Date;
  lastActivity: Date;
  memoryUsage: number;
  dataAccesses: number;
  cleanupCount: number;
  performanceScore: number;
}

interface CleanupOperation {
  type: 'cache' | 'storage' | 'memory' | 'data' | 'listeners';
  description: string;
  execute: () => Promise<void>;
  priority: number;
}

class AutoCleanupService {
  private config: CleanupConfig;
  private sessionMetrics: SessionMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private activityListeners: Set<EventListener> = new Set();
  private dataExpirationTimers: Map<string, NodeJS.Timeout> = new Map();
  private isCleanupRunning = false;
  private cleanupHistory: Array<{ timestamp: Date; operations: string[]; memoryBefore: number; memoryAfter: number }> = [];

  constructor(config?: Partial<CleanupConfig>) {
    this.config = {
      sessionTimeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 480,
      maxIdleTimeMinutes: parseInt(import.meta.env.VITE_MAX_IDLE_TIME_MINUTES) || 30,
      memoryThresholdMB: parseInt(import.meta.env.VITE_MEMORY_THRESHOLD_MB) || 100,
      cleanupIntervalMs: parseInt(import.meta.env.VITE_AUTO_CLEANUP_INTERVAL) || 60000,
      enableUserActivityTracking: import.meta.env.VITE_ENABLE_USER_ACTIVITY_TRACKING !== 'false',
      enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
      enableDataExpiration: import.meta.env.VITE_ENABLE_DATA_EXPIRATION !== 'false',
      dataExpirationMinutes: parseInt(import.meta.env.VITE_DATA_RETENTION_MINUTES) || 30,
      ...config
    };

    this.sessionMetrics = {
      sessionStart: new Date(),
      lastActivity: new Date(),
      memoryUsage: 0,
      dataAccesses: 0,
      cleanupCount: 0,
      performanceScore: 100
    };

    this.initialize();
  }

  private initialize(): void {
    console.log('Auto Cleanup Service initialized with config:', this.config);
    
    if (this.config.enableUserActivityTracking) {
      this.setupActivityTracking();
    }
    
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }
    
    this.startCleanupScheduler();
  }

  private setupActivityTracking(): void {
    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      const listener = () => {
        this.sessionMetrics.lastActivity = new Date();
        this.sessionMetrics.dataAccesses++;
      };
      
      document.addEventListener(event, listener, { passive: true });
      this.activityListeners.add(listener);
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor performance every 30 seconds
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);
  }

  private updatePerformanceMetrics(): void {
    const performance = window.performance as any;
    
    if (performance?.memory) {
      this.sessionMetrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    
    // Calculate performance score based on memory usage and responsiveness
    const memoryScore = Math.max(0, 100 - (this.sessionMetrics.memoryUsage / this.config.memoryThresholdMB) * 50);
    const idleTime = Date.now() - this.sessionMetrics.lastActivity.getTime();
    const activityScore = Math.max(0, 100 - (idleTime / (this.config.maxIdleTimeMinutes * 60000)) * 50);
    
    this.sessionMetrics.performanceScore = (memoryScore + activityScore) / 2;
  }

  private startCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(async () => {
      await this.performScheduledCleanup();
    }, this.config.cleanupIntervalMs);
  }

  private async performScheduledCleanup(): Promise<void> {
    if (this.isCleanupRunning) {
      console.log('Cleanup already running, skipping...');
      return;
    }

    this.isCleanupRunning = true;
    const memoryBefore = this.sessionMetrics.memoryUsage;
    
    try {
      const operations = await this.determineCleanupOperations();
      
      if (operations.length === 0) {
        return;
      }
      
      console.log(`Executing ${operations.length} cleanup operations:`, operations.map(op => op.description));
      
      // Execute operations in priority order
      const sortedOperations = operations.sort((a, b) => b.priority - a.priority);
      const executedOperations: string[] = [];
      
      for (const operation of sortedOperations) {
        try {
          await operation.execute();
          executedOperations.push(operation.description);
        } catch (error) {
          console.error(`Failed to execute cleanup operation ${operation.description}:`, error);
        }
      }
      
      this.sessionMetrics.cleanupCount++;
      
      // Update metrics
      this.updatePerformanceMetrics();
      const memoryAfter = this.sessionMetrics.memoryUsage;
      
      // Record cleanup history
      this.cleanupHistory.push({
        timestamp: new Date(),
        operations: executedOperations,
        memoryBefore,
        memoryAfter
      });
      
      // Keep only last 10 cleanup records
      if (this.cleanupHistory.length > 10) {
        this.cleanupHistory.shift();
      }
      
      console.log(`Cleanup completed. Memory: ${memoryBefore.toFixed(1)}MB → ${memoryAfter.toFixed(1)}MB`);
      
    } catch (error) {
      console.error('Cleanup operation failed:', error);
    } finally {
      this.isCleanupRunning = false;
    }
  }

  private async determineCleanupOperations(): Promise<CleanupOperation[]> {
    const operations: CleanupOperation[] = [];
    const now = Date.now();
    const sessionAge = now - this.sessionMetrics.sessionStart.getTime();
    const idleTime = now - this.sessionMetrics.lastActivity.getTime();
    
    // Check session timeout
    if (sessionAge > this.config.sessionTimeoutMinutes * 60000) {
      operations.push({
        type: 'memory',
        description: 'Session timeout - full cleanup',
        priority: 10,
        execute: async () => {
          await this.performFullCleanup();
        }
      });
    }
    
    // Check idle timeout
    if (idleTime > this.config.maxIdleTimeMinutes * 60000) {
      operations.push({
        type: 'cache',
        description: 'Idle timeout - cache cleanup',
        priority: 8,
        execute: async () => {
          await this.cleanIdleCache();
        }
      });
    }
    
    // Check memory threshold
    if (this.sessionMetrics.memoryUsage > this.config.memoryThresholdMB) {
      operations.push({
        type: 'memory',
        description: 'Memory threshold exceeded - memory cleanup',
        priority: 9,
        execute: async () => {
          await this.performMemoryCleanup();
        }
      });
    }
    
    // Regular cache maintenance
    if (this.sessionMetrics.cleanupCount % 5 === 0) {
      operations.push({
        type: 'cache',
        description: 'Regular cache maintenance',
        priority: 5,
        execute: async () => {
          await this.performCacheMaintenance();
        }
      });
    }
    
    // Clean expired data
    if (this.config.enableDataExpiration) {
      operations.push({
        type: 'data',
        description: 'Clean expired data',
        priority: 6,
        execute: async () => {
          await this.cleanExpiredData();
        }
      });
    }
    
    // Remove orphaned event listeners
    if (this.sessionMetrics.cleanupCount % 10 === 0) {
      operations.push({
        type: 'listeners',
        description: 'Remove orphaned event listeners',
        priority: 4,
        execute: async () => {
          await this.cleanupEventListeners();
        }
      });
    }
    
    return operations;
  }

  private async performFullCleanup(): Promise<void> {
    // Clear all caches
    await this.clearAllCaches();
    
    // Clear local storage of old data
    this.cleanupLocalStorage();
    
    // Clear session storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    console.log('Full cleanup completed');
  }

  private async cleanIdleCache(): Promise<void> {
    // Clear React Query cache if available
    if (window.reactQueryClient) {
      window.reactQueryClient.clear();
    }
    
    // Clear component-level caches
    await this.clearComponentCaches();
  }

  private async performMemoryCleanup(): Promise<void> {
    // Clear large objects from memory
    await this.clearLargeObjects();
    
    // Clear image caches
    await this.clearImageCaches();
    
    // Clear unused data
    await this.clearUnusedData();
  }

  private async performCacheMaintenance(): Promise<void> {
    // Remove LRU cache entries
    await this.cleanLRUCache();
    
    // Compress cache entries
    await this.compressCacheEntries();
  }

  private async cleanExpiredData(): Promise<void> {
    const now = Date.now();
    const expirationTime = this.config.dataExpirationMinutes * 60000;
    
    // Clean expired timers
    for (const [key, timer] of this.dataExpirationTimers.entries()) {
      const [timestamp] = key.split('_');
      if (now - parseInt(timestamp) > expirationTime) {
        clearTimeout(timer);
        this.dataExpirationTimers.delete(key);
      }
    }
    
    // Clean expired localStorage entries
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('dfs_cache_') || key?.startsWith('temp_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (parsed.timestamp && now - parsed.timestamp > expirationTime) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // Invalid JSON, remove it
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`Cleaned ${keysToRemove.length} expired localStorage entries`);
      }
    } catch (error) {
      console.warn('Failed to clean expired localStorage:', error);
    }
  }

  private async cleanupEventListeners(): Promise<void> {
    // This is a placeholder - in practice, components should handle their own cleanup
    // But we can track and warn about potential memory leaks
    const listenerCount = this.activityListeners.size;
    console.log(`Currently tracking ${listenerCount} activity listeners`);
  }

  private async clearAllCaches(): Promise<void> {
    // Clear browser caches if possible
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log(`Cleared ${cacheNames.length} browser caches`);
      } catch (error) {
        console.warn('Failed to clear browser caches:', error);
      }
    }
  }

  private cleanupLocalStorage(): void {
    try {
      const keysToKeep = ['auth_token', 'user_preferences', 'theme_settings'];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.some(keepKey => key.includes(keepKey))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`Cleaned ${keysToRemove.length} localStorage entries`);
      }
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  }

  private async clearComponentCaches(): Promise<void> {
    // Dispatch custom event for components to clean their caches
    window.dispatchEvent(new CustomEvent('cleanup:component-caches'));
  }

  private async clearLargeObjects(): Promise<void> {
    // Dispatch custom event for components to clear large objects
    window.dispatchEvent(new CustomEvent('cleanup:large-objects'));
  }

  private async clearImageCaches(): Promise<void> {
    // Clear image caches
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
    });
  }

  private async clearUnusedData(): Promise<void> {
    // Dispatch custom event for components to clear unused data
    window.dispatchEvent(new CustomEvent('cleanup:unused-data'));
  }

  private async cleanLRUCache(): Promise<void> {
    // Dispatch custom event for LRU cache cleanup
    window.dispatchEvent(new CustomEvent('cleanup:lru-cache'));
  }

  private async compressCacheEntries(): Promise<void> {
    // Dispatch custom event for cache compression
    window.dispatchEvent(new CustomEvent('cleanup:compress-cache'));
  }

  // Public methods
  public getSessionMetrics(): SessionMetrics {
    this.updatePerformanceMetrics();
    return { ...this.sessionMetrics };
  }

  public getCleanupHistory(): typeof this.cleanupHistory {
    return [...this.cleanupHistory];
  }

  public async forceCleanup(): Promise<void> {
    console.log('Forcing immediate cleanup...');
    await this.performScheduledCleanup();
  }

  public updateConfig(newConfig: Partial<CleanupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Cleanup service config updated:', newConfig);
    
    // Restart scheduler with new interval if changed
    if (newConfig.cleanupIntervalMs) {
      this.startCleanupScheduler();
    }
  }

  public scheduleDataExpiration(key: string, expirationMs: number): void {
    if (!this.config.enableDataExpiration) return;
    
    const timerKey = `${Date.now()}_${key}`;
    const timer = setTimeout(() => {
      this.dataExpirationTimers.delete(timerKey);
      window.dispatchEvent(new CustomEvent('data:expired', { detail: { key } }));
    }, expirationMs);
    
    this.dataExpirationTimers.set(timerKey, timer);
  }

  public destroy(): void {
    console.log('Destroying auto cleanup service...');
    
    // Clear intervals
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear data expiration timers
    for (const timer of this.dataExpirationTimers.values()) {
      clearTimeout(timer);
    }
    this.dataExpirationTimers.clear();
    
    // Remove activity listeners
    this.activityListeners.forEach(listener => {
      ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, listener);
      });
    });
    this.activityListeners.clear();
    
    // Perform final cleanup
    this.performFullCleanup();
  }
}

// Singleton instance
let autoCleanupService: AutoCleanupService | null = null;

export const getAutoCleanupService = (): AutoCleanupService => {
  if (!autoCleanupService) {
    autoCleanupService = new AutoCleanupService();
  }
  return autoCleanupService;
};

export const destroyAutoCleanupService = (): void => {
  if (autoCleanupService) {
    autoCleanupService.destroy();
    autoCleanupService = null;
  }
};

export { AutoCleanupService };
export type { CleanupConfig, SessionMetrics };