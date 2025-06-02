import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Home,
  Package,
  Users,
  TrendingUp,
  Building2,
  ShoppingCart,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Fuel,
  Truck,
  Settings,
  Shield,
  Database,
  UserCheck,
  Globe,
  MessageSquare,
  Activity } from
'lucide-react';

import Logo from '@/components/Logo';
import { PageErrorBoundary } from '@/components/ErrorBoundary';


interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // All navigation items in one place
  const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { name: 'All Products', path: '/products', icon: <Package className="w-5 h-5" /> },
  { name: 'All Employees', path: '/employees', icon: <Users className="w-5 h-5" /> },
  { name: 'Sales Reports', path: '/sales', icon: <TrendingUp className="w-5 h-5" /> },
  { name: 'Add Report', path: '/sales/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'Salary Records', path: '/salary', icon: <DollarSign className="w-5 h-5" /> },
  { name: 'Inventory Alerts', path: '/inventory/alerts', icon: <AlertTriangle className="w-5 h-5" /> },
  { name: 'New Delivery', path: '/delivery', icon: <Truck className="w-5 h-5" /> },
  { name: 'All Vendors', path: '/vendors', icon: <Building2 className="w-5 h-5" /> },
  { name: 'All Orders', path: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { name: 'Create Order', path: '/orders/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'All Licenses', path: '/licenses', icon: <FileText className="w-5 h-5" /> },
  { name: 'User Management', path: '/admin/users', icon: <UserCheck className="w-5 h-5" /> },
  { name: 'Site Management', path: '/admin/site', icon: <Globe className="w-5 h-5" /> },
  { name: 'SMS Alerts', path: '/admin/sms-alerts', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'System Logs', path: '/admin/logs', icon: <Database className="w-5 h-5" /> },
  { name: 'Security Settings', path: '/admin/security', icon: <Shield className="w-5 h-5" /> },
  { name: 'Error Recovery', path: '/admin/error-recovery', icon: <AlertTriangle className="w-5 h-5" /> },
  { name: 'Memory Monitoring', path: '/admin/memory-monitoring', icon: <Activity className="w-5 h-5" /> },
  { name: 'Database Monitoring', path: '/admin/database-monitoring', icon: <Database className="w-5 h-5" /> }];





  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.path;

    return (
      <Button
        key={item.path}
        variant="ghost"
        className={`w-full justify-start text-left h-11 hover:bg-gray-100 transition-colors px-4 ${
        isActive ? 'bg-brand-50 text-brand-800 border-r-2 border-brand-700' : ''}`
        }
        onClick={() => handleNavigation(item.path)}
        title={sidebarCollapsed ? item.name : undefined}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          {item.icon}
          {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
        </div>
      </Button>);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/employees')) return 'Employees';
    if (path.startsWith('/sales')) return 'Sales Reports';
    if (path.startsWith('/salary')) return 'Salary Management';
    if (path.startsWith('/inventory')) return 'Inventory Management';
    if (path.startsWith('/delivery')) return 'Delivery Management';
    if (path.startsWith('/vendors')) return 'Vendors';
    if (path.startsWith('/orders')) return 'Orders';
    if (path.startsWith('/licenses')) return 'Licenses & Certificates';
    if (path.startsWith('/admin/users')) return 'User Management';
    if (path.startsWith('/admin/site')) return 'Site Management';
    if (path.startsWith('/admin/sms-alerts')) return 'SMS Alert Management';
    if (path.startsWith('/admin/logs')) return 'System Logs';
    if (path.startsWith('/admin/security')) return 'Security Settings';
    if (path.startsWith('/admin/error-recovery')) return 'Error Recovery Center';
    if (path.startsWith('/admin/memory-monitoring')) return 'Memory Leak Monitoring';
    if (path.startsWith('/admin/database-monitoring')) return 'Database Connection Monitoring';
    if (path.startsWith('/admin')) return 'Site & User Management';
    return 'DFS Manager';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen &&
      <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      }

      {/* Sidebar - Fixed on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-16 w-16' : 'lg:w-64 w-64'}`
      }>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <Logo
            size={sidebarCollapsed ? 'sm' : 'md'}
            showText={!sidebarCollapsed}
            className={sidebarCollapsed ? 'justify-center w-full' : ''} />

          <div className="flex items-center space-x-2">
            {/* Minimize/Expand button for desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}>
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400" style={{ height: 'calc(100vh - 4rem)' }}>
          {navigationItems.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Main content - Adjusted for fixed sidebar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}>

            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-brand-900">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden lg:inline">
              Gas Station Management
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="space-y-6">
            <PageErrorBoundary pageName={getPageTitle()}>
              <Outlet />
            </PageErrorBoundary>
          </div>
        </main>
      </div>
      

    </div>);

};

export default DashboardLayout;