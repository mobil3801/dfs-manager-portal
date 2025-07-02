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
  ChevronDown,
  DollarSign,
  Menu
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
    { path: '/salary', label: 'Salary', icon: DollarSign },
    { path: '/inventory/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/delivery', label: 'Delivery', icon: Truck },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  // Add admin-only items
  if (isAdmin()) {
    navItems.splice(-1, 0, { path: '/users', label: 'User Management', icon: Shield });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                className="h-8 w-auto" 
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
                alt="DFS Manager" 
              />
              <span className="ml-2 text-xl font-bold text-gray-900">DFS Manager</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}

              {/* More dropdown for additional items */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <Menu className="w-4 h-4 mr-2" />
                    More
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {navItems.slice(6).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center w-full px-2 py-2 text-sm ${
                            isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex md:items-center md:space-x-2">
                  <span className="text-sm text-gray-700">
                    Welcome, {userProfile?.name || user.Name || user.Email}
                  </span>
                  {isAdmin() && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.avatar} alt={userProfile?.name} />
                        <AvatarFallback>
                          {(userProfile?.name || user.Name || user.Email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{userProfile?.name || user.Name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.Email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
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