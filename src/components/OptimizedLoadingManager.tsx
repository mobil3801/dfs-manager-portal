import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentTask: string;
  completedTasks: string[];
  failedTasks: string[];
  errors: string[];
  totalTasks: number;
  startTime: number;
  estimatedTimeRemaining: number;
}

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

interface OptimizedLoadingManagerProps {
  tasks: LoadingTask[];
  onComplete: (results: Map<string, any>) => void;
  onError: (errors: Map<string, Error>) => void;
  maxConcurrency?: number;
  enableProgressUI?: boolean;
  timeout?: number;
  enableRetries?: boolean;
}

const OptimizedLoadingManager: React.FC<OptimizedLoadingManagerProps> = ({
  tasks,
  onComplete,
  onError,
  maxConcurrency = 3,
  enableProgressUI = true,
  timeout = 30000,
  enableRetries = true
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    currentTask: '',
    completedTasks: [],
    failedTasks: [],
    errors: [],
    totalTasks: tasks.length,
    startTime: 0,
    estimatedTimeRemaining: 0
  });

  const resultsRef = useRef<Map<string, any>>(new Map());
  const errorsRef = useRef<Map<string, Error>>(new Map());
  const runningTasksRef = useRef<Set<string>>(new Set());
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const taskQueueRef = useRef<LoadingTask[]>([]);
  const dependencyMapRef = useRef<Map<string, string[]>>(new Map());

  /**
   * Initialize dependency mapping
   */
  useEffect(() => {
    const dependencyMap = new Map<string, string[]>();
    tasks.forEach((task) => {
      if (task.dependencies) {
        dependencyMap.set(task.id, task.dependencies);
      }
    });
    dependencyMapRef.current = dependencyMap;
  }, [tasks]);

  /**
   * Check if task dependencies are satisfied
   */
  const areDependenciesSatisfied = useCallback((taskId: string): boolean => {
    const dependencies = dependencyMapRef.current.get(taskId);
    if (!dependencies) return true;

    return dependencies.every((depId) =>
    loadingState.completedTasks.includes(depId) &&
    !loadingState.failedTasks.includes(depId)
    );
  }, [loadingState.completedTasks, loadingState.failedTasks]);

  /**
   * Get next available tasks that can be executed
   */
  const getAvailableTasks = useCallback((): LoadingTask[] => {
    return taskQueueRef.current.filter((task) =>
    !runningTasksRef.current.has(task.id) &&
    !loadingState.completedTasks.includes(task.id) &&
    !loadingState.failedTasks.includes(task.id) &&
    areDependenciesSatisfied(task.id)
    );
  }, [loadingState.completedTasks, loadingState.failedTasks, areDependenciesSatisfied]);

  /**
   * Execute a single task with retry logic
   */
  const executeTask = async (task: LoadingTask): Promise<void> => {
    const { id, name, execute, onSuccess, onError: taskOnError, retries } = task;

    runningTasksRef.current.add(id);

    setLoadingState((prev) => ({
      ...prev,
      currentTask: name
    }));

    try {
      console.log(`🔄 Executing task: ${name}`);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Task ${name} timed out`)), task.timeout);
      });

      // Race between task execution and timeout
      const result = await Promise.race([
      execute(),
      timeoutPromise]
      );

      // Task successful
      resultsRef.current.set(id, result);
      onSuccess?.(result);

      setLoadingState((prev) => ({
        ...prev,
        completedTasks: [...prev.completedTasks, id],
        progress: Math.round((prev.completedTasks.length + 1) / prev.totalTasks * 100)
      }));

      console.log(`✅ Task completed: ${name}`);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Handle retry logic
      if (enableRetries && task.currentRetry < retries) {
        task.currentRetry++;
        console.log(`🔄 Retrying task: ${name} (${task.currentRetry}/${retries})`);

        // Add delay before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * task.currentRetry));

        // Re-queue the task
        runningTasksRef.current.delete(id);
        return executeTask(task);
      }

      // Task failed
      errorsRef.current.set(id, err);
      taskOnError?.(err);

      setLoadingState((prev) => ({
        ...prev,
        failedTasks: [...prev.failedTasks, id],
        errors: [...prev.errors, `${name}: ${err.message}`],
        progress: Math.round((prev.completedTasks.length + prev.failedTasks.length + 1) / prev.totalTasks * 100)
      }));

      console.error(`❌ Task failed: ${name}`, err);
    } finally {
      runningTasksRef.current.delete(id);
    }
  };

  /**
   * Process task queue with concurrency control
   */
  const processTaskQueue = useCallback(async (): Promise<void> => {
    while (taskQueueRef.current.length > 0) {
      const availableTasks = getAvailableTasks();

      if (availableTasks.length === 0) {
        // No tasks can be executed, wait for running tasks to complete
        if (runningTasksRef.current.size === 0) {
          // Deadlock or all tasks blocked by failed dependencies
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      // Sort by priority (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      availableTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      // Execute tasks up to concurrency limit
      const tasksToExecute = availableTasks.slice(0, maxConcurrency - runningTasksRef.current.size);

      // Remove tasks from queue
      taskQueueRef.current = taskQueueRef.current.filter((task) =>
      !tasksToExecute.find((t) => t.id === task.id)
      );

      // Start executing tasks
      const executePromises = tasksToExecute.map((task) => executeTask(task));

      // Wait for at least one task to complete before continuing
      if (executePromises.length > 0) {
        await Promise.race(executePromises);
      }
    }
  }, [getAvailableTasks, maxConcurrency]);

  /**
   * Start loading process
   */
  const startLoading = useCallback(async (): Promise<void> => {
    console.log('🚀 Starting optimized loading process...');

    // Reset state
    resultsRef.current.clear();
    errorsRef.current.clear();
    runningTasksRef.current.clear();
    taskQueueRef.current = [...tasks];

    // Reset task retry counters
    tasks.forEach((task) => {
      task.currentRetry = 0;
    });

    setLoadingState({
      isLoading: true,
      progress: 0,
      currentTask: 'Initializing...',
      completedTasks: [],
      failedTasks: [],
      errors: [],
      totalTasks: tasks.length,
      startTime: Date.now(),
      estimatedTimeRemaining: 0
    });

    // Set overall timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      console.error('⏰ Loading process timed out');
      setLoadingState((prev) => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, 'Loading process timed out']
      }));
      onError(errorsRef.current);
    }, timeout);

    try {
      // Process all tasks
      await processTaskQueue();

      // Check results
      const hasErrors = errorsRef.current.size > 0;
      const hasIncompleteRequiredTasks = tasks.
      filter((task) => task.priority === 'high').
      some((task) => !resultsRef.current.has(task.id));

      if (hasErrors || hasIncompleteRequiredTasks) {
        console.warn('⚠️ Loading completed with errors');
        onError(errorsRef.current);
      } else {
        console.log('✅ Loading completed successfully');
        onComplete(resultsRef.current);
      }

    } catch (error) {
      console.error('❌ Loading process failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      errorsRef.current.set('process', err);
      onError(errorsRef.current);
    } finally {
      setLoadingState((prev) => ({
        ...prev,
        isLoading: false
      }));

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, [tasks, timeout, processTaskQueue, onComplete, onError]);

  /**
   * Update estimated time remaining
   */
  useEffect(() => {
    if (!loadingState.isLoading) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingState.startTime;
      const progress = loadingState.progress / 100;

      if (progress > 0) {
        const estimatedTotal = elapsed / progress;
        const remaining = Math.max(0, estimatedTotal - elapsed);

        setLoadingState((prev) => ({
          ...prev,
          estimatedTimeRemaining: remaining
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loadingState.isLoading, loadingState.startTime, loadingState.progress]);

  /**
   * Start loading on mount
   */
  useEffect(() => {
    if (tasks.length > 0) {
      startLoading();
    }
  }, [startLoading, tasks]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  if (!enableProgressUI) {
    return null;
  }

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{loadingState.progress}%</span>
            </div>
            <Progress value={loadingState.progress} className="h-2" />
          </div>

          {/* Current Task */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className="truncate">{loadingState.currentTask}</span>
          </div>

          {/* Time Remaining */}
          {loadingState.estimatedTimeRemaining > 0 &&
          <div className="text-xs text-muted-foreground text-center">
              Estimated time remaining: {formatTime(loadingState.estimatedTimeRemaining)}
            </div>
          }

          {/* Task Status */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>{loadingState.completedTasks.length} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{runningTasksRef.current.size} running</span>
            </div>
            {loadingState.failedTasks.length > 0 &&
            <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-600" />
                <span>{loadingState.failedTasks.length} failed</span>
              </div>
            }
          </div>

          {/* Errors */}
          {loadingState.errors.length > 0 &&
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {loadingState.errors.slice(0, 2).map((error, index) =>
                <div key={index} className="text-xs">{error}</div>
                )}
                  {loadingState.errors.length > 2 &&
                <div className="text-xs">+{loadingState.errors.length - 2} more errors</div>
                }
                </div>
              </AlertDescription>
            </Alert>
          }

          {/* Status Badges */}
          <div className="flex justify-center gap-2">
            <Badge variant="outline">
              {loadingState.totalTasks} total tasks
            </Badge>
            <Badge variant="outline">
              {maxConcurrency} max concurrent
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>);

};

export default OptimizedLoadingManager;