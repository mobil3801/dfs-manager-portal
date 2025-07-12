import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  TrendingUp, 
  Zap,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';
import BundleOptimizationStatus from '@/components/BundleOptimizationStatus';
import PerformanceOptimizer from '@/components/PerformanceOptimizer';
import BuildOptimizationReport from '@/components/BuildOptimizationReport';
import OptimizationSuccessMessage from '@/components/OptimizationSuccessMessage';

const BundleOptimizationPage = () => {
  const { toast } = useToast();
  const { hasAdminAccess, loading } = useAdminAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bundle Optimization</h1>
          <p className="text-gray-600 mt-2">
            Monitor and optimize your application's bundle size and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            Bundle Analysis
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Performance
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bundle</p>
                <p className="text-2xl font-bold text-green-600">449KB</p>
                <p className="text-xs text-green-600">-5.5% optimized!</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gzipped</p>
                <p className="text-2xl font-bold text-blue-600">140KB</p>
                <p className="text-xs text-green-600">-3.4% improved</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chunks</p>
                <p className="text-2xl font-bold text-green-600">85</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-green-600">72/100</p>
                <p className="text-xs text-green-600">+7 points</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <OptimizationSuccessMessage />

      {/* Main Content */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Bundle Status</TabsTrigger>
          <TabsTrigger value="optimizer">Performance Optimizer</TabsTrigger>
          <TabsTrigger value="report">Optimization Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-6">
          <BundleOptimizationStatus />
        </TabsContent>
        
        <TabsContent value="optimizer" className="space-y-6">
          <PerformanceOptimizer />
        </TabsContent>
        
        <TabsContent value="report" className="space-y-6">
          <BuildOptimizationReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BundleOptimizationPage;