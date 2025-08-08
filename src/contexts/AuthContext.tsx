// Legacy AuthContext - kept for backward compatibility
// This now directly uses the consolidated auth context
import React, { createContext, useContext } from 'react';
import { useConsolidatedAuth } from './ConsolidatedAuthContext';

// Legacy interface for backward compatibility
interface User {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
}

interface UserProfile {
  id: number;
  user_id: number;
  role: string;
  station: string;
  employee_id: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  detailed_permissions: any;
  profile_image_id?: number | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is now just a compatibility wrapper
export const AuthProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  return <AuthContext.Provider value={undefined}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  // Direct delegation to consolidated auth with conversion
  const consolidatedAuth = useConsolidatedAuth();

  // Convert consolidated auth user to legacy format with null safety
  const legacyUser = consolidatedAuth.user ? {
    ID: parseInt((consolidatedAuth.user.id || '').replace(/\D/g, '').substring(0, 10) || '1'),
    Name: consolidatedAuth.user.user_metadata?.full_name ||
    consolidatedAuth.user.user_metadata?.display_name ||
    (consolidatedAuth.user.email || '').split('@')[0] ||
    'User',
    Email: consolidatedAuth.user.email || '',
    CreateTime: consolidatedAuth.user.created_at || new Date().toISOString()
  } : null;

  // Convert consolidated auth user profile to legacy format with null safety
  const legacyUserProfile = consolidatedAuth.userProfile ? {
    id: parseInt((consolidatedAuth.userProfile.id || '').replace(/\D/g, '').substring(0, 10) || '1'),
    user_id: parseInt((consolidatedAuth.user?.id || '').replace(/\D/g, '').substring(0, 10) || '1'),
    role: consolidatedAuth.userProfile.role || 'Employee',
    station: consolidatedAuth.userProfile.stations?.name || 'Default Station',
    employee_id: consolidatedAuth.userProfile.employee_id || '',
    phone: consolidatedAuth.userProfile.phone || '',
    hire_date: consolidatedAuth.userProfile.hire_date || new Date().toISOString().split('T')[0],
    is_active: consolidatedAuth.userProfile.is_active || true,
    detailed_permissions: consolidatedAuth.userProfile.detailed_permissions || {},
    profile_image_id: null
  } : null;

  return {
    user: legacyUser,
    userProfile: legacyUserProfile,
    isAuthenticated: consolidatedAuth.isAuthenticated,
    isLoading: consolidatedAuth.isLoading,
    authError: consolidatedAuth.authError,
    isInitialized: consolidatedAuth.isInitialized,
    login: consolidatedAuth.login,
    logout: consolidatedAuth.logout,
    register: consolidatedAuth.register,
    refreshUserData: consolidatedAuth.refreshUserData,
    hasPermission: consolidatedAuth.hasPermission,
    isAdmin: consolidatedAuth.isAdmin,
    isManager: consolidatedAuth.isManager,
    clearError: consolidatedAuth.clearError
  };
};