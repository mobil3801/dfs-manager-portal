/**
 * Memory Leak Detection Integration
 * Provides memory monitoring and leak detection functionality
 */

interface MemoryInfo {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

interface MemoryMeasurement {
  timestamp: number;
  memoryInfo: MemoryInfo;
  componentCount?: number;
}

class MemoryLeakDetector {
  private measurements: MemoryMeasurement[] = [];
  private intervalId: number | null = null;
  private isInitialized = false;
  private maxMeasurements = 100; // Keep last 100 measurements

  constructor() {
    // Bind methods to preserve context
    this.measureMemory = this.measureMemory.bind(this);
    this.startMonitoring = this.startMonitoring.bind(this);
    this.stopMonitoring = this.stopMonitoring.bind(this);
  }

  /**
   * Get current memory information
   */
  private getMemoryInfo(): MemoryInfo {
    try {
      if (typeof window !== 'undefined' && window.performance && (window.performance as any).memory) {
        const memory = (window.performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
    } catch (error) {
      console.warn('Failed to get memory info:', error);
    }

    return {};
  }

  /**
   * Measure current memory usage
   */
  private measureMemory(): void {
    try {
      const memoryInfo = this.getMemoryInfo();
      const measurement: MemoryMeasurement = {
        timestamp: Date.now(),
        memoryInfo,
        componentCount: this.getComponentCount()
      };

      this.measurements.push(measurement);

      // Keep only the last N measurements
      if (this.measurements.length > this.maxMeasurements) {
        this.measurements = this.measurements.slice(-this.maxMeasurements);
      }

      // Check for potential memory leaks
      this.checkForMemoryLeaks();
    } catch (error) {
      console.warn('Memory measurement failed:', error);
    }
  }

  /**
   * Get approximate component count (rough estimate)
   */
  private getComponentCount(): number {
    try {
      // This is a rough estimate - count DOM elements as a proxy for components
      return document.querySelectorAll('*').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check for potential memory leaks
   */
  private checkForMemoryLeaks(): void {
    if (this.measurements.length < 10) return;

    try {
      const recent = this.measurements.slice(-10);
      const hasMemoryData = recent.some((m) => m.memoryInfo.usedJSHeapSize);

      if (!hasMemoryData) return;

      const memoryValues = recent.
      map((m) => m.memoryInfo.usedJSHeapSize || 0).
      filter((v) => v > 0);

      if (memoryValues.length < 5) return;

      const firstValue = memoryValues[0];
      const lastValue = memoryValues[memoryValues.length - 1];

      // Check if memory usage has increased significantly
      const percentageIncrease = (lastValue - firstValue) / firstValue * 100;

      if (percentageIncrease > 50) {
        console.warn('Potential memory leak detected:', {
          initialMemory: firstValue,
          currentMemory: lastValue,
          percentageIncrease: percentageIncrease.toFixed(2) + '%'
        });
      }
    } catch (error) {
      console.warn('Memory leak check failed:', error);
    }
  }

  /**
   * Start memory monitoring
   */
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.intervalId) {
      this.stopMonitoring();
    }

    try {
      this.intervalId = window.setInterval(this.measureMemory, intervalMs);
      this.isInitialized = true;
      console.log('Memory monitoring started');
    } catch (error) {
      console.warn('Failed to start memory monitoring:', error);
    }
  }

  /**
   * Stop memory monitoring
   */
  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Memory monitoring stopped');
    }
  }

  /**
   * Get memory statistics
   */
  public getMemoryStats(): {current: MemoryInfo;history: MemoryMeasurement[];} {
    return {
      current: this.getMemoryInfo(),
      history: [...this.measurements]
    };
  }

  /**
   * Clear memory measurements
   */
  public clearMeasurements(): void {
    this.measurements = [];
  }

  /**
   * Check if monitoring is active
   */
  public isMonitoring(): boolean {
    return this.intervalId !== null;
  }
}

// Create singleton instance
const memoryLeakDetector = new MemoryLeakDetector();

/**
 * Initialize memory leak detection
 */
export function initializeMemoryLeakDetection(): void {
  try {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log('Memory leak detection skipped - not in browser environment');
      return;
    }

    // Check if Performance API is available
    if (!window.performance) {
      console.log('Memory leak detection skipped - Performance API not available');
      return;
    }

    // Start monitoring with 30 second intervals
    memoryLeakDetector.startMonitoring(30000);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      memoryLeakDetector.stopMonitoring();
    });

    console.log('Memory leak detection initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize memory leak detection:', error);
  }
}

/**
 * Get memory leak detector instance
 */
export function getMemoryLeakDetector(): MemoryLeakDetector {
  return memoryLeakDetector;
}

/**
 * Manual memory check
 */
export function checkMemoryUsage(): MemoryInfo {
  try {
    return memoryLeakDetector.getMemoryStats().current;
  } catch (error) {
    console.warn('Failed to check memory usage:', error);
    return {};
  }
}

/**
 * Force garbage collection (if available)
 */
export function forceGarbageCollection(): void {
  try {
    // This only works in Chrome with --enable-precise-memory-info flag
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      console.log('Forced garbage collection');
    } else {
      console.log('Garbage collection not available');
    }
  } catch (error) {
    console.warn('Failed to force garbage collection:', error);
  }
}

export default memoryLeakDetector;