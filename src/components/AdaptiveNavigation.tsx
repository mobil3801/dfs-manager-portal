import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Package, Users, TrendingUp, Truck, FileText,
  Calendar, Settings, Shield, Menu, X, ChevronRight,
  BarChart3, AlertCircle, Database, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
  adminOnly?: boolean;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'products', label: 'Products', icon: Package, path: '/products' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
  { id: 'sales', label: 'Sales Reports', icon: TrendingUp, path: '/sales' },
  { id: 'delivery', label: 'Delivery', icon: Truck, path: '/delivery' },
  { id: 'licenses', label: 'Licenses', icon: FileText, path: '/licenses' },
  { id: 'salary', label: 'Salary', icon: Calendar, path: '/salary' },
  { id: 'inventory', label: 'Inventory', icon: BarChart3, path: '/inventory/alerts' },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    path: '/admin',
    adminOnly: true,
    children: [
      { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
      { id: 'sites', label: 'Site Management', icon: Database, path: '/admin/sites' },
      { id: 'alerts', label: 'SMS Alerts', icon: Bell, path: '/admin/sms-alerts' }
    ]
  },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

const AdaptiveNavigation: React.FC = () => {
  const device = useDeviceAdaptive();
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isAdmin = user?.role === 'Administrator';
  const filteredNavItems = navigationItems.filter((item) => !item.adminOnly || isAdmin);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleExpandedItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const isActiveRoute = (path: string) => location.pathname.startsWith(path);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation item component with enhanced touch optimization
  const NavItem: React.FC<{ item: NavigationItem; depth?: number; inMobileMenu?: boolean }> = ({ 
    item, 
    depth = 0,
    inMobileMenu = false 
  }) => {
    const isActive = isActiveRoute(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    const getItemClasses = () => {
      const baseClasses = `
        flex items-center justify-between rounded-lg transition-all duration-200
        ${device.hasTouch ? `min-h-[${device.touchTargetSize}px]` : 'min-h-[32px]'}
        ${depth > 0 ? 'ml-4' : ''}
      `;

      const stateClasses = isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 shadow-sm'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';

      return `${baseClasses} ${stateClasses} p-3`;
    };

    const getFontClasses = () => {
      if (device.optimalFontSize === 'large') return 'text-lg';
      if (device.optimalFontSize === 'small') return 'text-sm';
      return 'text-base';
    };

    const getIconSize = () => {
      if (device.isMobile) return 'w-5 h-5';
      return 'w-4 h-4';
    };

    return (
      <div className={depth > 0 ? 'ml-4' : ''}>
        <motion.div
          whileHover={device.supportsHover ? { scale: 1.02 } : {}}
          whileTap={{ scale: 0.98 }}
          className={getItemClasses()}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpandedItem(item.id)}
              className="flex items-center flex-1 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} menu`}
            >
              <item.icon className={`${getIconSize()} mr-3 flex-shrink-0`} />
              <span className={`${getFontClasses()} font-medium truncate`}>
                {item.label}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ) : (
            <Link
              to={item.path}
              className="flex items-center flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              onClick={() => inMobileMenu && setIsMobileMenuOpen(false)}
              aria-label={`Navigate to ${item.label}`}
            >
              <item.icon className={`${getIconSize()} mr-3 flex-shrink-0`} />
              <span className={`${getFontClasses()} font-medium truncate`}>
                {item.label}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )}
          
          {hasChildren && (
            <ChevronRight
              className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            />
          )}
        </motion.div>

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: device.animationDuration / 1000 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1">
                  {item.children?.map((child) => (
                    <NavItem 
                      key={child.id} 
                      item={child} 
                      depth={depth + 1} 
                      inMobileMenu={inMobileMenu}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  // Desktop Sidebar Navigation
  if (device.preferredNavigation === 'sidebar') {
    return (
      <motion.aside
        initial={{ x: -device.sidebarWidth }}
        animate={{ x: 0 }}
        className={`
          fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-700 shadow-lg
        `}
        style={{ width: device.sidebarWidth }}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Logo />
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {filteredNavItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      </motion.aside>
    );
  }

  // Mobile Bottom Navigation
  if (device.preferredNavigation === 'bottom') {
    const mainItems = filteredNavItems.slice(0, 4);

    return (
      <>
        {/* Mobile Header */}
        <header 
          className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
          style={{ height: device.navigationHeight }}
        >
          <div className="flex items-center justify-between p-4 h-full">
            <Logo />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-around p-2">
            {mainItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px]
                    ${isActive
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] text-gray-600 dark:text-gray-400"
              aria-label="Open more menu"
            >
              <Menu className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black bg-opacity-50"
                onClick={toggleMobileMenu}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed right-0 top-0 z-50 h-full w-80 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold">Menu</span>
                  <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <nav className="p-4 space-y-2">
                  {filteredNavItems.map((item) => (
                    <NavItem key={item.id} item={item} inMobileMenu={true} />
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Tablet Top Navigation
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      style={{ height: device.navigationHeight }}
    >
      <div className="flex items-center justify-between p-4 h-full">
        <Logo />
        <nav className="flex items-center space-x-1">
          {filteredNavItems.slice(0, 6).map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-colors
                  ${isActive
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }
                `}
                aria-label={`Navigate to ${item.label}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
            <Menu className="w-5 h-5" />
          </Button>
        </nav>
      </div>

      {/* Tablet Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <nav className="p-4 grid grid-cols-2 gap-2">
              {filteredNavItems.slice(6).map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdaptiveNavigation;