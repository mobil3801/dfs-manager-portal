import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Home,
  Package,
  Users,
  FileText,
  Truck,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  ShoppingCart,
  FileCheck,
  MapPin,
  User,
  LogOut,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';

const ResponsiveMobileNavigation: React.FC = () => {
  const { deviceInfo, deviceOptimizations } = useMobileResponsive();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home, section: 'main' },
    { path: '/products', label: 'Products', icon: Package, section: 'main' },
    { path: '/employees', label: 'Employees', icon: Users, section: 'main' },
    { path: '/sales', label: 'Sales Reports', icon: FileText, section: 'main' },
    { path: '/vendors', label: 'Vendors', icon: Truck, section: 'main' },
    { path: '/orders', label: 'Orders', icon: ShoppingCart, section: 'main' },
    { path: '/licenses', label: 'Licenses', icon: FileCheck, section: 'main' },
    { path: '/salary', label: 'Salary', icon: DollarSign, section: 'main' },
    { path: '/delivery', label: 'Delivery', icon: MapPin, section: 'main' },
    { path: '/settings', label: 'Settings', icon: Settings, section: 'secondary' },
    { path: '/admin', label: 'Admin', icon: Shield, section: 'secondary' },
  ];

  const filteredItems = navigationItems.filter(item => {
    if (item.path === '/admin' && user?.role !== 'admin') return false;
    return true;
  });

  useEffect(() => {
    const currentItem = navigationItems.find(item => 
      location.pathname.startsWith(item.path) && item.path !== '/'
    );
    setActiveSection(currentItem?.section || 'main');
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    // Add haptic feedback for mobile devices
    if (deviceOptimizations.enableHapticFeedback && (window as any).navigator?.vibrate) {
      (window as any).navigator.vibrate(10);
    }
  };

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="h-4 w-4" />;
    if (deviceInfo.isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const isCurrentPath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Mobile-first navigation for small screens
  if (deviceInfo.isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <img 
              src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold text-gray-900 dark:text-white">
              DFS Manager
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {getDeviceIcon()}
              <span className="ml-1">{deviceInfo.operatingSystem}</span>
            </Badge>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-2",
                    deviceOptimizations.touchTargetSize === 'large' && "p-3"
                  )}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-80 p-0 bg-white dark:bg-gray-900"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-2">
                      {filteredItems.map((item) => {
                        const isActive = isCurrentPath(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200",
                              deviceOptimizations.touchTargetSize === 'large' && "py-4",
                              isActive
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                        deviceOptimizations.touchTargetSize === 'large' && "py-4"
                      )}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    );
  }

  // Tablet and desktop navigation
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold text-gray-900 dark:text-white">
              DFS Manager
            </span>
            
            <Badge variant="outline" className="text-xs">
              {getDeviceIcon()}
              <span className="ml-1">{deviceInfo.operatingSystem}</span>
            </Badge>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {filteredItems.slice(0, 6).map((item) => {
              const isActive = isCurrentPath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'User'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveMobileNavigation;