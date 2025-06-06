import { useEffect, useCallback, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAutoCleanupService } from '@/services/autoCleanupService';

interface MemoryOptimizationConfig {
  enableAutoCleanup: boolean;
  memoryThreshold: number;
  cleanupInterval: number;
  trackComponentMemory: boolean;
  enablePerformanceAlerts: boolean;
}

interface ComponentMemoryStats {
  componentName: string;
  mountTime: Date;
  renderCount: number;
  memoryUsage: number;
  lastUpdate: Date;
}

export const useMemoryOptimization = (
  componentName: string,
  config: Partial<MemoryOptimizationConfig> = {}
) => {
  const { toast } = useToast();
  const cleanupService = getAutoCleanupService();
  const [memoryStats, setMemoryStats] = useState<ComponentMemoryStats>({
    componentName,
    mountTime: new Date(),
    renderCount: 0,
    memoryUsage: 0,
    lastUpdate: new Date()
  });
  
  const renderCountRef = useRef(0);
  const memoryCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastMemoryWarning = useRef<number>(0);
  
  const defaultConfig: MemoryOptimizationConfig = {
    enableAutoCleanup: true,
    memoryThreshold: 100, // MB
    cleanupInterval: 30000, // 30 seconds
    trackComponentMemory: true,
    enablePerformanceAlerts: true,
    ...config
  };

  // Track component renders
  useEffect(() => {
    renderCountRef.current++;
    setMemoryStats(prev => ({
      ...prev,
      renderCount: renderCountRef.current,
      lastUpdate: new Date()
    }));
  });

  // Get current memory usage
  const getCurrentMemoryUsage = useCallback((): number => {
    const performance = window.performance as any;
    if (performance?.memory) {
      return performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }, []);

  // Check memory usage and trigger alerts if needed
  const checkMemoryUsage = useCallback(() => {
    const currentMemory = getCurrentMemoryUsage();
    setMemoryStats(prev => ({ ...prev, memoryUsage: currentMemory }));
    
    if (defaultConfig.enablePerformanceAlerts && currentMemory > defaultConfig.memoryThreshold) {
      const now = Date.now();
      // Only show warning once every 2 minutes
      if (now - lastMemoryWarning.current > 120000) {
        lastMemoryWarning.current = now;
        toast({
          variant: "destructive",
          title: "High Memory Usage Warning",
          description: `Component ${componentName} is using ${currentMemory.toFixed(1)}MB of memory. Consider optimizing data usage.`
        });
      }
    }
  }, [componentName, defaultConfig.enablePerformanceAlerts, defaultConfig.memoryThreshold, getCurrentMemoryUsage, toast]);

  // Force component cleanup
  const forceCleanup = useCallback(async () => {
    try {
      // Clear component-specific data
      window.dispatchEvent(new CustomEvent('cleanup:component', { 
        detail: { componentName } 
      }));
      
      // Trigger global cleanup
      await cleanupService.forceCleanup();
      
      toast({
        title: "Component Cleanup Complete",
        description: `Memory cleanup completed for ${componentName}`
      });
    } catch (error) {
      console.error(`Failed to cleanup component ${componentName}:`, error);
    }
  }, [componentName, cleanupService, toast]);

  // Optimize data loading with chunking
  const optimizedDataLoader = useCallback(async (
    dataLoader: () => Promise<any[]>,
    chunkSize: number = 50
  ) => {
    try {
      const data = await dataLoader();
      
      // Process data in chunks to prevent memory spikes
      const chunks = [];
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      
      // Process chunks with delays to allow garbage collection
      const results = [];
      for (const chunk of chunks) {
        results.push(...chunk);
        
        // Yield control to the browser
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      return results;
    } catch (error) {
      console.error(`Optimized data loader failed for ${componentName}:`, error);
      throw error;
    }
  }, [componentName]);

  // Memory-aware state updater
  const memoryAwareSetState = useCallback(<T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    newValue: T | ((prev: T) => T)
  ) => {
    const currentMemory = getCurrentMemoryUsage();
    
    if (currentMemory > defaultConfig.memoryThreshold * 0.8) {
      console.warn(`High memory usage (${currentMemory.toFixed(1)}MB) when updating state in ${componentName}`);
      
      // Delay state update to allow cleanup
      setTimeout(() => setter(newValue), 100);
    } else {
      setter(newValue);
    }
  }, [componentName, defaultConfig.memoryThreshold, getCurrentMemoryUsage]);

  // Setup memory monitoring
  useEffect(() => {
    if (!defaultConfig.trackComponentMemory) return;
    
    // Initial memory check
    checkMemoryUsage();
    
    // Setup periodic memory checks
    memoryCheckInterval.current = setInterval(
      checkMemoryUsage,
      defaultConfig.cleanupInterval
    );
    
    return () => {
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
      }
    };
  }, [checkMemoryUsage, defaultConfig.trackComponentMemory, defaultConfig.cleanupInterval]);

  // Component-specific cleanup listeners
  useEffect(() => {
    const handleComponentCleanup = (event: CustomEvent) => {
      if (event.detail?.componentName === componentName) {
        console.log(`Received cleanup signal for component: ${componentName}`);
        // Implement component-specific cleanup here
      }
    };
    
    const handleLargeObjectCleanup = () => {
      console.log(`Clearing large objects for component: ${componentName}`);
      // Clear large objects specific to this component
    };
    
    const handleUnusedDataCleanup = () => {
      console.log(`Clearing unused data for component: ${componentName}`);
      // Clear unused data specific to this component
    };
    
    window.addEventListener('cleanup:component', handleComponentCleanup as EventListener);
    window.addEventListener('cleanup:large-objects', handleLargeObjectCleanup);
    window.addEventListener('cleanup:unused-data', handleUnusedDataCleanup);
    
    return () => {
      window.removeEventListener('cleanup:component', handleComponentCleanup as EventListener);
      window.removeEventListener('cleanup:large-objects', handleLargeObjectCleanup);
      window.removeEventListener('cleanup:unused-data', handleUnusedDataCleanup);
    };
  }, [componentName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
      }
      
      // Schedule data expiration for component data
      cleanupService.scheduleDataExpiration(componentName, 5 * 60 * 1000); // 5 minutes
    };
  }, [componentName, cleanupService]);

  return {
    memoryStats,
    forceCleanup,
    optimizedDataLoader,
    memoryAwareSetState,
    getCurrentMemoryUsage,
    checkMemoryUsage
  };
};

export default useMemoryOptimization;