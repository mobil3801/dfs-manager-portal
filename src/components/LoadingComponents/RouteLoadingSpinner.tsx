import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteLoadingSpinnerProps {
  route?: string;
  showSkeleton?: boolean;
}

const RouteLoadingSpinner: React.FC<RouteLoadingSpinnerProps> = ({
  route,
  showSkeleton = false
}) => {
  if (showSkeleton) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) =>
          <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          )}
        </div>
      </div>);

  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-gray-600 font-medium">
          {route ? `Loading ${route}...` : 'Loading page...'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Please wait while we prepare your content
        </p>
      </div>
    </div>);

};

// Different loading states for different route types
export const ProductLoadingSpinner = () =>
<RouteLoadingSpinner route="Products" showSkeleton />;


export const EmployeeLoadingSpinner = () =>
<RouteLoadingSpinner route="Employees" showSkeleton />;


export const SalesLoadingSpinner = () =>
<RouteLoadingSpinner route="Sales Reports" showSkeleton />;


export const AdminLoadingSpinner = () =>
<RouteLoadingSpinner route="Admin Panel" />;


export const FormLoadingSpinner = () =>
<div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="space-y-4">
      {[...Array(5)].map((_, i) =>
    <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
    )}
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>;


export default RouteLoadingSpinner;