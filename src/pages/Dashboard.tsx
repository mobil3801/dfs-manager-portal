import React from 'react';
import RoleBasedDashboardV2 from '@/components/RoleBasedDashboardV2';
import RealtimeStatsWidget from '@/components/RealtimeStatsWidget';
import useRealtimeAudit from '@/hooks/use-realtime-audit';

const Dashboard: React.FC = () => {
  // Enable real-time audit logging for the dashboard
  useRealtimeAudit({
    enabledTables: ['daily_sales_reports_enhanced', 'products', 'employees'],
    enableNotifications: true,
    enableLogging: true
  });

  return (
    <div className="space-y-6">
      {/* Real-time Stats Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RealtimeStatsWidget 
            showConnectionStatus={true}
            autoRefresh={true}
            refreshInterval={5000}
          />
        </div>
        <div className="lg:col-span-3">
          <RoleBasedDashboardV2 />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;