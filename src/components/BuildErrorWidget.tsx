
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildErrorManager } from '@/services/buildErrorManager';
import { useNavigate } from 'react-router-dom';

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

interface BuildErrorWidgetProps {
  className?: string;
}

const BuildErrorWidget: React.FC<BuildErrorWidgetProps> = ({ className = '' }) => {
  const [errors, setErrors] = useState<BuildError[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadErrors = async () => {
    try {
      const buildErrors = await buildErrorManager.getBuildErrors();
      setErrors(buildErrors);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to load build errors:', error);
    }
  };

  const runQuickCheck = async () => {
    setLoading(true);
    try {
      const result = await buildErrorManager.runBuildCheck();
      setErrors(result.errors);
      setLastCheck(new Date());
      
      if (result.errors.length === 0) {
        toast({
          title: "Build Clean! ✅",
          description: "No errors found in your build.",
          variant: "default"
        });
      } else {
        toast({
          title: "Build Errors Found",
          description: `Found ${result.errors.length} errors that need attention.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Failed to run build check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorStats = () => {
    const total = errors.length;
    const errorCount = errors.filter(e => e.severity === 'error' && !e.resolved).length;
    const warningCount = errors.filter(e => e.severity === 'warning' && !e.resolved).length;
    const resolved = errors.filter(e => e.resolved).length;
    
    return { total, errorCount, warningCount, resolved };
  };

  const stats = getErrorStats();
  const hasErrors = stats.errorCount > 0;
  const hasWarnings = stats.warningCount > 0;

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Build Status
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={runQuickCheck}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasErrors ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span className={`font-medium ${hasErrors ? 'text-red-600' : 'text-green-600'}`}>
                {hasErrors ? 'Build Errors' : 'Build Clean'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {lastCheck && `Last check: ${lastCheck.toLocaleTimeString()}`}
            </div>
          </div>

          {/* Error Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">{stats.errorCount}</div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{stats.warningCount}</div>
              <div className="text-xs text-gray-600">Warnings</div>
            </div>
          </div>

          {/* Recent Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Issues:</h4>
              {errors.slice(0, 3).map(error => (
                <div key={error.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={error.severity === 'error' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {error.severity}
                    </Badge>
                    <span className="font-mono text-gray-600">
                      {error.file}:{error.line}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-700 truncate">
                    {error.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Publishing Gate Warning */}
          {hasErrors && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Publishing Blocked:</strong> Resolve all errors before deploying.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/build-errors')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildErrorWidget;
