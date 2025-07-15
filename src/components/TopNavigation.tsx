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
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
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
  X,
  AlertCircle,
  MoreHorizontal } from
'lucide-react';
import { useOverflowNavigation } from '@/hooks/use-overflow-navigation';

const TopNavigation = () => {
  const { user, logout, isAdmin, isManager, isAuthenticated, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Debug logging
  useEffect(() => {
    if (debugMode) {
      console.log('TopNavigation Debug:', {
        isAuthenticated,
        isLoading,
        isInitialized,
        user: user?.Name,
        userRole: user ? isAdmin() ? 'Admin' : isManager() ? 'Manager' : 'Employee' : 'None'
      });
    }
  }, [isAuthenticated, isLoading, isInitialized, user, isAdmin, isManager, debugMode]);

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

  // Navigation items with better role checking
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
  }];


  // Add admin section if user is admin
  if (isAuthenticated && isAdmin()) {
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

  // Enhanced role checking with better fallbacks
  const canAccessRoute = (requiredRole: string | null) => {
    // Allow access if no role is required
    if (!requiredRole) return true;

    // Ensure user is authenticated
    if (!isAuthenticated) return false;

    // Check specific roles
    if (requiredRole === 'admin') return isAdmin();
    if (requiredRole === 'manager') return isManager();

    // Default to allowing access for authenticated users
    return true;
  };

  // Use overflow navigation hook
  const {
    containerRef,
    hiddenContainerRef,
    visibleItems,
    overflowItems,
    isCalculating,
    hasOverflow
  } = useOverflowNavigation({
    items: navigationItems,
    canAccessRoute,
    moreButtonWidth: 100,
    padding: 24
  });

  // Get accessible items for debugging
  const accessibleItems = navigationItems.filter((item) => canAccessRoute(item.requiredRole));


  const NavigationLink = ({ item, mobile = false, inDropdown = false }: {item: any;mobile?: boolean;inDropdown?: boolean;}) => {
    if (!canAccessRoute(item.requiredRole)) return null;

    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);

    const baseClasses = mobile ?
    "flex items-center space-x-3 px-4 py-3 text-left w-full transition-colors text-sm font-medium rounded-md mx-2" :
    inDropdown ?
    "flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors text-sm font-medium w-full text-left" :
    "flex items-center space-x-2 px-2 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap text-sm font-medium hover:scale-105 min-w-fit max-w-fit flex-shrink-0";


    const activeClasses = isActive ?
    "bg-blue-600 text-white shadow-md" :
    mobile ?
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900" :
    inDropdown ?
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900" :
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm";

    const handleClick = () => {
      navigate(item.href);
      if (mobile) setMobileMenuOpen(false);
    };

    if (inDropdown) {
      return (
        <DropdownMenuItem
          onClick={handleClick}
          className={`${baseClasses} ${activeClasses} cursor-pointer`}
          data-testid={`nav-${item.name.toLowerCase()}`}>
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="ml-2">{item.name}</span>
        </DropdownMenuItem>
      );
    }</find>


    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses}`}
        data-testid={`nav-${item.name.toLowerCase()}`} data-id="ivdguuux7">
        <Icon className="h-4 w-4 flex-shrink-0" data-id="oarxez3us" />
        <span className="ml-2" data-id="l1f1hlaiy">{item.name}</span>
      </button>);

  };

  // More Menu Button Component
  const MoreMenuButton = () => {
    if (!hasOverflow || overflowItems.length === 0) return null;

    const hasActiveOverflowItem = overflowItems.some((item) => isActiveRoute(item.href));

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap text-sm font-medium hover:scale-105 min-w-fit max-w-fit flex-shrink-0 ${
              hasActiveOverflowItem 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
            <span className="ml-1">More</span>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>More Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {overflowItems.map((item) => (
            <NavigationLink key={item.href} item={item} inDropdown />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };



  // Show loading state for navigation
  if (!isInitialized || isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full shadow-sm" data-id="nbe7w175s">
        <div className="w-full px-4 sm:px-6 lg:px-8" data-id="f8xp9mv1u">
          <div className="flex items-center justify-between h-16" data-id="cd1t2drxw">
            <div className="flex items-center space-x-4" data-id="3qliyz2v9">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="DFS Manager Portal"
                className="h-10 w-auto" data-id="14on4gnxx" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block" data-id="mea2vfnp3">DFS Manager Portal</span>
            </div>
            <div className="flex items-center space-x-4" data-id="848c3lehg">
              <div className="flex space-x-2" data-id="w4pp94mkg">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" data-id="rbowbbpax"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" data-id="90wmsz1gu"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" data-id="gyieeb5us"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" data-id="mkiu09rfv"></div>
            </div>
          </div>
        </div>
      </header>);

  }

  // Don't render navigation if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full shadow-sm" data-id="5c8s7faiw">
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 overflow-hidden" data-id="uyjwfyuhj">
          <div className="flex items-center justify-between h-16 min-w-0" data-id="ioi7x2you">
            
            {/* Left Section - Logo and Brand */}
            <div className="flex items-center space-x-4 flex-shrink-0 min-w-0" data-id="s4138k1aq">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="DFS Manager Portal"
                className="h-10 w-auto flex-shrink-0" data-id="xh1ekpb45" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block truncate" data-id="80yqsv3jk">DFS Manager Portal</span>
            </div>

            {/* Center Section - Navigation Items (Desktop) */}
            <nav className="hidden lg:flex items-center flex-1 justify-center min-w-0 mx-4" data-id="s6a5118lg">
              <div 
                ref={containerRef}
                className="flex items-center space-x-1 max-w-full"
                data-id="dgc1av95i"
              >
                {/* Loading state while calculating */}
                {isCalculating && (
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                )}
                
                {/* Visible navigation items */}
                {!isCalculating && visibleItems.map((item) => (
                  <NavigationLink key={item.href} item={item} data-id="i8bekocxv" />
                ))}
                
                {/* More Menu Button */}
                {!isCalculating && <MoreMenuButton />}
                
                {/* Hidden container for measuring widths */}
                <div 
                  ref={hiddenContainerRef}
                  className="fixed -top-[9999px] left-0 flex items-center space-x-1 opacity-0 pointer-events-none"
                  aria-hidden="true"
                >
                  {accessibleItems.map((item) => (
                    <NavigationLink key={`hidden-${item.href}`} item={item} />
                  ))}
                </div>
              </div>
            </nav>


            {/* Right Section - User Profile and Controls */}
            <div className="flex items-center space-x-2 flex-shrink-0 min-w-0" data-id="mai0hkgt5">
              
              {/* Debug Toggle (Development) */}
              {process.env.NODE_ENV === 'development' &&
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
                className="text-xs px-2 py-1" data-id="s3drqhufr">
                  {debugMode ? 'Debug: ON' : 'Debug: OFF'}
                </Button>
              }

              {/* User Profile Dropdown */}
              <DropdownMenu data-id="frrz6248w">
                <DropdownMenuTrigger asChild data-id="8u9pxj9hz">
                  <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1.5 h-auto min-w-0 max-w-fit" data-id="n5oee612x">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" data-id="m17j27yy6">
                      <span className="text-sm font-medium text-blue-700" data-id="w2ti7d4mx">
                        {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden xl:block text-left min-w-0 max-w-32" data-id="7ndt7471e">
                      <p className="text-sm font-medium text-gray-900 leading-none truncate" data-id="w49jl5tk2">
                        {user?.Name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 leading-none mt-0.5 truncate" data-id="uhzzsapn5">{user?.Email}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-gray-500 flex-shrink-0" data-id="pps3jpvti" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" data-id="62o0op1sl">
                  <DropdownMenuLabel data-id="nmbn80jsa">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator data-id="8zciwx3l3" />
                  <DropdownMenuItem onClick={() => navigate('/settings')} data-id="f3j4hgvor">
                    <Settings className="mr-2 h-4 w-4" data-id="kzm698me8" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator data-id="jj8n1c9w2" />
                  <DropdownMenuItem onClick={handleLogout} data-id="pc3y6v3p5">
                    <LogOut className="mr-2 h-4 w-4" data-id="qdkeigngf" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(true)} data-id="l8p3ar06a">
                <Menu className="h-5 w-5" data-id="aqdwo11zp" />
                <span className="sr-only" data-id="l41fmrj8u">Open navigation menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {debugMode &&
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2" data-id="coil7bd72">
            <div className="text-xs text-yellow-800" data-id="5cmor7lm5">
              <strong data-id="tbbzcelaz">Debug:</strong> Auth: {isAuthenticated ? 'Yes' : 'No'} | 
              Items: {accessibleItems.length}/{navigationItems.length} | 
              Visible: {visibleItems.length} | Overflow: {overflowItems.length} | 
              Has More: {hasOverflow ? 'Yes' : 'No'} | 
              Role: {isAdmin() ? 'Admin' : isManager() ? 'Manager' : 'Employee'} | 
              User: {user?.Name || 'None'}
            </div>
          </div>
        }
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen &&
      <div className="lg:hidden fixed inset-0 z-50" data-id="52izdb751">
          {/* Overlay */}
          <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)} data-id="02xav7l4p" />

          {/* Menu Panel */}
          <div className={`fixed top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`
        } data-id="a2b6vl6nx">
            <div className="flex flex-col h-full max-h-full" data-id="slf3fvne4">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0" data-id="6jkt2svry">
                <div className="flex items-center space-x-3 min-w-0 flex-1" data-id="zoxkfvkln">
                  <img
                  src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                  alt="DFS Manager Portal"
                  className="h-8 w-auto flex-shrink-0" data-id="313b7us0z" />
                  <span className="text-lg font-bold text-gray-900 truncate" data-id="uqac4pubv">DFS Manager Portal</span>
                </div>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-shrink-0" data-id="80f66r0wh">
                  <X className="h-6 w-6" data-id="68j5rkyvo" />
                  <span className="sr-only" data-id="jnw1o1ejy">Close menu</span>
                </Button>
              </div>
              
              {/* Navigation Items */}
              <div className="flex-1 py-4 overflow-y-auto min-h-0" data-id="nt8c91xbv">
                <div className="space-y-2 px-2" data-id="k5zh4nozo">
                  {navigationItems.map((item) =>
                <NavigationLink key={item.href} item={item} mobile data-id="9dn8toz38" />
                )}
                </div>
              </div>
              
              {/* User Section */}
              <div className="border-t p-4 bg-gray-50 flex-shrink-0" data-id="7fley1hcz">
                <div className="flex items-center space-x-3 mb-4 min-w-0" data-id="duord1p4c">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" data-id="7ppyfesk2">
                    <span className="text-sm font-medium text-blue-700" data-id="gj2ngndrx">
                      {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0" data-id="g5fmqjxct">
                    <p className="text-sm font-medium text-gray-900 truncate" data-id="00kxnlu9a">
                      {user?.Name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate" data-id="wq5rvd2mq">{user?.Email}</p>
                  </div>
                </div>
                <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start" data-id="andawqsja">
                  <LogOut className="h-4 w-4 mr-2" data-id="dvjcxu1mc" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      }

    </>);

};

export default TopNavigation;