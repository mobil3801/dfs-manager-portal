import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - appears on every page horizontally */}
      <TopNavigation />
      
      {/* Main Content - Full width without sidebar */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ComponentErrorBoundary>
            <Outlet />
          </ComponentErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;