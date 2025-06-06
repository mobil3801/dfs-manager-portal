import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Memory Management Configuration
interface MemoryConfig {
  maxCacheSize: number; // Maximum cache size in MB
  dataRetentionMinutes: number; // How long to keep data in memory
  pollInterval: number; // Polling interval in ms
  maxRecordsPerTable: number; // Maximum records to fetch per table
  enableProgressiveLoading: boolean;
  enableAutoCleanup: boolean;
  memoryThresholdMB: number; // Threshold to trigger cleanup
}

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  cacheSize: number;
  dataAge: number;
  lastCleanup: Date;
}

interface CacheEntry {
  data: any;
  timestamp: Date;
  size: number;
  accessCount: number;
  lastAccessed: Date;
}

interface RealTimeData {
  products: any[];
  employees: any[];
  salesReports: any[];
  vendors: any[];
  licenses: any[];
  orders: any[];
  salaryRecords: any[];
  deliveryRecords: any[];
  auditLogs: any[];
  stations: any[];
  smsAlertSettings: any[];
  userProfiles: any[];
  refreshData: () => void;
  isLoading: boolean;
  memoryStats: MemoryStats;
  clearCache: () => void;
  forceCleanup: () => void;
  updateMemoryConfig: (config: Partial<MemoryConfig>) => void;
}

const RealTimeDataContext = createContext<RealTimeData | undefined>(undefined);

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext);
  if (!context) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  return context;
};

interface RealTimeDataProviderProps {
  children: React.ReactNode;
}

// Default memory configuration optimized for production
const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxCacheSize: 50, // 50MB cache limit
  dataRetentionMinutes: 30, // Keep data for 30 minutes
  pollInterval: parseInt(import.meta.env.VITE_REALTIME_POLLING_INTERVAL) || 60000, // 1 minute default
  maxRecordsPerTable: parseInt(import.meta.env.VITE_MAX_RECORDS_PER_TABLE) || 100,
  enableProgressiveLoading: true,
  enableAutoCleanup: true,
  memoryThresholdMB: 100 // Trigger cleanup at 100MB
};

export const RealTimeDataProvider: React.FC<RealTimeDataProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [memoryConfig, setMemoryConfig] = useState<MemoryConfig>(DEFAULT_MEMORY_CONFIG);
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    cacheSize: 0,
    dataAge: 0,
    lastCleanup: new Date()
  });

  // Cache management with LRU implementation
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimestamp = useRef<Date>(new Date());
  const memoryMonitorRef = useRef<NodeJS.Timeout | null>(null);

  const [data, setData] = useState({
    products: [],
    employees: [],
    salesReports: [],
    vendors: [],
    licenses: [],
    orders: [],
    salaryRecords: [],
    deliveryRecords: [],
    auditLogs: [],
    stations: [],
    smsAlertSettings: [],
    userProfiles: []
  });

  // Get memory usage information
  const getMemoryUsage = useCallback((): MemoryStats => {
    const performance = window.performance as any;
    let memInfo = {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };

    if (performance?.memory) {
      memInfo = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }

    const cacheSize = Array.from(cacheRef.current.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    const dataAge = (Date.now() - lastFetchTimestamp.current.getTime()) / 1000 / 60; // minutes

    return {
      ...memInfo,
      cacheSize: cacheSize / (1024 * 1024), // Convert to MB
      dataAge,
      lastCleanup: memoryStats.lastCleanup
    };
  }, [memoryStats.lastCleanup]);

  // Calculate object size for cache management
  const calculateObjectSize = useCallback((obj: any): number => {
    const jsonStr = JSON.stringify(obj);
    return new Blob([jsonStr]).size;
  }, []);

  // LRU Cache implementation
  const addToCache = useCallback((key: string, data: any) => {
    const size = calculateObjectSize(data);
    const entry: CacheEntry = {
      data,
      timestamp: new Date(),
      size,
      accessCount: 1,
      lastAccessed: new Date()
    };

    // Check if adding this entry would exceed cache limit
    const currentCacheSize = Array.from(cacheRef.current.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    const maxCacheSizeBytes = memoryConfig.maxCacheSize * 1024 * 1024;
    
    if (currentCacheSize + size > maxCacheSizeBytes) {
      // Remove least recently used items
      const sortedEntries = Array.from(cacheRef.current.entries())
        .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
      
      let removedSize = 0;
      let removeCount = 0;
      
      while (removedSize < size && removeCount < sortedEntries.length / 2) {
        const [removeKey, removeEntry] = sortedEntries[removeCount];
        removedSize += removeEntry.size;
        cacheRef.current.delete(removeKey);
        removeCount++;
      }
      
      console.log(`Cache cleanup: Removed ${removeCount} entries (${removedSize / (1024 * 1024)}MB)`);
    }

    cacheRef.current.set(key, entry);
  }, [memoryConfig.maxCacheSize, calculateObjectSize]);

  // Get data from cache
  const getFromCache = useCallback((key: string): any | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    // Check if data is expired
    const ageMinutes = (Date.now() - entry.timestamp.getTime()) / 1000 / 60;
    if (ageMinutes > memoryConfig.dataRetentionMinutes) {
      cacheRef.current.delete(key);
      return null;
    }

    // Update access information
    entry.accessCount++;
    entry.lastAccessed = new Date();
    
    return entry.data;
  }, [memoryConfig.dataRetentionMinutes]);

  // Clear cache manually
  const clearCache = useCallback(() => {
    const entriesCleared = cacheRef.current.size;
    cacheRef.current.clear();
    setMemoryStats(prev => ({ ...prev, lastCleanup: new Date() }));
    console.log(`Manual cache clear: Removed ${entriesCleared} entries`);
    
    toast({
      title: "Cache Cleared",
      description: `Cleared ${entriesCleared} cached entries to free memory.`
    });
  }, [toast]);

  // Force garbage collection and cleanup
  const forceCleanup = useCallback(() => {
    clearCache();
    
    // Clear old data from state
    setData({
      products: [],
      employees: [],
      salesReports: [],
      vendors: [],
      licenses: [],
      orders: [],
      salaryRecords: [],
      deliveryRecords: [],
      auditLogs: [],
      stations: [],
      smsAlertSettings: [],
      userProfiles: []
    });

    // Trigger garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    setMemoryStats(prev => ({ ...prev, lastCleanup: new Date() }));
    
    toast({
      title: "Memory Cleanup Complete",
      description: "Forced memory cleanup and garbage collection completed."
    });
  }, [clearCache, toast]);

  // Auto cleanup based on memory threshold
  const autoCleanup = useCallback(() => {
    if (!memoryConfig.enableAutoCleanup) return;

    const stats = getMemoryUsage();
    const usedMemoryMB = stats.usedJSHeapSize / (1024 * 1024);
    
    if (usedMemoryMB > memoryConfig.memoryThresholdMB) {
      console.warn(`Memory threshold exceeded: ${usedMemoryMB.toFixed(2)}MB > ${memoryConfig.memoryThresholdMB}MB`);
      
      // Remove expired cache entries
      const now = Date.now();
      const retentionMs = memoryConfig.dataRetentionMinutes * 60 * 1000;
      let removedCount = 0;
      
      for (const [key, entry] of cacheRef.current.entries()) {
        if (now - entry.timestamp.getTime() > retentionMs) {
          cacheRef.current.delete(key);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`Auto cleanup: Removed ${removedCount} expired cache entries`);
        setMemoryStats(prev => ({ ...prev, lastCleanup: new Date() }));
      }
      
      // If still over threshold, remove LRU entries
      if (usedMemoryMB > memoryConfig.memoryThresholdMB * 0.9) {
        const sortedEntries = Array.from(cacheRef.current.entries())
          .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
        
        const removeCount = Math.min(10, sortedEntries.length / 4); // Remove up to 25% of cache
        for (let i = 0; i < removeCount; i++) {
          const [key] = sortedEntries[i];
          cacheRef.current.delete(key);
        }
        
        if (removeCount > 0) {
          console.log(`Auto cleanup: Removed ${removeCount} LRU cache entries`);
        }
      }
    }
  }, [memoryConfig, getMemoryUsage]);

  // Progressive data loading for large datasets
  const fetchTableDataProgressive = async (tableId: string, tableName: string) => {
    const cacheKey = `table_${tableId}_${tableName}`;
    
    // Check cache first
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      let allData = [];
      let pageNo = 1;
      const pageSize = memoryConfig.enableProgressiveLoading ? 50 : memoryConfig.maxRecordsPerTable;
      let hasMore = true;

      while (hasMore && allData.length < memoryConfig.maxRecordsPerTable) {
        const { data: response, error } = await window.ezsite.apis.tablePage(tableId, {
          PageNo: pageNo,
          PageSize: pageSize,
          OrderByField: 'id',
          IsAsc: false,
          Filters: []
        });

        if (error) {
          console.error(`Error fetching data from table ${tableName} (${tableId}):`, error);
          break;
        }

        const pageData = response?.List || [];
        allData = [...allData, ...pageData];
        
        hasMore = pageData.length === pageSize && allData.length < memoryConfig.maxRecordsPerTable;
        pageNo++;

        // For progressive loading, yield control to prevent blocking
        if (memoryConfig.enableProgressiveLoading && pageNo % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Add to cache
      addToCache(cacheKey, allData);
      return allData;
      
    } catch (error) {
      console.error(`Error fetching data from table ${tableName} (${tableId}):`, error);
      return [];
    }
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Table configurations with names for better logging
      const tableConfigs = [
        { id: '11726', name: 'products' },
        { id: '11727', name: 'employees' },
        { id: '12356', name: 'sales_reports' },
        { id: '11729', name: 'vendors' },
        { id: '11731', name: 'licenses' },
        { id: '11730', name: 'orders' },
        { id: '11788', name: 'salary_records' },
        { id: '12196', name: 'delivery_records' },
        { id: '12706', name: 'audit_logs' },
        { id: '12599', name: 'stations' },
        { id: '12611', name: 'sms_alert_settings' },
        { id: '11725', name: 'user_profiles' }
      ];

      // Fetch data with progressive loading and memory management
      const dataPromises = tableConfigs.map(({ id, name }) => 
        fetchTableDataProgressive(id, name)
      );

      const results = await Promise.all(dataPromises);
      
      const [products, employees, salesReports, vendors, licenses, orders,
             salaryRecords, deliveryRecords, auditLogs, stations,
             smsAlertSettings, userProfiles] = results;

      setData({
        products,
        employees,
        salesReports,
        vendors,
        licenses,
        orders,
        salaryRecords,
        deliveryRecords,
        auditLogs,
        stations,
        smsAlertSettings,
        userProfiles
      });

      lastFetchTimestamp.current = new Date();
      
      // Update memory stats
      setMemoryStats(getMemoryUsage());
      
      // Trigger auto cleanup if needed
      autoCleanup();

    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        variant: "destructive",
        title: "Data Refresh Error",
        description: "Failed to refresh real-time data. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  }, [getMemoryUsage, autoCleanup, addToCache, getFromCache, memoryConfig, toast]);

  // Update memory configuration
  const updateMemoryConfig = useCallback((config: Partial<MemoryConfig>) => {
    setMemoryConfig(prev => ({ ...prev, ...config }));
    console.log('Memory configuration updated:', config);
  }, []);

  // Setup memory monitoring
  useEffect(() => {
    if (memoryMonitorRef.current) {
      clearInterval(memoryMonitorRef.current);
    }
    
    memoryMonitorRef.current = setInterval(() => {
      setMemoryStats(getMemoryUsage());
    }, 10000); // Update every 10 seconds

    return () => {
      if (memoryMonitorRef.current) {
        clearInterval(memoryMonitorRef.current);
      }
    };
  }, [getMemoryUsage]);

  // Setup auto cleanup interval
  useEffect(() => {
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
    }
    
    if (memoryConfig.enableAutoCleanup) {
      cleanupIntervalRef.current = setInterval(() => {
        autoCleanup();
      }, 60000); // Check every minute
    }

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [autoCleanup, memoryConfig.enableAutoCleanup]);

  // Setup polling with optimized intervals
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Initial data load
    refreshData();
    
    // Setup polling
    pollingIntervalRef.current = setInterval(() => {
      refreshData();
    }, memoryConfig.pollInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [refreshData, memoryConfig.pollInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
      if (memoryMonitorRef.current) clearInterval(memoryMonitorRef.current);
      clearCache();
    };
  }, [clearCache]);

  const value: RealTimeData = {
    ...data,
    refreshData,
    isLoading,
    memoryStats,
    clearCache,
    forceCleanup,
    updateMemoryConfig
  };

  return (
    <RealTimeDataContext.Provider value={value}>
      {children}
    </RealTimeDataContext.Provider>
  );
};

export default RealTimeDataProvider;