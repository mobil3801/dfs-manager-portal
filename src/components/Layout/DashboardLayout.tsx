import React, { useState } from 'react';
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
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavigationItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
  permission?: string;
}

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['employees']);
  const { user, userProfile, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" />, permission: 'dashboard' },
    { name: 'Add/Edit Products', path: '/products/edit', icon: <Package className="w-5 h-5" />, permission: 'products' },
    { name: 'Products List', path: '/products', icon: <Package className="w-5 h-5" />, permission: 'products' },
    { name: 'Add/Edit Employee', path: '/employees/edit', icon: <Users className="w-5 h-5" />, permission: 'employees' },
    {
      name: 'Employee List',
      icon: <Users className="w-5 h-5" />,
      permission: 'employees',
      children: [
        { name: 'MOBIL', path: '/employees/MOBIL', icon: <Building2 className="w-4 h-4" /> },
        { name: 'AMOCO ROSEDALE', path: '/employees/AMOCO ROSEDALE', icon: <Building2 className="w-4 h-4" /> },
        { name: 'AMOCO BROOKLYN', path: '/employees/AMOCO BROOKLYN', icon: <Building2 className="w-4 h-4" /> },
        { name: 'All Employees', path: '/employees', icon: <Users className="w-4 h-4" /> }
      ]
    },
    { name: 'Add/Edit Daily Sales Report', path: '/sales/edit', icon: <TrendingUp className="w-5 h-5" />, permission: 'sales' },
    { name: 'Daily Sales Report', path: '/sales', icon: <TrendingUp className="w-5 h-5" />, permission: 'sales' },
    { name: 'Add/Edit Vendor Contact & Information', path: '/vendors/edit', icon: <Building2 className="w-5 h-5" />, permission: 'vendors' },
    { name: 'Vendor Contact & Information', path: '/vendors', icon: <Building2 className="w-5 h-5" />, permission: 'vendors' },
    { name: 'Create Order List', path: '/orders/edit', icon: <ShoppingCart className="w-5 h-5" />, permission: 'orders' },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart className="w-5 h-5" />, permission: 'orders' },
    { name: 'License & Certificate', path: '/licenses', icon: <FileText className="w-5 h-5" />, permission: 'licenses' }
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    if (item.permission && !hasPermission(item.permission, 'read')) {
      return null;
    }

    const isActive = location.pathname === item.path;
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible key={item.name} open={isExpanded} onOpenChange={() => toggleExpanded(item.name)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start text-left h-11 px-4 ${
                depth > 0 ? 'pl-8' : ''
              } hover:bg-gray-100 transition-colors`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavigationItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.path}
        variant="ghost"
        className={`w-full justify-start text-left h-11 px-4 ${
          depth > 0 ? 'pl-8' : ''
        } hover:bg-gray-100 transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''
        }`}
        onClick={() => item.path && handleNavigation(item.path)}
      >
        <div className="flex items-center space-x-3">
          {item.icon}
          <span className="font-medium">{item.name}</span>
        </div>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DFQ</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Dream Frame Queens</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map(item => renderNavigationItem(item))}
        </nav>

        {/* User info and logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user?.Name || 'User'}</p>
            <p className="text-xs text-gray-500">{userProfile?.role}</p>
            {userProfile?.station && (
              <p className="text-xs text-gray-500">{userProfile.station}</p>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {location.pathname === '/dashboard' ? 'Dashboard' : ''}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, {user?.Name}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;