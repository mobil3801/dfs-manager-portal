
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <ComponentErrorBoundary>
          <Outlet />
        </ComponentErrorBoundary>
      </main>
    </div>);

};

export default DashboardLayout;