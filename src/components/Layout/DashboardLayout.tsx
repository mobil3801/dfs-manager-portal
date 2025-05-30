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
  Plus } from
'lucide-react';
import QuickAccessToolbar from '@/components/QuickAccessToolbar';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { name: 'All Products', path: '/products', icon: <Package className="w-5 h-5" /> },
  { name: 'Add Product', path: '/products/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'All Employees', path: '/employees', icon: <Users className="w-5 h-5" /> },
  { name: 'Add Employee', path: '/employees/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'Sales Reports', path: '/sales', icon: <TrendingUp className="w-5 h-5" /> },
  { name: 'Add Report', path: '/sales/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'All Vendors', path: '/vendors', icon: <Building2 className="w-5 h-5" /> },
  { name: 'Add Vendor', path: '/vendors/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'All Orders', path: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { name: 'Create Order', path: '/orders/new', icon: <Plus className="w-5 h-5" /> },
  { name: 'All Licenses', path: '/licenses', icon: <FileText className="w-5 h-5" /> },
  { name: 'Add License', path: '/licenses/new', icon: <Plus className="w-5 h-5" /> }];



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
        className={`w-full justify-start text-left h-11 px-4 hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''}`
        }
        onClick={() => handleNavigation(item.path)}>
        <div className="flex items-center space-x-3">
          {item.icon}
          <span className="font-medium">{item.name}</span>
        </div>
      </Button>);

  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/employees')) return 'Employees';
    if (path.startsWith('/sales')) return 'Sales Reports';
    if (path.startsWith('/vendors')) return 'Vendors';
    if (path.startsWith('/orders')) return 'Orders';
    if (path.startsWith('/licenses')) return 'Licenses & Certificates';
    return 'Business Management';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen &&
      <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      }

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      }>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DFS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DFS Manager Portal</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}>

            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
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
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Gas Station Management
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Quick Access Toolbar */}
      <QuickAccessToolbar />
    </div>);

};

export default DashboardLayout;