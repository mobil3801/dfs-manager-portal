import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Activity,
  LogOut,
  User } from
'lucide-react';

import Logo from '@/components/Logo';
import { PageErrorBoundary } from '@/components/ErrorBoundary';
import { useResponsiveLayout } from '@/hooks/use-mobile';


interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout, isAdmin } = useAuth();
  const responsive = useResponsiveLayout();

  // Responsive state management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(responsive.isMobile);

  // Auto-adjust sidebar based on device
  useEffect(() => {
    if (responsive.isMobile) {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
    } else if (responsive.isTablet) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [responsive.isMobile, responsive.isTablet]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mb-4" />
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>);

  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Base navigation items (available to all users)
  const baseNavigationItems: NavigationItem[] = [
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
  { name: 'All Licenses', path: '/licenses', icon: <FileText className="w-5 h-5" /> }];


  // Admin-only navigation items
  const adminNavigationItems: NavigationItem[] = [
  { name: 'Admin Panel', path: '/admin', icon: <Settings className="w-5 h-5" /> }];


  // Combine navigation items based on user role
  const navigationItems: NavigationItem[] = [
  ...baseNavigationItems,
  ...(isAdmin ? adminNavigationItems : [])];






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
    if (path === '/admin') return 'Admin Panel';
    if (path.startsWith('/admin/user-management')) return 'User Management';
    if (path.startsWith('/admin/site-management')) return 'Site Management';
    if (path.startsWith('/admin/sms-alert-management')) return 'SMS Alert Management';
    if (path.startsWith('/admin/system-logs')) return 'System Logs';
    if (path.startsWith('/admin/security-settings')) return 'Security Settings';
    if (path.startsWith('/admin/error-recovery')) return 'Error Recovery Center';
    if (path.startsWith('/admin/memory-monitoring')) return 'Memory Leak Monitoring';
    if (path.startsWith('/admin/database-monitoring')) return 'Database Connection Monitoring';
    if (path.startsWith('/admin/audit-monitoring')) return 'Audit & Security Monitoring';
    if (path.startsWith('/admin/database-autosync')) return 'Database Auto-Sync';
    if (path.startsWith('/admin/supabase-test')) return 'Supabase Connection Test';
    if (path.startsWith('/admin/development-monitoring')) return 'Development Monitoring';
    if (path.startsWith('/admin/role-testing')) return 'Role Testing & Customization';
    if (path.startsWith('/admin/user-creation-testing')) return 'User Creation Testing Suite';
    if (path.startsWith('/admin')) return 'Site & User Management';
    return 'DFS Manager';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && responsive.isMobile &&
      <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-gray-600/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      }

      {/* Sidebar - Fully responsive */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
      responsive.isMobile ?
      sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64' :
      'translate-x-0'} ${

      !responsive.isMobile && sidebarCollapsed ? 'w-16' : !responsive.isMobile ? 'w-64' : ''}`

      }>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 flex-shrink-0">
          <Logo
            size={sidebarCollapsed ? 'sm' : responsive.isMobile ? 'md' : 'md'}
            showText={!sidebarCollapsed}
            className={sidebarCollapsed ? 'justify-center w-full' : ''} />

          <div className="flex items-center space-x-2">
            {/* Minimize/Expand button for desktop/tablet */}
            {!responsive.isMobile &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}>
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            }
            {/* Close button for mobile */}
            {responsive.isMobile &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            }
          </div>
        </div>

        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        style={{ height: 'calc(100vh - 4rem)' }}>
          {navigationItems.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Main content - Responsive margin adjustment */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
      responsive.isMobile ?
      'ml-0' :
      sidebarCollapsed ?
      'ml-16' :
      'ml-64'}`
      }>
        {/* Top bar - Responsive */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 flex-shrink-0">
          {/* Mobile menu button */}
          {responsive.isMobile &&
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          }
          
          {/* Page title - Responsive */}
          <div className={`flex items-center ${responsive.isMobile ? 'flex-1 justify-center' : 'space-x-4'}`}>
            <h1 className={`font-semibold text-brand-900 ${
            responsive.isMobile ? 'text-lg' : 'text-xl'}`
            }>
              {responsive.isMobile ? getPageTitle().split(' ')[0] : getPageTitle()}
            </h1>
          </div>

          {/* User menu - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!responsive.isMobile &&
            <span className="text-sm text-gray-600">
                Welcome, {user.Name}
              </span>
            }
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600">
              <LogOut className="w-4 h-4 sm:mr-2" />
              {!responsive.isMobile && <span>Logout</span>}
            </Button>
          </div>
        </div>

        {/* Page content - Responsive padding */}
        <main className={`flex-1 overflow-y-auto ${
        responsive.isMobile ?
        'p-3' :
        responsive.isTablet ?
        'p-4' :
        'p-6 lg:p-8'}`
        }>
          <div className={`space-y-4 sm:space-y-6 max-w-full ${
          responsive.isDesktop ? 'container mx-auto' : ''}`
          }>
            <PageErrorBoundary pageName={getPageTitle()}>
              <Outlet />
            </PageErrorBoundary>
          </div>
        </main>
      </div>
    </div>);

};

export default DashboardLayout;