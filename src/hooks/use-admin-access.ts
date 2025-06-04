import { useAuth } from '@/contexts/AuthContext';

export interface AdminAccessResult {
  isAdmin: boolean;
  hasAdminAccess: boolean;
  hasMonitoringAccess: boolean;
  checkAdminAccess: () => boolean;
  requireAdminAccess: () => void;
}

export const useAdminAccess = (): AdminAccessResult => {
  const { userProfile } = useAuth();

  const isAdmin = userProfile?.role === 'Administrator';
  const hasMonitoringAccess = isAdmin;

  const checkAdminAccess = (): boolean => {
    return isAdmin;
  };

  const requireAdminAccess = (): void => {
    if (!isAdmin) {
      throw new Error('Administrator access required for this feature');
    }
  };

  return {
    isAdmin,
    hasAdminAccess: isAdmin,
    hasMonitoringAccess,
    checkAdminAccess,
    requireAdminAccess
  };
};

export default useAdminAccess;