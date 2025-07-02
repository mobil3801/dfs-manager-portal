import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  User,
  Shield,
  ChevronDown
} from 'lucide-react';

const Navigation = () => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/sales', label: 'Sales', icon: FileText },
    { path: '/vendors', label: 'Vendors', icon: Truck },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/licenses', label: 'Licenses', icon: CreditCard },
    { path: '/salary', label: 'Salary', icon: CreditCard },
    { path: '/inventory/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/delivery', label: 'Delivery', icon: Truck },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Add admin-only items
  if (isAdmin()) {
    navItems.splice(-1, 0, { path: '/users', label: 'User Management', icon: Shield });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img 
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">DFS Manager</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user?.Name} />
                    <AvatarFallback>
                      {(userProfile?.full_name || user?.Name || user?.Email || '')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || user?.Name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userProfile?.role && (
                        <Badge variant="secondary" className="text-xs">
                          {userProfile.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || user?.Name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.Email}</p>
                  {userProfile?.role && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {userProfile.role}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem asChild>
                    <Link to="/users" className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      User Management
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 8).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 text-xs rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
