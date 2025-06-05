import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Database, Zap, Clock, TrendingUp, Trash2, RefreshCw, Activity, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  lastAccessed: Date;
  accessCount: number;
  ttl: number;
  size: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  prefetchHits: number;
  memoryUsage: number;
  averageAccessTime: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'priority';
  prefetchEnabled: boolean;
  compressionEnabled: boolean;
  persistToDisk: boolean;
  maxMemoryUsage: number;
}

const IntelligentCacheManager: React.FC = () => {
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    prefetchHits: 0,
    memoryUsage: 0,
    averageAccessTime: 0
  });
  const [config, setConfig] = useState<CacheConfig>({
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    evictionPolicy: 'lru',
    prefetchEnabled: true,
    compressionEnabled: true,
    persistToDisk: false,
    maxMemoryUsage: 100 // MB
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'accessed' | 'count' | 'size'>('accessed');
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Simulate cache operations
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        simulateCacheActivity();
        updateCacheStats();
        performMaintenance();
      }, 2000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMonitoring, config]);

  const simulateCacheActivity = useCallback(() => {
    // Simulate random cache access and updates
    if (Math.random() < 0.3) {
      addCacheEntry();
    }
    
    if (Math.random() < 0.5 && cacheEntries.length > 0) {
      accessRandomEntry();
    }

    if (Math.random() < 0.1) {
      prefetchData();
    }
  }, [cacheEntries]);

  const addCacheEntry = () => {
    const tables = ['products', 'employees', 'sales', 'orders', 'licenses'];
    const operations = ['list', 'detail', 'search', 'filter'];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    const entry: CacheEntry = {
      key: `${table}_${operation}_${Date.now()}`,
      data: generateMockData(table),
      timestamp: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      ttl: config.defaultTTL,
      size: Math.floor(Math.random() * 50000) + 1000, // 1KB to 50KB
      tags: [table, operation],
      priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      source: 'api'
    };

    setCacheEntries(prev => {
      const newEntries = [entry, ...prev];
      // Apply eviction policy if needed
      return applyEvictionPolicy(newEntries);
    });
  };

  const generateMockData = (table: string) => {
    const mockData = {
      products: { id: 1, name: 'Sample Product', price: 9.99, category: 'Electronics' },
      employees: { id: 1, name: 'John Doe', position: 'Manager', station: 'MOBIL' },
      sales: { id: 1, total: 150.00, date: new Date().toISOString() },
      orders: { id: 1, status: 'pending', amount: 75.50 },
      licenses: { id: 1, name: 'Business License', expiry: '2024-12-31' }
    };
    
    return mockData[table as keyof typeof mockData] || { id: 1, data: 'sample' };
  };

  const accessRandomEntry = () => {
    const randomIndex = Math.floor(Math.random() * cacheEntries.length);
    const entry = cacheEntries[randomIndex];
    
    setCacheEntries(prev => prev.map((e, index) => 
      index === randomIndex
        ? {
            ...e,
            lastAccessed: new Date(),
            accessCount: e.accessCount + 1
          }
        : e
    ));
  };

  const prefetchData = () => {
    if (!config.prefetchEnabled) return;

    // Simulate prefetching related data
    const relatedTables = ['vendors', 'categories', 'reports'];
    const table = relatedTables[Math.floor(Math.random() * relatedTables.length)];
    
    const prefetchEntry: CacheEntry = {
      key: `prefetch_${table}_${Date.now()}`,
      data: generateMockData(table),
      timestamp: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      ttl: config.defaultTTL * 0.5, // Shorter TTL for prefetched data
      size: Math.floor(Math.random() * 20000) + 500,
      tags: [table, 'prefetch'],
      priority: 'low',
      source: 'prefetch'
    };

    setCacheEntries(prev => [prefetchEntry, ...prev]);
  };

  const applyEvictionPolicy = (entries: CacheEntry[]): CacheEntry[] => {
    if (entries.length <= config.maxSize) return entries;

    let sortedEntries = [...entries];
    
    switch (config.evictionPolicy) {
      case 'lru':
        sortedEntries.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
        break;
      case 'lfu':
        sortedEntries.sort((a, b) => a.accessCount - b.accessCount);
        break;
      case 'ttl':
        sortedEntries.sort((a, b) => (a.timestamp.getTime() + a.ttl) - (b.timestamp.getTime() + b.ttl));
        break;
      case 'priority':
        const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        sortedEntries.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
    }

    const evicted = sortedEntries.slice(0, sortedEntries.length - config.maxSize);
    setCacheStats(prev => ({ ...prev, evictionCount: prev.evictionCount + evicted.length }));

    return sortedEntries.slice(sortedEntries.length - config.maxSize);
  };

  const performMaintenance = () => {
    const now = new Date();
    
    // Remove expired entries
    setCacheEntries(prev => {
      const validEntries = prev.filter(entry => {
        const isExpired = (now.getTime() - entry.timestamp.getTime()) > entry.ttl;
        return !isExpired;
      });
      
      const expiredCount = prev.length - validEntries.length;
      if (expiredCount > 0) {
        setCacheStats(prevStats => ({ 
          ...prevStats, 
          evictionCount: prevStats.evictionCount + expiredCount 
        }));
      }
      
      return validEntries;
    });
  };

  const updateCacheStats = () => {
    const totalSize = cacheEntries.reduce((sum, entry) => sum + entry.size, 0);
    const totalAccess = cacheEntries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const prefetchHits = cacheEntries.filter(e => e.source === 'prefetch' && e.accessCount > 0).length;
    
    setCacheStats(prev => ({
      ...prev,
      totalEntries: cacheEntries.length,
      totalSize,
      hitRate: Math.random() * 20 + 80, // Simulate 80-100% hit rate
      missRate: Math.random() * 20, // Simulate 0-20% miss rate
      prefetchHits,
      memoryUsage: (totalSize / 1024 / 1024), // Convert to MB
      averageAccessTime: Math.random() * 50 + 10 // 10-60ms
    }));
  };

  const clearCache = () => {
    setCacheEntries([]);
    setCacheStats(prev => ({ ...prev, evictionCount: prev.evictionCount + prev.totalEntries }));
    toast({
      title: "Cache Cleared",
      description: "All cache entries have been removed"
    });
  };

  const invalidateTag = (tag: string) => {
    const before = cacheEntries.length;
    setCacheEntries(prev => prev.filter(entry => !entry.tags.includes(tag)));
    const after = cacheEntries.filter(entry => !entry.tags.includes(tag)).length;
    
    toast({
      title: "Tag Invalidated",
      description: `Removed ${before - after} entries with tag "${tag}"`
    });
  };

  const refreshEntry = async (key: string) => {
    setCacheEntries(prev => prev.map(entry => 
      entry.key === key
        ? {
            ...entry,
            timestamp: new Date(),
            lastAccessed: new Date(),
            accessCount: entry.accessCount + 1
          }
        : entry
    ));
    
    toast({
      title: "Entry Refreshed",
      description: `Updated cache entry: ${key}`
    });
  };

  const getFilteredEntries = () => {
    let filtered = cacheEntries;
    
    if (filterTag) {
      filtered = filtered.filter(entry => 
        entry.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
      );
    }
    
    // Sort entries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'accessed':
          return b.lastAccessed.getTime() - a.lastAccessed.getTime();
        case 'count':
          return b.accessCount - a.accessCount;
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-500';
      case 'medium': return 'bg-blue-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Intelligent Cache Manager
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Monitoring" : "Paused"}
              </Badge>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
              >
                {isMonitoring ? "Pause" : "Start"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.totalEntries}</div>
              <div className="text-sm text-gray-600">Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatSize(cacheStats.totalSize)}</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{cacheStats.hitRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{cacheStats.missRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Miss Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{cacheStats.evictionCount}</div>
              <div className="text-sm text-gray-600">Evictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{cacheStats.prefetchHits}</div>
              <div className="text-sm text-gray-600">Prefetch Hits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{cacheStats.memoryUsage.toFixed(1)} MB</div>
              <div className="text-sm text-gray-600">Memory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{cacheStats.averageAccessTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">Avg Access</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Cache Entries ({cacheEntries.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Input
                placeholder="Filter by tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-48"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="accessed">Last Accessed</option>
                <option value="timestamp">Created</option>
                <option value="count">Access Count</option>
                <option value="size">Size</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearCache}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
              <Button size="sm" variant="outline" onClick={() => invalidateTag('products')}>
                Invalidate Products
              </Button>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              <AnimatePresence>
                {getFilteredEntries().map((entry, index) => (
                  <motion.div
                    key={entry.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="border-l-4" style={{ borderLeftColor: getPriorityColor(entry.priority).replace('bg-', '#') }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {entry.source === 'prefetch' && <Zap className="h-4 w-4 text-yellow-500" />}
                              {entry.source === 'api' && <Database className="h-4 w-4 text-blue-500" />}
                              <div>
                                <p className="font-medium text-sm">{entry.key}</p>
                                <p className="text-xs text-gray-600">
                                  {entry.source} • {formatSize(entry.size)} • {entry.accessCount} hits
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(entry.priority)} text-white`}>
                              {entry.priority}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => refreshEntry(entry.key)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="font-medium">Created:</p>
                            <p>{entry.timestamp.toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Last Accessed:</p>
                            <p>{entry.lastAccessed.toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">TTL Remaining:</p>
                            <p>{Math.max(0, Math.round((entry.ttl - (Date.now() - entry.timestamp.getTime())) / 1000))}s</p>
                          </div>
                          <div>
                            <p className="font-medium">Tags:</p>
                            <div className="flex gap-1 mt-1">
                              {entry.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>TTL Progress</span>
                            <span>{Math.round((Date.now() - entry.timestamp.getTime()) / entry.ttl * 100)}%</span>
                          </div>
                          <Progress 
                            value={(Date.now() - entry.timestamp.getTime()) / entry.ttl * 100}
                            className="h-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Hit Rate</span>
                      <span>{cacheStats.hitRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={cacheStats.hitRate} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Memory Usage</span>
                      <span>{cacheStats.memoryUsage.toFixed(1)} / {config.maxMemoryUsage} MB</span>
                    </div>
                    <Progress value={(cacheStats.memoryUsage / config.maxMemoryUsage) * 100} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Cache Utilization</span>
                      <span>{cacheStats.totalEntries} / {config.maxSize}</span>
                    </div>
                    <Progress value={(cacheStats.totalEntries / config.maxSize) * 100} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Access Time:</span>
                    <Badge variant="outline">{cacheStats.averageAccessTime.toFixed(0)}ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Prefetch Success:</span>
                    <Badge variant="outline">{cacheStats.prefetchHits} hits</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Evictions:</span>
                    <Badge variant="outline">{cacheStats.evictionCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Efficiency:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {((cacheStats.hitRate - cacheStats.missRate) / 100 * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Cache Size: {config.maxSize} entries</Label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={config.maxSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxSize: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default TTL: {Math.round(config.defaultTTL / 1000)}s</Label>
                  <input
                    type="range"
                    min="30"
                    max="3600"
                    step="30"
                    value={config.defaultTTL / 1000}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultTTL: Number(e.target.value) * 1000 }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Memory Usage: {config.maxMemoryUsage} MB</Label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={config.maxMemoryUsage}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxMemoryUsage: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Eviction Policy</Label>
                  <select
                    value={config.evictionPolicy}
                    onChange={(e) => setConfig(prev => ({ ...prev, evictionPolicy: e.target.value as any }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="lru">Least Recently Used (LRU)</option>
                    <option value="lfu">Least Frequently Used (LFU)</option>
                    <option value="ttl">Time To Live (TTL)</option>
                    <option value="priority">Priority Based</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Prefetching</Label>
                    <p className="text-xs text-gray-600">Automatically cache related data</p>
                  </div>
                  <Switch
                    checked={config.prefetchEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, prefetchEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Compression</Label>
                    <p className="text-xs text-gray-600">Compress cached data to save memory</p>
                  </div>
                  <Switch
                    checked={config.compressionEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, compressionEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Persist to Disk</Label>
                    <p className="text-xs text-gray-600">Save cache to local storage</p>
                  </div>
                  <Switch
                    checked={config.persistToDisk}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, persistToDisk: checked }))}
                  />
                </div>

                <Alert>
                  <HardDrive className="h-4 w-4" />
                  <AlertDescription>
                    Intelligent caching improves performance by storing frequently accessed data in memory.
                    Adjust settings based on your application's memory constraints and access patterns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentCacheManager;