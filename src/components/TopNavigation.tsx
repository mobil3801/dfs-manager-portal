import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  Package,
  FileText,
  Truck,
  Calendar,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  DollarSign,
  AlertTriangle,
  Building,
  Menu,
  X
} from 'lucide-react';

const TopNavigation = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      name: 'Sales',
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
      name: 'Inventory',
      href: '/inventory/alerts',
      icon: AlertTriangle,
      requiredRole: null,
      subItems: [
        { name: 'Alerts', href: '/inventory/alerts' },
        { name: 'Settings', href: '/inventory/settings' },
        { name: 'Gas Delivery', href: '/inventory/gas-delivery' }
      ]
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      requiredRole: 'manager'
    },
    {
      name: 'Vendors',
      href: '/vendors',
      icon: Building,
      requiredRole: 'manager'
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: Package,
      requiredRole: 'manager'
    },
    {
      name: 'Licenses',
      href: '/licenses',
      icon: Calendar,
      requiredRole: 'manager'
    },
    {
      name: 'Salary',
      href: '/salary',
      icon: DollarSign,
      requiredRole: 'manager'
    }
  ];

  // Add admin-only items
  if (isAdmin()) {
    navigationItems.push({
      name: 'Admin',
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

  const NavigationLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    if (!canAccessRoute(item.requiredRole)) return null;

    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);

    const baseClasses = mobile
      ? "flex items-center space-x-3 px-4 py-3 text-left w-full transition-colors text-sm font-medium"
      : "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium";

    const activeClasses = isActive
      ? "bg-blue-100 text-blue-700 shadow-sm"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

    const handleClick = () => {
      navigate(item.href);
      if (mobile) setMobileMenuOpen(false);
    };

    if (item.subItems && !mobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`${baseClasses} ${activeClasses}`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.name}</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {item.subItems.map((subItem: any) => (
              <DropdownMenuItem
                key={subItem.href}
                onClick={() => navigate(subItem.href)}
                className="cursor-pointer">
                {subItem.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (item.subItems && mobile) {
      return (
        <div>
          <button className={`${baseClasses} ${activeClasses}`}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </button>
          <div className="ml-8 space-y-1">
            {item.subItems.map((subItem: any) => (
              <button
                key={subItem.href}
                onClick={() => {
                  navigate(subItem.href);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-2 text-left w-full transition-colors text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                <span>{subItem.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <button onClick={handleClick} className={`${baseClasses} ${activeClasses}`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{item.name}</span>
      </button>
    );
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
                  alt="DFS Manager" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-gray-900 hidden sm:block">DFS Manager</span>
              </div>
            </div>

            {/* Center Section - Desktop Navigation (Full Width) */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-start ml-8">
              {navigationItems.map((item) => (
                <NavigationLink key={item.href} item={item} />
              ))}
              <NavigationLink
                item={{
                  name: 'Settings',
                  href: '/settings',
                  icon: Settings,
                  requiredRole: null
                }}
              />
            </nav>

            {/* Right Section - User Profile */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.Name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.Email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)} />
        
        {/* Menu Panel */}
        <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <img 
                  src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
                  alt="DFS Manager" 
                  className="h-8 w-auto"
                />
                <span className="text-lg font-bold text-gray-900">DFS Manager</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Navigation Items */}
            <div className="flex-1 py-4 overflow-y-auto space-y-1">
              {navigationItems.map((item) => (
                <NavigationLink key={item.href} item={item} mobile />
              ))}
              <NavigationLink
                item={{
                  name: 'Settings',
                  href: '/settings',
                  icon: Settings,
                  requiredRole: null
                }}
                mobile
              />
            </div>
            
            {/* User Section */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">
                    {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.Name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.Email}</p>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNavigation;