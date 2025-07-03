import React, { useState, useEffect } from 'react';
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
  Building,
  Menu,
  X
} from 'lucide-react';

const TopNavigation = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // All navigation items displayed in the top bar
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
      name: 'Delivery',
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
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      requiredRole: null
    }
  ];

  // Add admin section if user is admin
  if (isAdmin()) {
    navigationItems.push({
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      requiredRole: 'admin'
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
      ? "flex items-center space-x-3 px-4 py-3 text-left w-full transition-colors text-sm font-medium rounded-md mx-2"
      : "flex items-center space-x-1.5 px-2.5 py-2 rounded-md transition-all duration-200 whitespace-nowrap text-sm font-medium hover:scale-105 min-w-fit";

    const activeClasses = isActive
      ? "bg-blue-600 text-white shadow-md"
      : mobile
        ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm";

    const handleClick = () => {
      navigate(item.href);
      if (mobile) setMobileMenuOpen(false);
    };

    return (
      <button onClick={handleClick} className={`${baseClasses} ${activeClasses}`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className={mobile ? "" : "hidden xl:inline"}>{item.name}</span>
      </button>
    );
  };

  return (
    <>
      {/* Main Navigation Bar - All Menu Items in Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section - Logo and Brand */}
            <div className="flex items-center space-x-4 flex-shrink-0 min-w-0">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="DFS Manager"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">DFS Manager</span>
            </div>

            {/* Center Section - All Navigation Items in Horizontal Line (Desktop) */}
            <nav className="hidden lg:flex items-center flex-1 justify-center max-w-6xl mx-4">
              <div className="flex items-center space-x-0.5 px-4 overflow-x-auto scrollbar-hide">
                {navigationItems.filter(item => canAccessRoute(item.requiredRole)).map((item) => (
                  <NavigationLink key={item.href} item={item} />
                ))}
              </div>
            </nav>

            {/* Right Section - User Profile and Mobile Menu */}
            <div className="flex items-center space-x-2 flex-shrink-0 min-w-0">
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 h-auto">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden xl:block text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-none truncate">
                        {user?.Name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 leading-none mt-0.5 truncate">{user?.Email}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-gray-500 flex-shrink-0" />
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

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu - Right Side Slide Out Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel - Slides from Right Side */}
          <div className={`fixed top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              
              {/* Navigation Items */}
              <div className="flex-1 py-4 overflow-y-auto">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <NavigationLink key={item.href} item={item} mobile />
                  ))}
                </div>
              </div>
              
              {/* User Section */}
              <div className="border-t p-4 bg-gray-50">
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
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavigation;