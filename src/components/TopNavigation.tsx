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
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Menu,
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
  User,
  DollarSign,
  AlertTriangle,
  Building,
  UserPlus,
  Bell,
  BarChart3
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useIsMobile } from '@/hooks/use-mobile';

const TopNavigation = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
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

  const NavigationLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    if (!canAccessRoute(item.requiredRole)) return null;

    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);

    const baseClasses = mobile
      ? "flex items-center space-x-3 px-4 py-3 text-left w-full transition-colors"
      : "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap";

    const activeClasses = isActive
      ? "bg-blue-100 text-blue-700 font-medium"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    const handleClick = () => {
      navigate(item.href);
      if (mobile) setMobileMenuOpen(false);
    };

    if (item.subItems && !mobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`${baseClasses} ${activeClasses}`}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {item.subItems.map((subItem: any) => (
              <DropdownMenuItem
                key={subItem.href}
                onClick={() => navigate(subItem.href)}
                className="cursor-pointer"
              >
                {subItem.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span>{item.name}</span>
      </button>
    );
  };

  // Desktop Navigation
  const DesktopNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-1">
      {navigationItems.map((item) => (
        <NavigationLink key={item.href} item={item} />
      ))}
      {/* Settings as separate item */}
      <NavigationLink 
        key="/settings" 
        item={{
          name: 'Settings',
          href: '/settings',
          icon: Settings,
          requiredRole: null
        }} 
      />
    </nav>
  );

  // Mobile Navigation
  const MobileNavigation = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          {/* Logo in mobile menu */}
          <div className="flex items-center p-4 border-b">
            <Logo size="md" showText />
          </div>
          
          {/* Navigation items */}
          <div className="flex-1 py-4 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavigationLink key={item.href} item={item} mobile />
            ))}
            
            {/* Mobile sub-items for inventory */}
            {navigationItems.find(item => item.href === '/inventory/alerts')?.subItems?.map((subItem: any) => (
              <button
                key={subItem.href}
                onClick={() => {
                  navigate(subItem.href);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-8 py-2 text-left w-full transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="text-sm">{subItem.name}</span>
              </button>
            ))}
            
            {/* Settings */}
            <NavigationLink 
              key="/settings-mobile" 
              item={{
                name: 'Settings',
                href: '/settings',
                icon: Settings,
                requiredRole: null
              }} 
              mobile 
            />
          </div>
          
          {/* User section in mobile */}
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
                <p className="text-xs text-gray-500 truncate">
                  {user?.Email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // User Profile Dropdown
  const UserProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hidden lg:flex items-center space-x-2 px-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {user?.Name || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.Email}
            </p>
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
  );

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left section - Mobile menu + Logo */}
        <div className="flex items-center space-x-4">
          <MobileNavigation />
          <div className="flex items-center">
            <Logo size="sm" showText />
          </div>
        </div>

        {/* Center section - Desktop Navigation */}
        <div className="flex-1 flex justify-center px-8">
          <DesktopNavigation />
        </div>

        {/* Right section - User Profile */}
        <div className="flex items-center">
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;