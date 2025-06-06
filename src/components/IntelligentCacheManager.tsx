import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';

interface CacheEntry {
  key: string;
  data: any;
  size: number;
  created: Date;
  lastAccessed: Date;
  accessCount: number;
  ttl: number;
  priority: number;
  compressed: boolean;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  compressionRatio: number;
  averageAccessTime: number;
  memoryEfficiency: number;
}

interface CacheConfig {
  maxSizeGB: number;
  defaultTTL: number;
  enableCompression: boolean;
  enableSmartEviction: boolean;
  compressionThreshold: number;
  maxEntries: number;
  enableAnalytics: boolean;
}

const IntelligentCacheManager: React.FC = () => {
  const { toast } = useToast();
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    compressionRatio: 0,
    averageAccessTime: 0,
    memoryEfficiency: 0
  });
  const [config, setConfig] = useState<CacheConfig>({
    maxSizeGB: 1,
    defaultTTL: 1800000, // 30 minutes
    enableCompression: true,
    enableSmartEviction: true,
    compressionThreshold: 1024, // 1KB
    maxEntries: 1000,
    enableAnalytics: true
  });
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cache implementation with LRU and intelligent features
  const cache = useRef(new Map<string, CacheEntry>());
  const accessStats = useRef(new Map<string, { hits: number; misses: number; lastAccessTime: number }>());
  const analyticsInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Simulate cache data for demo
  useEffect(() => {
    const generateMockCacheEntries = () => {
      const mockEntries: CacheEntry[] = [
        {
          key: 'products_table_11726',
          data: { records: 150, lastFetch: Date.now() },
          size: 245760, // ~240KB
          created: new Date(Date.now() - 600000), // 10 minutes ago
          lastAccessed: new Date(Date.now() - 60000), // 1 minute ago
          accessCount: 45,
          ttl: 1800000,
          priority: 8,
          compressed: true
        },
        {
          key: 'employees_table_11727',
          data: { records: 25, lastFetch: Date.now() },
          size: 89600, // ~87KB
          created: new Date(Date.now() - 300000), // 5 minutes ago
          lastAccessed: new Date(Date.now() - 30000), // 30 seconds ago
          accessCount: 23,
          ttl: 1800000,
          priority: 7,
          compressed: false
        },
        {
          key: 'sales_reports_table_12356',
          data: { records: 200, lastFetch: Date.now() },
          size: 512000, // ~500KB
          created: new Date(Date.now() - 900000), // 15 minutes ago
          lastAccessed: new Date(Date.now() - 120000), // 2 minutes ago
          accessCount: 67,
          ttl: 1800000,
          priority: 9,
          compressed: true
        },
        {
          key: 'audit_logs_table_12706',
          data: { records: 500, lastFetch: Date.now() },
          size: 1048576, // 1MB
          created: new Date(Date.now() - 1200000), // 20 minutes ago
          lastAccessed: new Date(Date.now() - 600000), // 10 minutes ago
          accessCount: 12,
          ttl: 1800000,
          priority: 3,
          compressed: true
        },
        {
          key: 'stations_table_12599',
          data: { records: 3, lastFetch: Date.now() },
          size: 15360, // ~15KB
          created: new Date(Date.now() - 180000), // 3 minutes ago
          lastAccessed: new Date(Date.now() - 45000), // 45 seconds ago
          accessCount: 18,
          ttl: 1800000,
          priority: 6,
          compressed: false
        }
      ];
      
      setCacheEntries(mockEntries);
      
      // Calculate stats
      const totalSize = mockEntries.reduce((sum, entry) => sum + entry.size, 0);
      const totalAccess = mockEntries.reduce((sum, entry) => sum + entry.accessCount, 0);
      const compressedSize = mockEntries
        .filter(entry => entry.compressed)
        .reduce((sum, entry) => sum + entry.size, 0);
      const uncompressedSize = mockEntries
        .filter(entry => !entry.compressed)
        .reduce((sum, entry) => sum + entry.size * 1.5, 0); // Estimate original size
      
      setCacheStats({
        totalEntries: mockEntries.length,
        totalSize,
        hitRate: 85.2,
        missRate: 14.8,
        evictionCount: 3,
        compressionRatio: compressedSize > 0 ? (compressedSize + uncompressedSize) / totalSize : 1,
        averageAccessTime: 12.5,
        memoryEfficiency: (totalAccess / mockEntries.length) * 10
      });
    };
    
    generateMockCacheEntries();
  }, []);

  // Format file size
  const formatSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  // Calculate cache efficiency
  const getCacheEfficiency = useCallback(() => {
    const efficiency = (cacheStats.hitRate / 100) * cacheStats.memoryEfficiency;
    if (efficiency > 80) return { status: 'excellent', color: 'text-green-600' };
    if (efficiency > 60) return { status: 'good', color: 'text-blue-600' };
    if (efficiency > 40) return { status: 'fair', color: 'text-yellow-600' };
    return { status: 'poor', color: 'text-red-600' };
  }, [cacheStats]);

  // Smart cache optimization
  const optimizeCache = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove expired entries
      const now = Date.now();
      const optimizedEntries = cacheEntries.filter(entry => {
        const age = now - entry.created.getTime();
        return age < entry.ttl;
      });
      
      // Apply compression to large uncompressed entries
      const compressedEntries = optimizedEntries.map(entry => {
        if (!entry.compressed && entry.size > config.compressionThreshold) {
          return {
            ...entry,
            compressed: true,
            size: Math.round(entry.size * 0.7) // Simulate 30% compression
          };
        }
        return entry;
      });
      
      // Sort by priority and access patterns for LRU optimization
      const sortedEntries = compressedEntries.sort((a, b) => {
        const scoreA = (a.priority * 0.4) + (a.accessCount * 0.3) + ((now - a.lastAccessed.getTime()) * -0.3);
        const scoreB = (b.priority * 0.4) + (b.accessCount * 0.3) + ((now - b.lastAccessed.getTime()) * -0.3);
        return scoreB - scoreA;
      });
      
      // Keep only top entries within limits
      const finalEntries = sortedEntries.slice(0, config.maxEntries);
      
      setCacheEntries(finalEntries);
      
      // Update stats
      const newTotalSize = finalEntries.reduce((sum, entry) => sum + entry.size, 0);
      setCacheStats(prev => ({
        ...prev,
        totalEntries: finalEntries.length,
        totalSize: newTotalSize,
        hitRate: Math.min(prev.hitRate + 5, 95), // Simulate improvement
        evictionCount: prev.evictionCount + (cacheEntries.length - finalEntries.length)
      }));
      
      toast({
        title: "Cache Optimization Complete",
        description: `Optimized ${cacheEntries.length - finalEntries.length} entries, saved ${formatSize((cacheStats.totalSize - newTotalSize))}`
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "Failed to optimize cache. Please try again."
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [cacheEntries, config, cacheStats.totalSize, formatSize, toast]);

  // Clear selected cache entries
  const clearSelectedEntries = useCallback(() => {
    if (selectedEntries.size === 0) return;
    
    const filteredEntries = cacheEntries.filter(entry => !selectedEntries.has(entry.key));
    const clearedSize = cacheEntries
      .filter(entry => selectedEntries.has(entry.key))
      .reduce((sum, entry) => sum + entry.size, 0);
    
    setCacheEntries(filteredEntries);
    setSelectedEntries(new Set());
    
    setCacheStats(prev => ({
      ...prev,
      totalEntries: filteredEntries.length,
      totalSize: prev.totalSize - clearedSize
    }));
    
    toast({
      title: "Cache Entries Cleared",
      description: `Removed ${selectedEntries.size} entries, freed ${formatSize(clearedSize)}`
    });
  }, [cacheEntries, selectedEntries, formatSize, toast]);

  // Toggle entry selection
  const toggleEntrySelection = useCallback((key: string) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  // Filter entries based on search
  const filteredEntries = cacheEntries.filter(entry =>
    entry.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const efficiency = getCacheEfficiency();

  return (
    <div className="space-y-6">
      {/* Cache Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(cacheStats.totalSize)}</div>
            <Progress 
              value={(cacheStats.totalSize / (config.maxSizeGB * 1024 * 1024 * 1024)) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {cacheStats.totalEntries} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.hitRate.toFixed(1)}%</div>
            <Progress value={cacheStats.hitRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {cacheStats.missRate.toFixed(1)}% miss rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compression</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.compressionRatio.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground mt-2">
              {cacheEntries.filter(e => e.compressed).length} compressed entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${efficiency.color}`}>
              {efficiency.status.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cacheStats.averageAccessTime.toFixed(1)}ms avg access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Intelligent Cache Management</CardTitle>
              <CardDescription>
                Advanced caching with compression, smart eviction, and performance analytics
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={optimizeCache} 
                disabled={isOptimizing}
                variant="default"
              >
                {isOptimizing ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isOptimizing ? 'Optimizing...' : 'Smart Optimize'}
              </Button>
              {selectedEntries.size > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={clearSelectedEntries}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Selected ({selectedEntries.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cache Management Tabs */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Cache Entries</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cache Entries ({filteredEntries.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search cache entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredEntries.map((entry) => {
                    const age = Date.now() - entry.created.getTime();
                    const isExpired = age > entry.ttl;
                    const isSelected = selectedEntries.has(entry.key);
                    
                    return (
                      <motion.div
                        key={entry.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 
                          isExpired ? 'bg-red-50 border-red-200' : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleEntrySelection(entry.key)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{entry.key}</span>
                              {entry.compressed && (
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Compressed
                                </Badge>
                              )}
                              {isExpired && (
                                <Badge variant="destructive" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Expired
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>Size: {formatSize(entry.size)}</span>
                              <span>Accessed: {entry.accessCount} times</span>
                              <span>Priority: {entry.priority}/10</span>
                              <span>Age: {Math.round(age / 60000)}m</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Last accessed: {entry.lastAccessed.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {filteredEntries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No matching cache entries found.' : 'No cache entries available.'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-mono">{cacheStats.hitRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={cacheStats.hitRate} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory Efficiency</span>
                    <span className="font-mono">{cacheStats.memoryEfficiency.toFixed(1)}/100</span>
                  </div>
                  <Progress value={cacheStats.memoryEfficiency} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Compression Ratio</span>
                    <span className="font-mono">{cacheStats.compressionRatio.toFixed(2)}x</span>
                  </div>
                  <Progress value={Math.min((cacheStats.compressionRatio - 1) * 100, 100)} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries:</span>
                    <span className="font-mono">{cacheStats.totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Size:</span>
                    <span className="font-mono">{formatSize(cacheStats.totalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Evictions:</span>
                    <span className="font-mono">{cacheStats.evictionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Access Time:</span>
                    <span className="font-mono">{cacheStats.averageAccessTime.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cache Efficiency:</span>
                    <span className={`font-mono ${efficiency.color}`}>{efficiency.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Configuration</CardTitle>
              <CardDescription>
                Adjust cache settings for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-size">Max Cache Size (GB)</Label>
                  <Input
                    id="max-size"
                    type="number"
                    value={config.maxSizeGB}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxSizeGB: parseFloat(e.target.value) || 1 }))}
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-entries">Max Entries</Label>
                  <Input
                    id="max-entries"
                    type="number"
                    value={config.maxEntries}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxEntries: parseInt(e.target.value) || 1000 }))}
                    min="100"
                    max="10000"
                    step="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-ttl">Default TTL (minutes)</Label>
                  <Input
                    id="default-ttl"
                    type="number"
                    value={config.defaultTTL / 60000}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultTTL: (parseInt(e.target.value) || 30) * 60000 }))}
                    min="5"
                    max="240"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="compression-threshold">Compression Threshold (KB)</Label>
                  <Input
                    id="compression-threshold"
                    type="number"
                    value={config.compressionThreshold / 1024}
                    onChange={(e) => setConfig(prev => ({ ...prev, compressionThreshold: (parseFloat(e.target.value) || 1) * 1024 }))}
                    min="0.1"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-compression"
                    checked={config.enableCompression}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableCompression: checked }))}
                  />
                  <Label htmlFor="enable-compression">Enable automatic compression</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smart-eviction"
                    checked={config.enableSmartEviction}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableSmartEviction: checked }))}
                  />
                  <Label htmlFor="smart-eviction">Enable smart LRU eviction</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-analytics"
                    checked={config.enableAnalytics}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableAnalytics: checked }))}
                  />
                  <Label htmlFor="enable-analytics">Enable performance analytics</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentCacheManager;