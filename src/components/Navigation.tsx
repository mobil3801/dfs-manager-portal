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
  Menu } from
'lucide-react';

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
  { path: '/settings', label: 'Settings', icon: Settings }];


  // Add admin-only items
  if (isAdmin()) {
    navItems.splice(-1, 0, { path: '/users', label: 'User Management', icon: Shield });
  }

  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.
      split(' ').
      map((name) => name[0]).
      join('').
      toUpperCase().
      slice(0, 2);
    }
    return user?.Name ? user.Name[0].toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    return userProfile?.full_name || user?.Name || 'User';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      





















































































































































    </nav>);

};

export default Navigation;