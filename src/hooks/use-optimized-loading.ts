import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LoadingTask {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  timeout: number;
  retries: number;
  currentRetry: number;
  execute: () => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  dependencies?: string[];
}

interface LoadingOptions {
  maxConcurrency?: number;
  timeout?: number;
  enableRetries?: boolean;
  showProgress?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentTask: string;
  completedTasks: string[];
  failedTasks: string[];
  errors: string[];
}

export const useOptimizedLoading = (options: LoadingOptions = {}) => {
  const {
    maxConcurrency = 3,
    timeout = 30000,
    enableRetries = true,
    showProgress = true
  } = options;

  const { toast } = useToast();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    currentTask: '',
    completedTasks: [],
    failedTasks: [],
    errors: []
  });

  const resultsRef = useRef<Map<string, any>>(new Map());
  const errorsRef = useRef<Map<string, Error>>(new Map());
  const runningTasksRef = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Create optimized dashboard loading tasks
   */
  const createDashboardTasks = useCallback((): LoadingTask[] => {
    return [
      {
        id: 'auth-check',
        name: 'Verifying authentication',
        priority: 'high' as const,
        timeout: 5000,
        retries: 2,
        currentRetry: 0,
        execute: async () => {
          // Quick auth check
          if (!window.ezsite?.apis) {
            throw new Error('APIs not available');
          }
          return { authenticated: true };
        }
      },
      {
        id: 'critical-data',
        name: 'Loading critical dashboard data',
        priority: 'high' as const,
        timeout: 10000,
        retries: 3,
        currentRetry: 0,
        dependencies: ['auth-check'],
        execute: async () => {
          const criticalData = await Promise.allSettled([
            // Sales reports (limited)
            window.ezsite.apis.tablePage(12356, {
              PageNo: 1,
              PageSize: 10,
              OrderByField: 'report_date',
              IsAsc: false,
              Filters: []
            }),
            // Products count
            window.ezsite.apis.tablePage(11726, {
              PageNo: 1,
              PageSize: 1,
              Filters: []
            }),
            // Employees count
            window.ezsite.apis.tablePage(11727, {
              PageNo: 1,
              PageSize: 1,
              Filters: [{ name: 'is_active', op: 'Equal', value: true }]
            })
          ]);

          return criticalData.map(result => 
            result.status === 'fulfilled' ? result.value : null
          );
        }
      },
      {
        id: 'secondary-data',
        name: 'Loading additional data',
        priority: 'medium' as const,
        timeout: 8000,
        retries: 2,
        currentRetry: 0,
        dependencies: ['critical-data'],
        execute: async () => {
          const secondaryData = await Promise.allSettled([
            // Orders
            window.ezsite.apis.tablePage(11730, {
              PageNo: 1,
              PageSize: 10,
              Filters: []
            }),
            // Deliveries
            window.ezsite.apis.tablePage(12196, {
              PageNo: 1,
              PageSize: 10,
              Filters: []
            }),
            // Licenses
            window.ezsite.apis.tablePage(11731, {
              PageNo: 1,
              PageSize: 10,
              Filters: []
            })
          ]);

          return secondaryData.map(result => 
            result.status === 'fulfilled' ? result.value : null
          );
        }
      },
      {
        id: 'optional-data',
        name: 'Loading optional features',
        priority: 'low' as const,
        timeout: 5000,
        retries: 1,
        currentRetry: 0,
        dependencies: ['critical-data'],
        execute: async () => {
          // Optional data that doesn't block the dashboard
          const optionalData = await Promise.allSettled([
            // Vendors
            window.ezsite.apis.tablePage(11729, {
              PageNo: 1,
              PageSize: 5,
              Filters: [{ name: 'is_active', op: 'Equal', value: true }]
            })
          ]);

          return optionalData.map(result => 
            result.status === 'fulfilled' ? result.value : null
          );
        }
      }
    ];
  }, []);

  /**
   * Execute loading tasks with optimizations
   */
  const executeLoading = useCallback(async (tasks: LoadingTask[]): Promise<Map<string, any>> => {
    console.log('🚀 Starting optimized loading...');
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Reset state
    resultsRef.current.clear();
    errorsRef.current.clear();
    runningTasksRef.current.clear();

    setLoadingState({
      isLoading: true,
      progress: 0,
      currentTask: 'Initializing...',
      completedTasks: [],
      failedTasks: [],
      errors: []
    });

    try {
      // Process tasks in dependency order with concurrency control
      const dependencyMap = new Map<string, string[]>();
      tasks.forEach(task => {
        if (task.dependencies) {
          dependencyMap.set(task.id, task.dependencies);
        }
      });

      const taskQueue = [...tasks];
      const completed = new Set<string>();
      const failed = new Set<string>();

      while (taskQueue.length > 0 && !abortControllerRef.current.signal.aborted) {
        // Find tasks that can be executed (dependencies satisfied)
        const readyTasks = taskQueue.filter(task => {
          const deps = dependencyMap.get(task.id) || [];
          return deps.every(dep => completed.has(dep) && !failed.has(dep));
        });

        if (readyTasks.length === 0) {
          // No tasks can run, check if we're deadlocked
          if (runningTasksRef.current.size === 0) {
            console.warn('Deadlock detected in task dependencies');
            break;
          }
          // Wait for running tasks
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        // Sort by priority and take up to maxConcurrency
        readyTasks.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        const tasksToRun = readyTasks.slice(0, maxConcurrency - runningTasksRef.current.size);
        
        // Remove from queue
        tasksToRun.forEach(task => {
          const index = taskQueue.findIndex(t => t.id === task.id);
          if (index !== -1) taskQueue.splice(index, 1);
        });

        // Execute tasks
        const executePromises = tasksToRun.map(async (task) => {
          runningTasksRef.current.add(task.id);
          
          setLoadingState(prev => ({
            ...prev,
            currentTask: task.name
          }));

          try {
            console.log(`▶️ Executing: ${task.name}`);
            
            const result = await Promise.race([
              task.execute(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout: ${task.name}`)), task.timeout)
              )
            ]);

            resultsRef.current.set(task.id, result);
            completed.add(task.id);
            task.onSuccess?.(result);

            setLoadingState(prev => ({
              ...prev,
              completedTasks: [...prev.completedTasks, task.id],
              progress: Math.round(((prev.completedTasks.length + 1) / tasks.length) * 100)
            }));

            console.log(`✅ Completed: ${task.name}`);

          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            
            // Retry logic
            if (enableRetries && task.currentRetry < task.retries) {
              task.currentRetry++;
              console.log(`🔄 Retrying: ${task.name} (${task.currentRetry}/${task.retries})`);
              
              // Re-add to queue with delay
              setTimeout(() => {
                if (!abortControllerRef.current?.signal.aborted) {
                  taskQueue.push(task);
                }
              }, 1000 * task.currentRetry);
            } else {
              errorsRef.current.set(task.id, err);
              failed.add(task.id);
              task.onError?.(err);

              setLoadingState(prev => ({
                ...prev,
                failedTasks: [...prev.failedTasks, task.id],
                errors: [...prev.errors, `${task.name}: ${err.message}`]
              }));

              console.error(`❌ Failed: ${task.name}`, err);
            }
          } finally {
            runningTasksRef.current.delete(task.id);
          }
        });

        // Wait for at least one task to complete
        if (executePromises.length > 0) {
          await Promise.race(executePromises);
        }
      }

      // Check for critical failures
      const criticalTasks = tasks.filter(t => t.priority === 'high');
      const failedCritical = criticalTasks.filter(t => failed.has(t.id));
      
      if (failedCritical.length > 0) {
        throw new Error(`Critical tasks failed: ${failedCritical.map(t => t.name).join(', ')}`);
      }

      console.log('✅ Loading completed successfully');
      return resultsRef.current;

    } catch (error) {
      console.error('❌ Loading failed:', error);
      throw error;
    } finally {
      setLoadingState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [maxConcurrency, enableRetries]);

  /**
   * Load dashboard with optimizations
   */
  const loadDashboard = useCallback(async (): Promise<Map<string, any>> => {
    try {
      const tasks = createDashboardTasks();
      const results = await executeLoading(tasks);
      
      if (showProgress) {
        toast({
          title: 'Dashboard Loaded',
          description: 'All dashboard data loaded successfully',
          variant: 'default'
        });
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
      
      if (showProgress) {
        toast({
          title: 'Loading Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      throw error;
    }
  }, [createDashboardTasks, executeLoading, showProgress, toast]);

  /**
   * Cancel loading
   */
  const cancelLoading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('⏹️ Loading cancelled');
    }
    
    setLoadingState(prev => ({
      ...prev,
      isLoading: false
    }));
  }, []);

  /**
   * Reset loading state
   */
  const resetLoading = useCallback(() => {
    cancelLoading();
    resultsRef.current.clear();
    errorsRef.current.clear();
    runningTasksRef.current.clear();
    
    setLoadingState({
      isLoading: false,
      progress: 0,
      currentTask: '',
      completedTasks: [],
      failedTasks: [],
      errors: []
    });
  }, [cancelLoading]);

  return {
    loadingState,
    loadDashboard,
    executeLoading,
    cancelLoading,
    resetLoading,
    createDashboardTasks,
    results: resultsRef.current,
    errors: errorsRef.current
  };
};

export default useOptimizedLoading;