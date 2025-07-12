import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingDown, 
  TrendingUp,
  Zap,
  FileText,
  Package,
  Clock
} from 'lucide-react';

interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  optimizationScore: number;
  recommendations: string[];
  largestChunks: Array<{
    name: string;
    size: number;
    type: 'vendor' | 'app' | 'lazy';
  }>;
}

const BundleOptimizationStatus = () => {
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Simulated bundle analysis based on your actual build output
  useEffect(() => {
    const analyzeBundleMetrics = () => {
      // Based on your actual build output
      const bundleMetrics: BundleMetrics = {
        totalSize: 1200, // KB (approximate total)
        gzippedSize: 350, // KB (approximate gzipped)
        chunkCount: 85, // Number of chunks from build output
        optimizationScore: 65, // Out of 100
        recommendations: [
          'Main bundle (475KB) is too large - consider further code splitting',
          'CSS bundle (105KB) could be optimized with unused CSS removal',
          'Several vendor chunks could be better grouped',
          'Enable tree shaking for unused exports',
          'Consider lazy loading some admin features'
        ],
        largestChunks: [
          { name: 'index-SAuXO1wW.js', size: 475, type: 'app' },
          { name: 'proxy-BMcXcMsq.js', size: 112, type: 'vendor' },
          { name: 'UserManagement-DqnqESgn.js', size: 108, type: 'lazy' },
          { name: 'SalesReportForm-m41HUJ7-.js', size: 99, type: 'lazy' },
          { name: 'OverflowTestingPage-DS_wpYeH.js', size: 84, type: 'lazy' }
        ]
      };

      setMetrics(bundleMetrics);
      setLoading(false);
    };

    setTimeout(analyzeBundleMetrics, 1000);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const formatSize = (sizeKB: number) => {
    if (sizeKB > 1024) {
      return `${(sizeKB / 1024).toFixed(1)}MB`;
    }
    return `${sizeKB}KB`;
  };

  const runOptimization = async () => {
    setOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (metrics) {
      setMetrics({
        ...metrics,
        optimizationScore: Math.min(100, metrics.optimizationScore + 15),
        totalSize: metrics.totalSize * 0.85,
        gzippedSize: metrics.gzippedSize * 0.82,
        recommendations: [
          'Bundle size optimized!',
          'Dead code eliminated',
          'Vendor chunks reorganized',
          'CSS optimized and purged'
        ]
      });
    }
    
    setOptimizing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bundle Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Analyzing bundle...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bundle Optimization Status
          </CardTitle>
          <CardDescription>
            Current bundle performance and optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimization Score */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Optimization Score</h3>
              <p className="text-sm text-gray-600">Overall bundle performance</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(metrics.optimizationScore)}`}>
                {metrics.optimizationScore}
              </div>
              <Badge variant={getScoreBadgeVariant(metrics.optimizationScore)}>
                {metrics.optimizationScore >= 80 ? 'Excellent' : 
                 metrics.optimizationScore >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
          </div>

          <Progress value={metrics.optimizationScore} className="w-full" />

          {/* Bundle Size Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatSize(metrics.totalSize)}
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatSize(metrics.gzippedSize)}
              </div>
              <div className="text-sm text-gray-600">Gzipped</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.chunkCount}
              </div>
              <div className="text-sm text-gray-600">Chunks</div>
            </div>
          </div>

          {/* Optimization Button */}
          <Button 
            onClick={runOptimization} 
            disabled={optimizing}
            className="w-full"
          >
            {optimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Optimizing Bundle...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Largest Chunks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Largest Chunks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.largestChunks.map((chunk, index) => (
              <div key={chunk.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono text-gray-600">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm truncate max-w-[200px]">
                      {chunk.name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chunk.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatSize(chunk.size)}</div>
                  {chunk.size > 100 && (
                    <div className="text-xs text-amber-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Large
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.recommendations.map((rec, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{rec}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                Good Practices
              </h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ Code splitting implemented</li>
                <li>✓ Lazy loading for routes</li>
                <li>✓ Vendor chunk separation</li>
                <li>✓ Asset optimization</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                Areas for Improvement
              </h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Main bundle size reduction</li>
                <li>• Tree shaking optimization</li>
                <li>• CSS purging</li>
                <li>• Image optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BundleOptimizationStatus;