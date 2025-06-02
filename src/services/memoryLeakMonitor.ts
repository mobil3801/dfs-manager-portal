interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface LeakReport {
  componentName: string;
  leakType: string;
  metadata: any;
  timestamp: number;
  memoryStats?: MemoryStats;
}

interface ComponentTracker {
  name: string;
  mountTime: number;
  unmountTime?: number;
  leakReports: LeakReport[];
  memoryUsageOnMount: MemoryStats | null;
  memoryUsageOnUnmount: MemoryStats | null;
}

export class MemoryLeakMonitor {
  private static instance: MemoryLeakMonitor;
  private components: Map<string, ComponentTracker> = new Map();
  private memoryCheckInterval: NodeJS.Timeout | null = null;
  private maxMemoryGrowth = 50 * 1024 * 1024; // 50MB
  private memoryCheckFrequency = 30000; // 30 seconds
  private isMonitoring = false;
  private baselineMemory: MemoryStats | null = null;
  private memoryHistory: {timestamp: number;memory: MemoryStats;}[] = [];
  private maxHistorySize = 100;

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): MemoryLeakMonitor {
    if (!MemoryLeakMonitor.instance) {
      MemoryLeakMonitor.instance = new MemoryLeakMonitor();
    }
    return MemoryLeakMonitor.instance;
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      console.warn('Memory monitoring not available in this environment');
      return;
    }

    this.baselineMemory = this.getCurrentMemoryStats();
    this.startMonitoring();
  }

  private getCurrentMemoryStats(): MemoryStats | null {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      return null;
    }

    const memory = (window.performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.memoryCheckFrequency);

    // Monitor for page unload to cleanup
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stopMonitoring();
      });
    }
  }

  private stopMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    this.isMonitoring = false;
  }

  private checkMemoryUsage(): void {
    const currentMemory = this.getCurrentMemoryStats();
    if (!currentMemory || !this.baselineMemory) return;

    // Add to history
    this.memoryHistory.push({
      timestamp: Date.now(),
      memory: currentMemory
    });

    // Keep history size manageable
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // Check for memory growth
    const memoryGrowth = currentMemory.usedJSHeapSize - this.baselineMemory.usedJSHeapSize;

    if (memoryGrowth > this.maxMemoryGrowth) {
      this.reportGlobalMemoryLeak(currentMemory, memoryGrowth);
    }

    // Check for memory pressure
    const memoryPressure = currentMemory.usedJSHeapSize / currentMemory.jsHeapSizeLimit;
    if (memoryPressure > 0.8) {
      console.warn(`High memory pressure detected: ${(memoryPressure * 100).toFixed(1)}%`);
      this.sugggestGarbageCollection();
    }
  }

  private reportGlobalMemoryLeak(currentMemory: MemoryStats, growth: number): void {
    console.warn(`Potential memory leak detected! Memory grew by ${(growth / 1024 / 1024).toFixed(2)}MB`);

    // Report components that might be leaking
    const suspiciousComponents = Array.from(this.components.entries()).
    filter(([_, tracker]) => tracker.leakReports.length > 0).
    map(([name, tracker]) => ({
      name,
      leakCount: tracker.leakReports.length,
      lastLeakTime: Math.max(...tracker.leakReports.map((r) => r.timestamp))
    })).
    sort((a, b) => b.leakCount - a.leakCount);

    if (suspiciousComponents.length > 0) {
      console.group('🔍 Suspicious Components:');
      suspiciousComponents.forEach((comp) => {
        console.log(`${comp.name}: ${comp.leakCount} potential leaks`);
      });
      console.groupEnd();
    }
  }

  private sugggestGarbageCollection(): void {
    if (typeof window !== 'undefined' && (window as any).gc) {
      console.log('Triggering garbage collection...');
      (window as any).gc();
    } else {
      console.log('Consider triggering garbage collection manually in DevTools');
    }
  }

  trackComponent(componentName: string): void {
    const memoryStats = this.getCurrentMemoryStats();

    if (this.components.has(componentName)) {
      // Component remounting
      const existing = this.components.get(componentName)!;
      existing.mountTime = Date.now();
      existing.unmountTime = undefined;
      existing.memoryUsageOnMount = memoryStats;
    } else {
      this.components.set(componentName, {
        name: componentName,
        mountTime: Date.now(),
        leakReports: [],
        memoryUsageOnMount: memoryStats,
        memoryUsageOnUnmount: null
      });
    }

    console.log(`📊 Tracking component: ${componentName}`, {
      totalTracked: this.components.size,
      memoryOnMount: memoryStats ? `${(memoryStats.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    });
  }

  untrackComponent(componentName: string): void {
    const tracker = this.components.get(componentName);
    if (!tracker) return;

    const memoryStats = this.getCurrentMemoryStats();
    tracker.unmountTime = Date.now();
    tracker.memoryUsageOnUnmount = memoryStats;

    const lifecycleTime = tracker.unmountTime - tracker.mountTime;

    // Check for memory growth during component lifecycle
    if (tracker.memoryUsageOnMount && memoryStats) {
      const memoryDelta = memoryStats.usedJSHeapSize - tracker.memoryUsageOnMount.usedJSHeapSize;

      if (memoryDelta > 5 * 1024 * 1024) {// 5MB threshold
        console.warn(`Component ${componentName} may have caused memory growth: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
      }
    }

    console.log(`📉 Component unmounted: ${componentName}`, {
      lifecycleTime: `${lifecycleTime}ms`,
      leakReports: tracker.leakReports.length,
      memoryOnUnmount: memoryStats ? `${(memoryStats.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    });
  }

  reportPotentialLeak(componentName: string, leakType: string, metadata: any): void {
    const tracker = this.components.get(componentName);
    if (!tracker) {
      console.warn(`Cannot report leak for untracked component: ${componentName}`);
      return;
    }

    const leakReport: LeakReport = {
      componentName,
      leakType,
      metadata,
      timestamp: Date.now(),
      memoryStats: this.getCurrentMemoryStats()
    };

    tracker.leakReports.push(leakReport);

    console.warn(`🚨 Potential memory leak detected in ${componentName}:`, {
      type: leakType,
      details: metadata,
      totalLeaksForComponent: tracker.leakReports.length
    });

    // Suggest fixes based on leak type
    this.suggestFix(leakType, componentName);
  }

  private suggestFix(leakType: string, componentName: string): void {
    const suggestions: Record<string, string> = {
      setState_after_unmount: 'Use a ref to track mount status or cleanup async operations in useEffect cleanup',
      large_closure: 'Consider breaking down large objects or using useMemo/useCallback to optimize closures',
      uncleared_timer: 'Make sure to clear timers in useEffect cleanup function',
      unremoved_listener: 'Remove event listeners in useEffect cleanup function',
      uncancelled_subscription: 'Cancel subscriptions and async operations in useEffect cleanup',
      memory_leak_detected: 'Check for circular references and ensure proper cleanup of resources'
    };

    const suggestion = suggestions[leakType];
    if (suggestion) {
      console.log(`💡 Suggestion for ${componentName}: ${suggestion}`);
    }
  }

  getComponentStats(componentName?: string): ComponentTracker[] | ComponentTracker | null {
    if (componentName) {
      return this.components.get(componentName) || null;
    }
    return Array.from(this.components.values());
  }

  getMemoryHistory(): {timestamp: number;memory: MemoryStats;}[] {
    return [...this.memoryHistory];
  }

  getCurrentMemoryInfo(): {
    current: MemoryStats | null;
    baseline: MemoryStats | null;
    growth: number;
    pressure: number;
    componentsTracked: number;
    totalLeakReports: number;
  } {
    const current = this.getCurrentMemoryStats();
    const growth = current && this.baselineMemory ?
    current.usedJSHeapSize - this.baselineMemory.usedJSHeapSize :
    0;
    const pressure = current ? current.usedJSHeapSize / current.jsHeapSizeLimit : 0;
    const totalLeakReports = Array.from(this.components.values()).
    reduce((total, tracker) => total + tracker.leakReports.length, 0);

    return {
      current,
      baseline: this.baselineMemory,
      growth,
      pressure,
      componentsTracked: this.components.size,
      totalLeakReports
    };
  }

  // Force garbage collection if available (Chrome DevTools)
  forceGarbageCollection(): boolean {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      console.log('Garbage collection triggered');
      return true;
    }
    console.warn('Garbage collection not available. Enable in Chrome: --js-flags="--expose-gc"');
    return false;
  }

  // Reset monitoring baseline
  resetBaseline(): void {
    this.baselineMemory = this.getCurrentMemoryStats();
    this.memoryHistory = [];
    console.log('Memory baseline reset');
  }

  // Generate memory report
  generateReport(): string {
    const info = this.getCurrentMemoryInfo();
    const suspiciousComponents = Array.from(this.components.values()).
    filter((tracker) => tracker.leakReports.length > 0).
    sort((a, b) => b.leakReports.length - a.leakReports.length);

    const report = `
Memory Leak Detection Report
Generated: ${new Date().toISOString()}

=== Memory Stats ===
Current Usage: ${info.current ? (info.current.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A'}MB
Baseline Usage: ${info.baseline ? (info.baseline.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A'}MB
Memory Growth: ${(info.growth / 1024 / 1024).toFixed(2)}MB
Memory Pressure: ${(info.pressure * 100).toFixed(1)}%
Heap Size Limit: ${info.current ? (info.current.jsHeapSizeLimit / 1024 / 1024).toFixed(2) : 'N/A'}MB

=== Component Tracking ===
Components Tracked: ${info.componentsTracked}
Total Leak Reports: ${info.totalLeakReports}

=== Suspicious Components ===
${suspiciousComponents.length === 0 ? 'No suspicious components detected' :
    suspiciousComponents.map((comp) =>
    `${comp.name}: ${comp.leakReports.length} leak reports`
    ).join('\n')}

=== Memory History (Last 10 entries) ===
${this.memoryHistory.slice(-10).map((entry) =>
    `${new Date(entry.timestamp).toISOString()}: ${(entry.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
    ).join('\n')}
    `;

    return report.trim();
  }
}

export default MemoryLeakMonitor;