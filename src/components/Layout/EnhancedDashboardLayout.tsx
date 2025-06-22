import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Home,
  Users,
  Package,
  FileText,
  Truck,
  Calendar,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  TrendingUp } from
'lucide-react';
import { Logo } from '@/components/Logo';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { useIsMobile } from '@/hooks/use-mobile';

const EnhancedDashboardLayout = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    requiredRole: null
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    requiredRole: null
  },
  {
    name: 'Sales Reports',
    href: '/sales',
    icon: TrendingUp,
    requiredRole: null
  },
  {
    name: 'Deliveries',
    href: '/delivery',
    icon: Truck,
    requiredRole: null
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    requiredRole: 'manager'
  },
  {
    name: 'Licenses',
    href: '/licenses',
    icon: Calendar,
    requiredRole: 'manager'
  },
  {
    name: 'Inventory',
    href: '/inventory/alerts',
    icon: BarChart3,
    requiredRole: null
  },
  {
    name: 'Salary',
    href: '/salary',
    icon: FileText,
    requiredRole: 'manager'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRole: null
  }];


  // Add admin-only items
  if (isAdmin()) {
    navigationItems.push({
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      requiredRole: 'admin'
    });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveRoute = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const canAccessRoute = (requiredRole: string | null) => {
    if (!requiredRole) return true;
    if (requiredRole === 'admin') return isAdmin();
    if (requiredRole === 'manager') return isManager();
    return true;
  };

  const NavigationItem = ({ item }: {item: any;}) => {
    if (!canAccessRoute(item.requiredRole)) return null;

    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);

    return (
      <button
        onClick={() => {
          navigate(item.href);
          if (isMobile) setSidebarOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
        isActive ?
        'bg-blue-600 text-white shadow-lg transform scale-[1.02]' :
        'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:transform hover:scale-[1.01]'}`
        }>

        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium">{item.name}</span>
      </button>);

  };

  const Sidebar = () =>
  <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Logo />
        {isMobile &&
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(false)}>

            <X className="h-5 w-5" />
          </Button>
      }
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) =>
      <NavigationItem key={item.href} item={item} />
      )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.Name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.Email}
            </p>
          </div>
        </div>
        <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start hover:bg-red-50 hover:border-red-200 hover:text-red-600">

          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>;


  // Desktop-specific styles
  const getDesktopContentStyles = () => {
    if (!isMobile) {
      return {
        marginLeft: '280px', // Sidebar width + padding
        width: 'calc(100% - 280px)',
        minHeight: '100vh'
      };
    }
    return {};
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile &&
      <div className="w-[280px] flex-shrink-0 fixed left-0 top-0 h-full z-30">
          <Sidebar />
        </div>
      }

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen &&
      <div className="fixed inset-0 z-50 flex">
          <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)} />

          <div className="relative flex flex-col w-80 bg-white max-w-[85vw]">
            <Sidebar />
          </div>
        </div>
      }

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${!isMobile ? 'ml-[280px]' : ''}`}
        style={getDesktopContentStyles()}>

        {/* Mobile Header */}
        {isMobile &&
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
            <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}>

              <Menu className="h-5 w-5" />
            </Button>
            <Logo />
            <div className="w-8" /> {/* Spacer for centering */}
          </header>
        }

        {/* Page Content with proper spacing */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className={`${
          isMobile ?
          'p-4' :
          'p-8 max-w-[calc(100vw-320px)]' // Account for sidebar + padding
          }`}>
            <div className="max-w-full mx-auto">
              <ComponentErrorBoundary>
                <Outlet />
              </ComponentErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>);

};

export default EnhancedDashboardLayout;