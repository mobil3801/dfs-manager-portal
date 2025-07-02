import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Pages that don't need navigation (login, auth success, etc.)
  const publicPaths = ['/login', '/onauthsuccess', '/resetpassword'];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ComponentErrorBoundary>
          {children}
        </ComponentErrorBoundary>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navigation />
      
      {/* Back Button - positioned at top left of content area */}
      


      
      {/* Main Content */}
      <main className="bg-[#2687f51f] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ComponentErrorBoundary>
          {children}
        </ComponentErrorBoundary>
      </main>
    </div>);

};

export default AppLayout;