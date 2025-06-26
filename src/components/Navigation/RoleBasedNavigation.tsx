
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Shield, 
  DollarSign, 
  AlertTriangle, 
  Settings,
  Building,
  CreditCard,
  Receipt,
  Archive
} from 'lucide-react';
import useRolePermissions from '@/hooks/use-role-permissions';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiredPermission?: {
    feature: string;
    action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  };
  requiredRole?: 'Administrator' | 'Management' | 'Employee';
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredPermission: { feature: 'dashboard', action: 'view' }
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    requiredPermission: { feature: 'products', action: 'view' }
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    requiredPermission: { feature: 'employees', action: 'view' }
  },
  {
    name: 'Sales Reports',
    href: '/sales',
    icon: FileText,
    requiredPermission: { feature: 'sales', action: 'view' }
  },
  {
    name: 'Vendors',
    href: '/vendors',
    icon: Building,
    requiredPermission: { feature: 'vendors', action: 'view' }
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    requiredPermission: { feature: 'orders', action: 'view' }
  },
  {
    name: 'Licenses',
    href: '/licenses',
    icon: Shield,
    requiredPermission: { feature: 'licenses', action: 'view' }
  },
  {
    name: 'Payroll',
    href: '/salary',
    icon: DollarSign,
    requiredPermission: { feature: 'salary', action: 'view' }
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Archive,
    requiredPermission: { feature: 'inventory', action: 'view' },
    children: [
      {
        name: 'Alerts',
        href: '/inventory/alerts',
        icon: AlertTriangle,
        requiredPermission: { feature: 'inventory', action: 'view' }
      },
      {
        name: 'Settings',
        href: '/inventory/settings',
        icon: Settings,
        requiredPermission: { feature: 'inventory', action: 'manage' }
      },
      {
        name: 'Gas Delivery',
        href: '/inventory/gas-delivery',
        icon: Truck,
        requiredPermission: { feature: 'inventory', action: 'view' }
      }
    ]
  },
  {
    name: 'Delivery',
    href: '/delivery',
    icon: Truck,
    requiredPermission: { feature: 'delivery', action: 'view' }
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: 'Admin Panel',
    requiredPermission: { feature: 'settings', action: 'view' }
  }
];

interface RoleBasedNavigationProps {
  className?: string;
  onItemClick?: () => void;
}

const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ 
  className,
  onItemClick 
}) => {
  const location = useLocation();
  const { 
    hasPermission, 
    hasAnyPermission, 
    isAdmin, 
    isManagement, 
    isEmployee,
    rolePermissions 
  } = useRolePermissions();

  console.log('RoleBasedNavigation: Current role permissions', {
    role: rolePermissions?.role,
    station: rolePermissions?.station,
    isAdmin,
    isManagement,
    isEmployee
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const canAccessItem = (item: NavigationItem): boolean => {
    // Check role-based access
    if (item.requiredRole) {
      if (item.requiredRole === 'Administrator' && !isAdmin) return false;
      if (item.requiredRole === 'Management' && !isAdmin && !isManagement) return false;
    }

    // Check permission-based access
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission.feature, item.requiredPermission.action);
    }

    return true;
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    if (!canAccessItem(item)) {
      return null;
    }

    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <div key={item.href}>
        <Link
          to={item.href}
          onClick={onItemClick}
          className={cn(
            'flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            depth > 0 && 'ml-4 pl-8',
            active
              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <Icon className={cn('h-5 w-5', active ? 'text-blue-600' : 'text-gray-400')} />
          <span>{item.name}</span>
          {item.badge && (
            <Badge variant={active ? 'default' : 'secondary'} className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Link>

        {/* Render children if they exist and parent is accessible */}
        {item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderNavigationItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('space-y-1', className)}>
      {/* Role indicator */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">ROLE</span>
          <Badge 
            variant={isAdmin ? 'destructive' : isManagement ? 'default' : 'secondary'}
            className="text-xs"
          >
            {rolePermissions?.role || 'Loading...'}
          </Badge>
        </div>
        {rolePermissions?.station && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-medium text-gray-500">STATION</span>
            <Badge variant="outline" className="text-xs">
              {rolePermissions.station}
            </Badge>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 mx-4" />

      {/* Navigation items */}
      <div className="space-y-1">
        {navigationItems.map(item => renderNavigationItem(item))}
      </div>

      {/* Admin section */}
      {isAdmin && (
        <>
          <div className="h-px bg-gray-200 mx-4" />
          <div className="px-4 py-2">
            <span className="text-xs font-medium text-gray-500">ADMINISTRATION</span>
          </div>
          <div className="space-y-1">
            <Link
              to="/admin"
              onClick={onItemClick}
              className={cn(
                'flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive('/admin')
                  ? 'bg-red-100 text-red-700 border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Shield className={cn('h-5 w-5', isActive('/admin') ? 'text-red-600' : 'text-gray-400')} />
              <span>Admin Panel</span>
              <Badge variant="destructive" className="ml-auto text-xs">
                Admin Only
              </Badge>
            </Link>
          </div>
        </>
      )}

      {/* Quick actions for different roles */}
      <div className="h-px bg-gray-200 mx-4" />
      <div className="px-4 py-2">
        <span className="text-xs font-medium text-gray-500">QUICK ACTIONS</span>
      </div>
      <div className="space-y-1 px-4">
        {isEmployee && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.location.href = '/sales/new'}
          >
            <Receipt className="h-4 w-4 mr-2" />
            New Sales Report
          </Button>
        )}
        {isManagement && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.location.href = '/employees'}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Staff
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        )}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
