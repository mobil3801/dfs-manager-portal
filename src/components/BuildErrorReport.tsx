
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  FileText,
  Code,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  Shield } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildErrorManager } from '@/services/buildErrorManager';
import { ErrorGuidance } from '@/components/ErrorGuidance';
import { BuildGate } from '@/components/BuildGate';

interface BuildError {
  id: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  code?: string;
  category: string;
  timestamp: Date;
  resolved: boolean;
  guidance?: string[];
}

interface BuildErrorReportProps {
  onErrorsResolved?: () => void;
  preventPublishing?: boolean;
}

const BuildErrorReport: React.FC<BuildErrorReportProps> = ({
  onErrorsResolved,
  preventPublishing = true
}) => {
  const [errors, setErrors] = useState<BuildError[]>([]);
  const [selectedError, setSelectedError] = useState<BuildError | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const errorCategories = {
    syntax: { name: 'Syntax Errors', color: 'bg-red-500', icon: Code },
    type: { name: 'Type Errors', color: 'bg-orange-500', icon: AlertTriangle },
    import: { name: 'Import Errors', color: 'bg-yellow-500', icon: FileText },
    runtime: { name: 'Runtime Errors', color: 'bg-purple-500', icon: Clock },
    security: { name: 'Security Issues', color: 'bg-red-600', icon: Shield }
  };

  const severityColors = {
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  useEffect(() => {
    loadBuildErrors();
    const interval = setInterval(loadBuildErrors, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadBuildErrors = async () => {
    try {
      const buildErrors = await buildErrorManager.getBuildErrors();
      setErrors(buildErrors);

      const hasErrors = buildErrors.some((error) => error.severity === 'error' && !error.resolved);
      if (!hasErrors && onErrorsResolved) {
        onErrorsResolved();
      }
    } catch (error) {
      console.error('Failed to load build errors:', error);
      toast({
        title: "Error Loading Build Report",
        description: "Failed to load build errors. Please try again.",
        variant: "destructive"
      });
    }
  };

  const runBuildCheck = async () => {
    setIsBuilding(true);
    setBuildProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setBuildProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await buildErrorManager.runBuildCheck();

      clearInterval(progressInterval);
      setBuildProgress(100);

      setErrors(result.errors);

      if (result.errors.length === 0) {
        toast({
          title: "Build Successful! ✅",
          description: "No build errors found. Ready for publishing.",
          variant: "default"
        });
      } else {
        toast({
          title: "Build Errors Found",
          description: `Found ${result.errors.length} errors that need to be resolved.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Build Check Failed",
        description: "Failed to run build check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const resolveError = async (errorId: string) => {
    try {
      await buildErrorManager.resolveError(errorId);
      setErrors((prev) => prev.map((error) =>
      error.id === errorId ? { ...error, resolved: true } : error
      ));
      toast({
        title: "Error Resolved",
        description: "Error has been marked as resolved.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Failed to Resolve Error",
        description: "Could not mark error as resolved. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyErrorDetails = (error: BuildError) => {
    const details = `File: ${error.file}:${error.line}:${error.column}\nError: ${error.message}\nCategory: ${error.category}`;
    navigator.clipboard.writeText(details);
    toast({
      title: "Error Details Copied",
      description: "Error details have been copied to clipboard.",
      variant: "default"
    });
  };

  const toggleErrorExpansion = (errorId: string) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const getErrorStats = () => {
    const total = errors.length;
    const resolved = errors.filter((e) => e.resolved).length;
    const errorCount = errors.filter((e) => e.severity === 'error' && !e.resolved).length;
    const warningCount = errors.filter((e) => e.severity === 'warning' && !e.resolved).length;

    return { total, resolved, errorCount, warningCount };
  };

  const stats = getErrorStats();
  const hasBlockingErrors = stats.errorCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Build Error Report
              </CardTitle>
              <CardDescription>
                Detailed analysis of build errors and resolution guidance
              </CardDescription>
            </div>
            <Button onClick={runBuildCheck} disabled={isBuilding}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isBuilding ? 'animate-spin' : ''}`} />
              {isBuilding ? 'Building...' : 'Run Build Check'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isBuilding &&
          <div className="space-y-2">
              <Progress value={buildProgress} className="w-full" />
              <p className="text-sm text-gray-600">
                Analyzing codebase... {buildProgress}%
              </p>
            </div>
          }
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Build Gate Warning */}
      {preventPublishing && hasBlockingErrors &&
      <BuildGate
        errorCount={stats.errorCount}
        onResolveAll={() => runBuildCheck()} />

      }

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Details</CardTitle>
          <CardDescription>
            Click on any error to view detailed resolution guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({errors.length})</TabsTrigger>
              <TabsTrigger value="errors">Errors ({stats.errorCount})</TabsTrigger>
              <TabsTrigger value="warnings">Warnings ({stats.warningCount})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
            </TabsList>
            
            {(['all', 'errors', 'warnings', 'resolved'] as const).map((tab) =>
            <TabsContent key={tab} value={tab} className="space-y-4">
                {errors.
              filter((error) => {
                switch (tab) {
                  case 'errors':return error.severity === 'error' && !error.resolved;
                  case 'warnings':return error.severity === 'warning' && !error.resolved;
                  case 'resolved':return error.resolved;
                  default:return true;
                }
              }).
              map((error) =>
              <Collapsible key={error.id}>
                      <div className={`border rounded-lg p-4 ${error.resolved ? 'bg-green-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={severityColors[error.severity]}>
                                {error.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {error.category}
                              </Badge>
                              {error.resolved &&
                        <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                        }
                            </div>
                            
                            <h3 className="font-semibold mb-1">{error.message}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {error.file}:{error.line}:{error.column}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <CollapsibleTrigger asChild>
                                <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleErrorExpansion(error.id)}>

                                  {expandedErrors.has(error.id) ?
                            <ChevronDown className="h-4 w-4" /> :

                            <ChevronRight className="h-4 w-4" />
                            }
                                  Show Details
                                </Button>
                              </CollapsibleTrigger>
                              
                              <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyErrorDetails(error)}>

                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              {!error.resolved &&
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resolveError(error.id)}>

                                  <CheckCircle className="h-4 w-4" />
                                  Mark Resolved
                                </Button>
                        }
                            </div>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="mt-4 pt-4 border-t">
                            <ErrorGuidance error={error} />
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
              )}
                
                {errors.length === 0 &&
              <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Build Errors Found!</h3>
                    <p className="text-gray-600">
                      Your codebase is clean and ready for publishing.
                    </p>
                  </div>
              }
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>);

};

export default BuildErrorReport;