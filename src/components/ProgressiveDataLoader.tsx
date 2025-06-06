import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Database, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProgressiveDataLoaderProps {
  tableId: string;
  tableName: string;
  onDataLoaded?: (data: any[]) => void;
  maxRecords?: number;
  batchSize?: number;
  enableVirtualization?: boolean;
  className?: string;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentBatch: number;
  totalBatches: number;
  loadedRecords: number;
  totalRecords: number;
  error?: string;
}

const ProgressiveDataLoader: React.FC<ProgressiveDataLoaderProps> = ({
  tableId,
  tableName,
  onDataLoaded,
  maxRecords = 1000,
  batchSize = 50,
  enableVirtualization = true,
  className
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    loadedRecords: 0,
    totalRecords: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(20);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Progressive loading implementation
  const loadDataProgressively = useCallback(async () => {
    // Cancel any existing loading operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoadingState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      currentBatch: 0,
      loadedRecords: 0,
      error: undefined
    }));

    try {
      // First, get total count
      const { data: countResponse, error: countError } = await window.ezsite.apis.tablePage(tableId, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (signal.aborted) return;
      if (countError) throw new Error(countError);

      const totalRecords = Math.min(countResponse?.VirtualCount || 0, maxRecords);
      const totalBatches = Math.ceil(totalRecords / batchSize);

      setLoadingState(prev => ({
        ...prev,
        totalRecords,
        totalBatches
      }));

      let allData: any[] = [];
      let pageNo = 1;
      let hasMore = true;

      while (hasMore && allData.length < maxRecords && !signal.aborted) {
        try {
          const { data: response, error } = await window.ezsite.apis.tablePage(tableId, {
            PageNo: pageNo,
            PageSize: batchSize,
            OrderByField: 'id',
            IsAsc: false,
            Filters: []
          });

          if (signal.aborted) return;
          if (error) throw new Error(error);

          const batchData = response?.List || [];
          allData = [...allData, ...batchData];
          
          const progress = Math.min((allData.length / totalRecords) * 100, 100);
          
          setLoadingState(prev => ({
            ...prev,
            currentBatch: pageNo,
            loadedRecords: allData.length,
            progress
          }));

          // Update data incrementally for better UX
          setData([...allData]);
          
          hasMore = batchData.length === batchSize && allData.length < maxRecords;
          pageNo++;

          // Yield control to prevent blocking the UI
          await new Promise(resolve => {
            loadingTimeoutRef.current = setTimeout(resolve, 10);
          });
          
        } catch (batchError) {
          console.error(`Error loading batch ${pageNo}:`, batchError);
          // Continue with next batch on error
          pageNo++;
        }
      }

      if (!signal.aborted) {
        setData(allData);
        onDataLoaded?.(allData);
        
        toast({
          title: "Data Loaded Successfully",
          description: `Loaded ${allData.length} records from ${tableName} in ${totalBatches} batches.`
        });
      }

    } catch (error) {
      if (!signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setLoadingState(prev => ({
          ...prev,
          error: errorMessage
        }));
        
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: `Failed to load data from ${tableName}: ${errorMessage}`
        });
      }
    } finally {
      if (!signal.aborted) {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    }
  }, [tableId, tableName, maxRecords, batchSize, onDataLoaded, toast]);

  // Cancel loading operation
  const cancelLoading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    setLoadingState(prev => ({
      ...prev,
      isLoading: false
    }));
  }, []);

  // Load more items for virtualization
  const loadMoreItems = useCallback(() => {
    setVisibleItems(prev => Math.min(prev + 20, data.length));
  }, [data.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadDataProgressively();
  }, [loadDataProgressively]);

  const formatRecordCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getLoadingStatus = () => {
    if (loadingState.error) return 'error';
    if (loadingState.isLoading) return 'loading';
    if (data.length > 0) return 'loaded';
    return 'idle';
  };

  const status = getLoadingStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>{tableName}</span>
              <Badge variant={status === 'loaded' ? 'default' : status === 'loading' ? 'secondary' : status === 'error' ? 'destructive' : 'outline'}>
                {status === 'loading' ? `${loadingState.progress.toFixed(0)}%` : 
                 status === 'loaded' ? `${formatRecordCount(data.length)} records` :
                 status === 'error' ? 'Error' : 'Ready'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Progressive loading for {tableName} table with batched data retrieval
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {loadingState.isLoading && (
              <Button variant="outline" size="sm" onClick={cancelLoading}>
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Loading Progress */}
          {loadingState.isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loading batch {loadingState.currentBatch} of {loadingState.totalBatches}</span>
                <span>{loadingState.loadedRecords} / {loadingState.totalRecords} records</span>
              </div>
              <Progress value={loadingState.progress} className="h-2" />
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Progressive loading in progress...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {loadingState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Loading Error:</strong> {loadingState.error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={loadDataProgressively}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Data Preview */}
          {data.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Data Preview</h4>
                <Badge variant="outline">
                  {enableVirtualization ? `Showing ${visibleItems} of ${data.length}` : `${data.length} records`}
                </Badge>
              </div>
              
              <ScrollArea className="h-64 border rounded-md">
                <div className="p-4 space-y-2">
                  {data.slice(0, enableVirtualization ? visibleItems : undefined).map((record, index) => (
                    <div key={record.id || index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="font-medium">ID: {record.id || 'N/A'}</span>
                      <span className="text-muted-foreground">
                        {Object.keys(record).length} fields
                      </span>
                    </div>
                  ))}
                  
                  {/* Loading Skeletons */}
                  {loadingState.isLoading && (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={`skeleton-${index}`} className="h-10 w-full" />
                    ))
                  )}
                </div>
              </ScrollArea>
              
              {/* Load More Button for Virtualization */}
              {enableVirtualization && visibleItems < data.length && (
                <Button 
                  variant="outline" 
                  onClick={loadMoreItems}
                  className="w-full"
                >
                  Load More ({data.length - visibleItems} remaining)
                </Button>
              )}
            </div>
          )}

          {/* Loading Statistics */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Loading Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Records:</span>
                <span className="ml-2 font-mono">{formatRecordCount(loadingState.totalRecords)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Loaded Records:</span>
                <span className="ml-2 font-mono">{formatRecordCount(loadingState.loadedRecords)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Batch Size:</span>
                <span className="ml-2 font-mono">{batchSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Progress:</span>
                <span className="ml-2 font-mono">{loadingState.progress.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProgressiveDataLoader;