import React from 'react';
import { Outlet } from 'react-router-dom';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { ResponsiveNavigation } from '@/components/ResponsiveLayout/ResponsiveNavigation';
import { DeviceOptimizedContainer } from '@/contexts/ResponsiveLayoutContext';
import { useResponsiveLayout } from '@/contexts/ResponsiveLayoutContext';
import { Home, Package, Users, BarChart3, ShoppingCart, Truck, FileText, DollarSign, Settings } from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard', section: 'main' as const },
  { id: 'products', label: 'Products', icon: Package, href: '/products', section: 'main' as const },
  { id: 'employees', label: 'Employees', icon: Users, href: '/employees', section: 'main' as const },
  { id: 'sales', label: 'Sales', icon: BarChart3, href: '/sales', section: 'main' as const },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/orders', section: 'main' as const },
  { id: 'vendors', label: 'Vendors', icon: Truck, href: '/vendors', section: 'main' as const },
  { id: 'licenses', label: 'Licenses', icon: FileText, href: '/licenses', section: 'main' as const },
  { id: 'salary', label: 'Salary', icon: DollarSign, href: '/salary', section: 'main' as const },
  { id: 'delivery', label: 'Delivery', icon: Truck, href: '/delivery', section: 'main' as const },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', section: 'settings' as const },
];

const DashboardLayout = () => {
  const { device } = useResponsiveLayout();

  const logo = (
    <div className="flex items-center space-x-2">
      <img 
        src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
        alt="DFS Manager" 
        className="h-8 w-8 object-contain"
      />
      {!device.isMobile && (
        <span className="text-xl font-bold text-gray-900">DFS Manager</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navigation */}
      <ResponsiveNavigation 
        logo={logo}
        items={navigationItems}
        className="sticky top-0 z-50"
      />
      
      {/* Main Content Area */}
      <main className="flex-1">
        <DeviceOptimizedContainer className="py-6">
          <ComponentErrorBoundary>
            <Outlet />
          </ComponentErrorBoundary>
        </DeviceOptimizedContainer>
      </main>
      
      {/* Bottom padding for bottom tab navigation */}
      {device.isMobile && (
        <div className="h-16" />
      )}
    </div>
  );
};

export default DashboardLayout;