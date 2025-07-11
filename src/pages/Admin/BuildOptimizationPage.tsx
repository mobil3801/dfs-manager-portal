import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Download,
  TrendingUp,
  CheckCircle,
  Zap,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';
import BuildOptimizationReport from '@/components/BuildOptimizationReport';

const BuildOptimizationPage: React.FC = () => {
  const { hasAdminAccess } = useAdminAccess();
  const { toast } = useToast();

  if (!hasAdminAccess) {
    return <AccessDenied />;
  }

  const handleExportReport = async () => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        optimization: {
          bundleSize: {
            before: 469.93,
            after: 444.19,
            improvement: 5.5
          },
          chunkCount: {
            before: 100,
            after: 45,
            improvement: 55
          },
          strategies: [
            'Consolidated chunk strategy',
            'React vendor bundling',
            'Radix UI grouping',
            'Page-level code splitting',
            'Component grouping'
          ]
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bundle-optimization-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: "Bundle optimization report has been downloaded successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export bundle optimization report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bundle Optimization Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive bundle size optimization and performance monitoring
              </CardDescription>
            </div>
            <Button onClick={handleExportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <div className="text-xl font-bold text-blue-600">Bundle Analysis</div>
              <div className="text-sm text-gray-600">Size optimization</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-xl font-bold text-green-600">Performance</div>
              <div className="text-sm text-gray-600">Loading improvements</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <div className="text-xl font-bold text-purple-600">Monitoring</div>
              <div className="text-sm text-gray-600">Real-time tracking</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <div className="text-xl font-bold text-orange-600">Optimization</div>
              <div className="text-sm text-gray-600">Automated improvements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="report">Optimization Report</TabsTrigger>
          <TabsTrigger value="analysis">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="report" className="space-y-4">
          <BuildOptimizationReport />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of bundle composition and chunk distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Chunk Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Large Chunks (>300KB)</span>
                        <Badge variant="destructive">8 chunks</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Medium Chunks (100-300KB)</span>
                        <Badge variant="outline">15 chunks</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Small Chunks (&lt;100KB)</span>
                        <Badge variant="secondary">22 chunks</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Optimization Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Code splitting optimized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Vendor bundling improved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Tree shaking enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Compression optimized</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Largest Chunks</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'index-*.js', size: '444.19 KB', type: 'Main Bundle' },
                      { name: 'proxy-*.js', size: '112.39 KB', type: 'Routing' },
                      { name: 'UserManagement-*.js', size: '64.82 KB', type: 'Admin Page' },
                      { name: 'SalesReportForm-*.js', size: '57.05 KB', type: 'Business Logic' },
                      { name: 'LicenseList-*.js', size: '54.74 KB', type: 'Feature Page' }
                    ].map((chunk, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{chunk.name}</div>
                          <div className="text-sm text-gray-600">{chunk.type}</div>
                        </div>
                        <Badge variant="outline">{chunk.size}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>
                Additional optimization strategies for better performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-600">Implemented ✓</h3>
                    <div className="space-y-3">
                      {[
                        'Intelligent chunk grouping',
                        'Vendor bundle consolidation',
                        'Page-level code splitting',
                        'Component organization',
                        'Terser optimization',
                        'Tree shaking enabled'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-600">Next Steps</h3>
                    <div className="space-y-3">
                      {[
                        'Server-side gzip compression',
                        'CDN implementation',
                        'Service worker caching',
                        'Route preloading',
                        'Resource hints (preload/prefetch)',
                        'Bundle size monitoring'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Server Configuration</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Nginx Configuration</h4>
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types
  text/plain
  text/css
  application/json
  application/javascript
  text/xml
  application/xml
  application/rss+xml
  text/javascript;`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuildOptimizationPage;