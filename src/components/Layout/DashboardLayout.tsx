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
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

interface NavigationItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavigationItem[];
}

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['employees']);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
    {
      name: 'Employees',
      icon: <Users className="w-5 h-5" />,
      children: [
        { name: 'All Employees', path: '/employees', icon: <Users className="w-4 h-4" /> },
        { name: 'Add Employee', path: '/employees/new', icon: <Users className="w-4 h-4" /> }
      ]
    },
    {
      name: 'Sales Reports',
      icon: <TrendingUp className="w-5 h-5" />,
      children: [
        { name: 'All Reports', path: '/sales', icon: <TrendingUp className="w-4 h-4" /> },
        { name: 'Add Report', path: '/sales/new', icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      name: 'Vendors',
      icon: <Building2 className="w-5 h-5" />,
      children: [
        { name: 'All Vendors', path: '/vendors', icon: <Building2 className="w-4 h-4" /> },
        { name: 'Add Vendor', path: '/vendors/new', icon: <Building2 className="w-4 h-4" /> }
      ]
    },
    {
      name: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      children: [
        { name: 'All Orders', path: '/orders', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Create Order', path: '/orders/new', icon: <ShoppingCart className="w-4 h-4" /> }
      ]
    },
    {
      name: 'Licenses',
      icon: <FileText className="w-5 h-5" />,
      children: [
        { name: 'All Licenses', path: '/licenses', icon: <FileText className="w-4 h-4" /> },
        { name: 'Add License', path: '/licenses/new', icon: <FileText className="w-4 h-4" /> }
      ]
    }
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ?
        prev.filter((name) => name !== itemName) :
        [...prev, itemName]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
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
                {isExpanded ?
                  <ChevronDown className="w-4 h-4" /> :
                  <ChevronRight className="w-4 h-4" />
                }
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderNavigationItem(child, depth + 1))}
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen &&
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      }

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BM</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Business Manager</span>
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
          {navigationItems.map((item) => renderNavigationItem(item))}
        </nav>
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
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;