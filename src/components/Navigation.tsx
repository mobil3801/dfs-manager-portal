import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';
import { Button } from '@/components/ui/button';
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
  Menu,
  ChevronDown } from
'lucide-react';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel } from
'@/components/ui/dropdown-menu';

const Navigation = () => {
  const { user, profile, logout } = useDatabaseAuth();
  const location = useLocation();

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
    name: 'Employees',
    href: '/employees',
    icon: Users,
    requiredRole: 'manager'
  },
  {
    name: 'Licenses',
    href: '/licenses',
    icon: Calendar,
    requiredRole: 'manager'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRole: null
  }];


  // Add admin-only items
  if (profile?.role === 'Administrator') {
    navigationItems.push({
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      requiredRole: 'admin'
    });
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isActiveRoute = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const canAccessRoute = (requiredRole: string | null) => {
    if (!requiredRole) return true;
    if (!profile) return false;

    if (requiredRole === 'admin') return profile.role === 'Administrator';
    if (requiredRole === 'manager') return profile.role === 'Management' || profile.role === 'Administrator';
    return true;
  };

  const visibleItems = navigationItems.filter((item) => canAccessRoute(item.requiredRole));

  return (
    <nav className="bg-blue-900 border-b-2 border-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive ?
                  'bg-blue-800 text-white shadow-md' :
                  'text-blue-100 hover:bg-blue-800 hover:text-white'}`
                  }>

                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>);

            })}
          </div>

          {/* Mobile Navigation Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-100 hover:bg-blue-800 hover:text-white">

                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);

                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-2 ${
                        isActive ? 'bg-blue-50 text-blue-700' : ''}`
                        }>

                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>);

                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-100 hover:bg-blue-800 hover:text-white flex items-center space-x-2">

                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {profile &&
                    <p className="text-xs text-blue-600">{profile.role} - {profile.station}</p>
                    }
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>);

};

export default Navigation;