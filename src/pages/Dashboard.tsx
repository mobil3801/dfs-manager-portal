import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, TrendingUp, AlertTriangle, Monitor } from 'lucide-react';
import RoleBasedDashboardV2 from '@/components/RoleBasedDashboardV2';
import ComprehensiveDashboard from '@/components/ComprehensiveDashboard';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import EnhancedDashboard from '@/components/EnhancedDashboard';
import OptimizedAdminDashboard from '@/components/OptimizedAdminDashboard';
import MemoryAwareErrorBoundary from '@/components/MemoryAwareErrorBoundary';

const Dashboard: React.FC = () => {
  return (
    <MemoryAwareErrorBoundary
      maxRetries={3}
      autoRecovery={true}
      memoryThreshold={0.8}
      enableMemoryMonitoring={true}
      isolationLevel="page">

      <div className="space-y-6">
        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="optimized" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="optimized" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Optimized Admin
            </TabsTrigger>
            <TabsTrigger value="comprehensive" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="role-based" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Role-Based View
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Enhanced Dashboard
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Real-time Alerts
            </TabsTrigger>
          </TabsList>

          {/* Optimized Admin Dashboard */}
          <TabsContent value="optimized" className="space-y-6">
            <OptimizedAdminDashboard />
          </TabsContent>

          {/* Comprehensive Analytics Dashboard */}
          <TabsContent value="comprehensive" className="space-y-6">
            <ComprehensiveDashboard />
          </TabsContent>

          {/* Role-Based Dashboard */}
          <TabsContent value="role-based" className="space-y-6">
            <RoleBasedDashboardV2 />
          </TabsContent>

          {/* Enhanced Dashboard Tab */}
          <TabsContent value="enhanced" className="space-y-6">
            <EnhancedDashboard />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <RealtimeNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </MemoryAwareErrorBoundary>);

};

export default Dashboard;