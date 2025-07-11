
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { buildErrorManager } from '@/services/buildErrorManager';

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

interface BuildErrorSummaryProps {
  className?: string;
  showActions?: boolean;
}

const BuildErrorSummary: React.FC<BuildErrorSummaryProps> = ({ 
  className = '', 
  showActions = true 
}) => {
  const [errors, setErrors] = useState<BuildError[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadErrors();
    const interval = setInterval(loadErrors, 60000); // Check every minute
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

  const getStatusIcon = () => {
    if (hasErrors) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (hasWarnings) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (hasErrors) return "Build Errors";
    if (hasWarnings) return "Build Warnings";
    return "Build Clean";
  };

  const getStatusColor = () => {
    if (hasErrors) return "text-red-600";
    if (hasWarnings) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Build Quality
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={runQuickCheck}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {lastCheck && `Last check: ${lastCheck.toLocaleTimeString()}`}
            </div>
          </div>

          {/* Error Statistics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">{stats.errorCount}</div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{stats.warningCount}</div>
              <div className="text-xs text-gray-600">Warnings</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{stats.resolved}</div>
              <div className="text-xs text-gray-600">Resolved</div>
            </div>
          </div>

          {/* Publishing Gate Status */}
          {hasErrors && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Publishing Blocked:</strong> Resolve all errors before deploying.
              </AlertDescription>
            </Alert>
          )}

          {!hasErrors && !hasWarnings && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready to Deploy:</strong> All checks passed successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Errors Preview */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Issues:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {errors.slice(0, 3).map(error => (
                  <div key={error.id} className="text-xs p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={error.severity === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs px-1 py-0"
                      >
                        {error.severity}
                      </Badge>
                      <span className="font-mono text-gray-600 truncate">
                        {error.file.split('/').pop()}:{error.line}
                      </span>
                    </div>
                    <div className="text-gray-700 truncate">
                      {error.message}
                    </div>
                  </div>
                ))}
                {errors.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{errors.length - 3} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildErrorSummary;
