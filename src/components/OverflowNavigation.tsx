import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredRole: string | null;
}

interface OverflowNavigationProps {
  items: NavigationItem[];
  canAccessRoute: (requiredRole: string | null) => boolean;
}

const OverflowNavigation: React.FC<OverflowNavigationProps> = ({ items, canAccessRoute }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([]);
  const [overflowItems, setOverflowItems] = useState<NavigationItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);

  // Filter items based on permissions
  const accessibleItems = items.filter((item) => canAccessRoute(item.requiredRole));

  const isActiveRoute = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const calculateOverflow = useCallback(() => {
    if (!containerRef.current || !hiddenContainerRef.current) return;

    const container = containerRef.current;
    const hiddenContainer = hiddenContainerRef.current;
    const containerWidth = container.offsetWidth;
    const moreButtonWidth = 100; // More generous width for "More" button
    const padding = 32; // Extra padding for safety
    const availableWidth = containerWidth - moreButtonWidth - padding;

    // Get widths of all items from hidden container
    const hiddenItems = Array.from(hiddenContainer.children) as HTMLElement[];
    let totalWidth = 0;
    let visibleCount = 0;

    for (let i = 0; i < hiddenItems.length; i++) {
      const itemWidth = hiddenItems[i].offsetWidth + 8; // Add some margin
      if (totalWidth + itemWidth <= availableWidth) {
        totalWidth += itemWidth;
        visibleCount++;
      } else {
        break;
      }
    }

    // If all items fit, don't show the More button
    if (visibleCount >= accessibleItems.length) {
      setVisibleItems(accessibleItems);
      setOverflowItems([]);
    } else {
      // Ensure at least one item is visible if possible
      visibleCount = Math.max(0, visibleCount);
      setVisibleItems(accessibleItems.slice(0, visibleCount));
      setOverflowItems(accessibleItems.slice(visibleCount));
    }

    setIsCalculating(false);
  }, [accessibleItems]);

  // Initial calculation and resize handling
  useEffect(() => {
    const handleResize = () => {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        calculateOverflow();
      }, 100);
      return () => clearTimeout(timer);
    };

    // ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(handleResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial calculation
    const timer = setTimeout(() => {
      calculateOverflow();
    }, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [calculateOverflow]);

  // Recalculate when items change
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      calculateOverflow();
    }, 100);
    return () => clearTimeout(timer);
  }, [accessibleItems, calculateOverflow]);

  const NavigationButton: React.FC<{
    item: NavigationItem;
    isOverflow?: boolean;
    isHidden?: boolean;
  }> = ({ item, isOverflow = false, isHidden = false }) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);

    const handleClick = () => {
      navigate(item.href);
    };

    const baseClasses = isOverflow ?
    "flex items-center space-x-2 px-3 py-2 text-left w-full transition-colors text-sm font-medium rounded-md" :
    "flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 whitespace-nowrap text-sm font-medium hover:scale-105 min-w-fit";

    const activeClasses = isActive ?
    isOverflow ?
    "bg-blue-50 text-blue-600" :
    "bg-blue-600 text-white shadow-md" :
    isOverflow ?
    "text-gray-700 hover:bg-gray-50 hover:text-gray-900" :
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm";

    if (isOverflow) {
      return (
        <DropdownMenuItem
          onClick={handleClick}
          className={`${baseClasses} ${activeClasses}`}>

          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="ml-2">{item.name}</span>
        </DropdownMenuItem>);

    }

    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses}`}
        style={{ visibility: isHidden ? 'hidden' : 'visible' }}>

        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="ml-2">{item.name}</span>
      </button>);

  };

  return (
    <div className="w-full relative">
      {/* Visible navigation container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center space-x-1 px-4 w-full">

        {!isCalculating &&
        <>
            {/* Visible Navigation Items */}
            {visibleItems.map((item) =>
          <NavigationButton
            key={item.href}
            item={item} />

          )}

            {/* More Button for Overflow Items */}
            {overflowItems.length > 0 &&
          <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium hover:bg-gray-100 hover:scale-105 min-w-fit">

                    <MoreHorizontal className="h-4 w-4" />
                    <span className="ml-1">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {overflowItems.map((item) =>
              <NavigationButton
                key={item.href}
                item={item}
                isOverflow={true} />

              )}
                </DropdownMenuContent>
              </DropdownMenu>
          }
          </>
        }
      </div>

      {/* Hidden container for measurement */}
      <div
        ref={hiddenContainerRef}
        className="absolute top-0 left-0 opacity-0 pointer-events-none overflow-hidden whitespace-nowrap"
        style={{ zIndex: -1 }}>

        <div className="flex items-center space-x-1 px-4">
          {accessibleItems.map((item) =>
          <NavigationButton
            key={`hidden-${item.href}`}
            item={item}
            isHidden={true} />

          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isCalculating &&
      <div className="flex items-center justify-center space-x-2 px-4 py-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      }
    </div>);

};

export default OverflowNavigation;