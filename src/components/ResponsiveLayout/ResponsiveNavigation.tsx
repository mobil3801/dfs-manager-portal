import React, { ReactNode, useState } from 'react';
import { useResponsiveLayout, useResponsiveNavigation } from '@/contexts/ResponsiveLayoutContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Home, Settings, User, BarChart3, Package, Users, ShoppingCart, FileText, Truck, DollarSign, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
  section?: 'main' | 'admin' | 'settings';
}

interface ResponsiveNavigationProps {
  logo?: ReactNode;
  items: NavigationItem[];
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

const defaultNavigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard', section: 'main' },
  { id: 'products', label: 'Products', icon: Package, href: '/products', section: 'main' },
  { id: 'employees', label: 'Employees', icon: Users, href: '/employees', section: 'main' },
  { id: 'sales', label: 'Sales', icon: BarChart3, href: '/sales', section: 'main' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/orders', section: 'main' },
  { id: 'vendors', label: 'Vendors', icon: Truck, href: '/vendors', section: 'main' },
  { id: 'licenses', label: 'Licenses', icon: FileText, href: '/licenses', section: 'main' },
  { id: 'salary', label: 'Salary', icon: DollarSign, href: '/salary', section: 'main' },
  { id: 'delivery', label: 'Delivery', icon: Truck, href: '/delivery', section: 'main' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', section: 'settings' },
];

export function ResponsiveNavigation({ 
  logo, 
  items = defaultNavigationItems, 
  className = '',
  onItemClick
}: ResponsiveNavigationProps) {
  const { device, layoutConfig } = useResponsiveLayout();
  const navigation = useResponsiveNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleItemClick = (item: NavigationItem) => {
    navigate(item.href);
    setMobileMenuOpen(false);
    onItemClick?.(item);
  };

  const isItemActive = (item: NavigationItem) => {
    return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
  };

  // Mobile Drawer Navigation
  if (navigation.showMobileDrawer) {
    return (
      <div className={cn('lg:hidden', className)}>
        <div className="flex items-center justify-between px-4 py-3 bg-background border-b">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <MobileNavigationContent 
                items={items} 
                onItemClick={handleItemClick} 
                isItemActive={isItemActive}
                logo={logo}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // Bottom Tabs Navigation (iOS style)
  if (navigation.showBottomTabs) {
    return (
      <div className={cn('fixed bottom-0 left-0 right-0 z-50 bg-background border-t', className)}>
        <div className="flex justify-around items-center py-2 px-4">
          {items.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                'min-w-0 flex-1 text-xs',
                isItemActive(item) 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
        {/* Safe area spacing for devices with home indicator */}
        {device.brand === 'Apple' && (
          <div className="h-safe-area-inset-bottom bg-background" />
        )}
      </div>
    );
  }

  // Horizontal Navigation (Desktop/Tablet)
  return (
    <nav className={cn('bg-background border-b', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          
          <div className="hidden md:flex md:items-center md:space-x-8">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  'relative',
                  isItemActive(item)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Mobile menu button for medium screens */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <MobileNavigationContent 
                  items={items} 
                  onItemClick={handleItemClick} 
                  isItemActive={isItemActive}
                  logo={logo}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileNavigationContent({ 
  items, 
  onItemClick, 
  isItemActive,
  logo 
}: {
  items: NavigationItem[];
  onItemClick: (item: NavigationItem) => void;
  isItemActive: (item: NavigationItem) => boolean;
  logo?: ReactNode;
}) {
  const { device } = useResponsiveLayout();

  const groupedItems = React.useMemo(() => {
    const groups = {
      main: items.filter(item => item.section === 'main' || !item.section),
      admin: items.filter(item => item.section === 'admin'),
      settings: items.filter(item => item.section === 'settings')
    };
    return groups;
  }, [items]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {logo}
        <Badge variant="outline" className="text-xs">
          {device.brand} {device.model}
        </Badge>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Navigation */}
        <div className="px-4 space-y-2">
          {groupedItems.main.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className={cn(
                'flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'relative',
                isItemActive(item)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Admin Section */}
        {groupedItems.admin.length > 0 && (
          <div className="px-4 mt-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Admin
            </div>
            <div className="space-y-2">
              {groupedItems.admin.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className={cn(
                    'flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'relative',
                    isItemActive(item)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {groupedItems.settings.length > 0 && (
          <div className="px-4 mt-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Settings
            </div>
            <div className="space-y-2">
              {groupedItems.settings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className={cn(
                    'flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'relative',
                    isItemActive(item)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div>{device.os} {device.osVersion}</div>
          <div>{device.browser} {device.browserVersion}</div>
          <div className="mt-1">
            {device.screenWidth}×{device.screenHeight} 
            {device.devicePixelRatio > 1 && ` @${device.devicePixelRatio}x`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Device-specific navigation component
export function DeviceOptimizedNavigation(props: ResponsiveNavigationProps) {
  const { device, optimizations } = useResponsiveLayout();

  // Add device-specific optimizations
  const optimizedProps = {
    ...props,
    className: cn(
      props.className,
      // Add safe area padding for notched devices
      device.brand === 'Apple' && device.model.includes('iPhone') && 'pt-safe-area-inset-top',
      // Samsung One UI optimizations
      device.brand === 'Samsung' && 'rounded-b-lg',
      // Reduce animations for low-end devices
      optimizations.reducedAnimations && 'transition-none'
    )
  };

  return <ResponsiveNavigation {...optimizedProps} />;
}

export default ResponsiveNavigation;
