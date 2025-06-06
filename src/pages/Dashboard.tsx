import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import RoleBasedDashboardV2 from '@/components/RoleBasedDashboardV2';
import ComprehensiveDashboard from '@/components/ComprehensiveDashboard';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import EnhancedDashboard from '@/components/EnhancedDashboard';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="comprehensive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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
    </div>);

};

export default Dashboard;