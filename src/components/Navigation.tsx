import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.Name ? user.Name[0].toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    return userProfile?.full_name || user?.Name || 'User';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="text-[#3c63b7] text-xl font-bold hidden sm:block">
                DFS Manager
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </span>
                    {userProfile?.role && (
                      <Badge variant="secondary" className="text-xs">
                        {userProfile.role}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <span className="text-sm font-medium">{getUserDisplayName()}</span>
                  <span className="text-xs text-gray-500">{user?.Email}</span>
                  {userProfile?.role && (
                    <Badge variant="outline" className="text-xs w-fit">
                      {userProfile.role}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                      {userProfile?.role && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {userProfile.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;