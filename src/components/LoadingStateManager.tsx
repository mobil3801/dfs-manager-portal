import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingStep {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

interface LoadingStateManagerProps {
  isVisible: boolean;
  steps: LoadingStep[];
  onCancel?: () => void;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  showSteps?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  isVisible,
  steps,
  onCancel,
  onRetry,
  title = "Loading Dashboard",
  subtitle = "Please wait while we load your data...",
  showProgress = true,
  showSteps = true,
  autoHide = true,
  autoHideDelay = 2000
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress based on step completion
  useEffect(() => {
    const completedSteps = steps.filter((step) => step.status === 'completed').length;
    const totalSteps = steps.length;
    const newProgress = totalSteps > 0 ? completedSteps / totalSteps * 100 : 0;

    setProgress(newProgress);

    // Find current loading step
    const loadingStep = steps.find((step) => step.status === 'loading');
    setCurrentStep(loadingStep?.name || null);
  }, [steps]);

  // Track elapsed time
  useEffect(() => {
    if (isVisible && startTime === 0) {
      setStartTime(Date.now());
    }

    if (!isVisible) {
      setStartTime(0);
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      if (startTime > 0) {
        setElapsedTime(Date.now() - startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, startTime]);

  // Auto-hide when completed
  useEffect(() => {
    if (autoHide && progress === 100 && steps.every((step) => step.status !== 'failed')) {
      autoHideTimeoutRef.current = setTimeout(() => {
        // Auto-hide logic would go here
        console.log('Auto-hiding loading manager');
      }, autoHideDelay);
    }

    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [autoHide, progress, steps, autoHideDelay]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const getStepIcon = (status: LoadingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const failedCount = steps.filter((step) => step.status === 'failed').length;
  const isComplete = progress === 100;
  const hasErrors = failedCount > 0;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}>

          <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {isComplete && !hasErrors ?
                  <CheckCircle className="h-5 w-5 text-green-600" /> :
                  hasErrors ?
                  <AlertTriangle className="h-5 w-5 text-red-600" /> :

                  <Loader2 className="h-5 w-5 animate-spin" />
                  }
                  {title}
                </CardTitle>
                {onCancel && !isComplete &&
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-8 w-8 p-0">

                    <X className="h-4 w-4" />
                  </Button>
                }
              </div>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {showProgress &&
              <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress
                  value={progress}
                  className="h-2" />

                </div>
              }

              {/* Current Step */}
              {currentStep && !isComplete &&
              <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="truncate">{currentStep}</span>
                </div>
              }

              {/* Status Summary */}
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{completedCount} completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(elapsedTime)}</span>
                </div>
                {failedCount > 0 &&
                <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span>{failedCount} failed</span>
                  </div>
                }
              </div>

              {/* Steps List */}
              {showSteps && steps.length > 0 &&
              <div className="space-y-2 max-h-32 overflow-y-auto">
                  {steps.map((step) =>
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs">

                      {getStepIcon(step.status)}
                      <span className={`flex-1 truncate ${
                  step.status === 'failed' ? 'text-red-600' :
                  step.status === 'completed' ? 'text-green-600' :
                  'text-muted-foreground'}`
                  }>
                        {step.name}
                      </span>
                      {step.duration && step.status === 'completed' &&
                  <Badge variant="outline" className="text-xs">
                          {step.duration}ms
                        </Badge>
                  }
                    </motion.div>
                )}
                </div>
              }

              {/* Error Messages */}
              {hasErrors &&
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {steps.
                    filter((step) => step.status === 'failed' && step.error).
                    slice(0, 2).
                    map((step, index) =>
                    <div key={index} className="text-xs">
                            {step.name}: {step.error}
                          </div>
                    )}
                      {failedCount > 2 &&
                    <div className="text-xs">
                          +{failedCount - 2} more errors
                        </div>
                    }
                    </div>
                  </AlertDescription>
                </Alert>
              }

              {/* Action Buttons */}
              {(isComplete || hasErrors) &&
              <div className="flex gap-2 justify-end">
                  {hasErrors && onRetry &&
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm">

                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                }
                  {isComplete &&
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  size="sm">

                      Continue
                    </Button>
                }
                </div>
              }

              {/* Debug Info (Development Only) */}
              {process.env.NODE_ENV === 'development' &&
              <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                  <div>Steps: {steps.length}</div>
                  <div>Completed: {completedCount}</div>
                  <div>Failed: {failedCount}</div>
                  <div>Elapsed: {formatTime(elapsedTime)}</div>
                </div>
              }
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

};

export default LoadingStateManager;