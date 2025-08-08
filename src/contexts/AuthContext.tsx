// Legacy AuthContext - kept for backward compatibility
// This now directly uses Supabase instead of wrapping the SupabaseAuthContext
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

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
  // Direct delegation to Supabase auth with conversion
  const supabaseAuth = useSupabaseAuth();

  // Convert Supabase user to legacy format
  const legacyUser = supabaseAuth.user ? {
    ID: parseInt(supabaseAuth.user.id.replace(/\D/g, '').substring(0, 10) || '1'),
    Name: supabaseAuth.user.user_metadata?.full_name ||
    supabaseAuth.user.user_metadata?.display_name ||
    supabaseAuth.user.email?.split('@')[0] ||
    'User',
    Email: supabaseAuth.user.email || '',
    CreateTime: supabaseAuth.user.created_at || new Date().toISOString()
  } : null;

  // Convert Supabase user profile to legacy format
  const legacyUserProfile = supabaseAuth.userProfile ? {
    id: parseInt(supabaseAuth.userProfile.id.replace(/\D/g, '').substring(0, 10) || '1'),
    user_id: parseInt(supabaseAuth.user?.id.replace(/\D/g, '').substring(0, 10) || '1'),
    role: supabaseAuth.userProfile.role,
    station: supabaseAuth.userProfile.stations?.name || 'Default Station',
    employee_id: supabaseAuth.userProfile.employee_id || '',
    phone: supabaseAuth.userProfile.phone || '',
    hire_date: supabaseAuth.userProfile.hire_date || new Date().toISOString().split('T')[0],
    is_active: supabaseAuth.userProfile.is_active,
    detailed_permissions: supabaseAuth.userProfile.detailed_permissions || {},
    profile_image_id: null
  } : null;

  return {
    user: legacyUser,
    userProfile: legacyUserProfile,
    isAuthenticated: supabaseAuth.isAuthenticated,
    isLoading: supabaseAuth.isLoading,
    authError: supabaseAuth.authError,
    isInitialized: supabaseAuth.isInitialized,
    login: supabaseAuth.login,
    logout: supabaseAuth.logout,
    register: supabaseAuth.register,
    refreshUserData: supabaseAuth.refreshUserData,
    hasPermission: supabaseAuth.hasPermission,
    isAdmin: supabaseAuth.isAdmin,
    isManager: supabaseAuth.isManager,
    clearError: supabaseAuth.clearError
  };
};