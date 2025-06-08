import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export interface AdminAccessResult {
  isAdmin: boolean;
  hasAdminAccess: boolean;
  hasMonitoringAccess: boolean;
  checkAdminAccess: () => boolean;
  requireAdminAccess: () => void;
  isLoading: boolean;
  debugInfo: {
    user: any;
    userProfile: any;
    userRole: string | null;
  };
}

export const useAdminAccess = (): AdminAccessResult => {
  const { user, userProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced admin checking with detailed logging
  const isAdmin = userProfile?.role === 'Administrator' || userProfile?.role === 'Management';
  const hasMonitoringAccess = isAdmin;

  useEffect(() => {
    // Debug logging for admin access
    console.log('=== ADMIN ACCESS DEBUG ===');
    console.log('User:', user);
    console.log('User Profile:', userProfile);
    console.log('User Role:', userProfile?.role);
    console.log('Is Admin:', isAdmin);
    console.log('Auth Loading:', loading);
    console.log('========================');

    setIsLoading(loading);
  }, [user, userProfile, loading, isAdmin]);

  const checkAdminAccess = (): boolean => {
    console.log('Checking admin access:', {
      hasUser: !!user,
      hasProfile: !!userProfile,
      role: userProfile?.role,
      isAdmin
    });
    return isAdmin;
  };

  const requireAdminAccess = (): void => {
    if (!isAdmin) {
      const errorMsg = userProfile 
        ? `Access denied. Current role: ${userProfile.role}. Administrator or Management role required.`
        : 'Access denied. User profile not found. Please contact administrator.';
      throw new Error(errorMsg);
    }
  };

  return {
    isAdmin,
    hasAdminAccess: isAdmin,
    hasMonitoringAccess,
    checkAdminAccess,
    requireAdminAccess,
    isLoading,
    debugInfo: {
      user,
      userProfile,
      userRole: userProfile?.role || null
    }
  };
};

export default useAdminAccess;