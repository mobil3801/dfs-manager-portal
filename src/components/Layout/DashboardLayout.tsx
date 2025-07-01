
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
  Shield } from
'lucide-react';
import { Logo } from '@/components/Logo';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = () => {
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
    icon: FileText,
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
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive ?
        'bg-blue-100 text-blue-700 font-medium' :
        'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
        }>

        <Icon className="h-5 w-5" />
        <span>{item.name}</span>
      </button>);

  };

  const Sidebar = () =>
  <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) =>
      <NavigationItem key={item.href} item={item} />
      )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
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
        className="w-full justify-start">

          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>;


  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile &&
      <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
      }

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen &&
      <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white">
            <Sidebar />
          </div>
        </div>
      }

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile &&
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="text-sm text-muted-foreground">
            <ComponentErrorBoundary>
              <Outlet />
            </ComponentErrorBoundary>
          </div>
        </main>
      </div>
    </div>);

};

export default DashboardLayout;