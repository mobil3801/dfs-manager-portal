import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lightweight loading components to reduce bundle size
export const LoadingSpinner = ({
  message = 'Loading...',
  size = 'default'



}: {message?: string;size?: 'sm' | 'default' | 'lg';}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>);

};

export const PageLoadingSpinner = ({
  route = '',
  compact = false



}: {route?: string;compact?: boolean;}) => {
  const containerClass = compact ?
  "flex items-center justify-center py-8" :
  "flex items-center justify-center py-12";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">
          {route ? `Loading ${route}...` : 'Loading page...'}
        </p>
      </div>
    </div>);

};

export const CardLoadingSkeleton = () =>
<Card className="p-6">
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  </Card>;


export const TableLoadingSkeleton = ({ rows = 5 }: {rows?: number;}) =>
<div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) =>
  <div key={i} className="flex space-x-4 p-4 border rounded-lg">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
  )}
  </div>;


export const FormLoadingSkeleton = () =>
<Card className="p-6">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  </Card>;


export const DashboardLoadingSkeleton = () =>
<div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) =>
    <Card key={i} className="p-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-6 w-[60px]" />
            </div>
          </div>
        </Card>
    )}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <Skeleton className="h-4 w-[150px] mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-4 w-[150px] mb-4" />
        <TableLoadingSkeleton rows={6} />
      </Card>
    </div>
  </div>;


export const AdminLoadingSkeleton = () =>
<div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-10 w-[120px]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) =>
    <Card key={i} className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </Card>
    )}
    </div>
  </div>;


// Export all loading components for easy access
export const LoadingComponents = {
  LoadingSpinner,
  PageLoadingSpinner,
  CardLoadingSkeleton,
  TableLoadingSkeleton,
  FormLoadingSkeleton,
  DashboardLoadingSkeleton,
  AdminLoadingSkeleton
};

export default LoadingComponents;