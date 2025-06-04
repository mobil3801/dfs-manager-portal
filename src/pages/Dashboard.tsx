import React from 'react';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAdminAccess();

  // If user is not admin, show access denied
  if (!isAdmin) {
    return <AccessDenied feature="the DFS Manager Portal Dashboard" />;
  }

  // For administrators, show only the DFS Manager Portal Bar
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* DFS Manager Portal Bar */}
      <div className="bg-gradient-to-r from-brand-800 to-brand-900 rounded-lg text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">
              DFS Manager Portal
            </h1>
            <p className="text-brand-200">Real-time Gas Station Management System</p>
            <div className="mt-3 flex items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                ✅ Full Visual Editing Enabled
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                🚀 Ready for Supabase Integration
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Administrator Access Confirmation */}
      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Administrator Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Welcome to the DFS Manager Portal. You have full administrative access to all system features.
          </p>
          <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
            Administrator Access Confirmed
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;