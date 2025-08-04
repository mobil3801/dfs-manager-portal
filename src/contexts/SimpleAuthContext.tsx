import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  station_id?: string;
  employee_id?: string;
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  detailed_permissions: any;
  profile_image_url?: string;
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
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default guest user profile for non-authenticated users
const GUEST_PROFILE: UserProfile = {
  id: '0',
  user_id: '0',
  role: 'Guest',
  station_id: undefined,
  employee_id: '',
  phone: '',
  hire_date: '',
  is_active: false,
  detailed_permissions: {}
};

// Test admin user
const TEST_ADMIN: User = {
  id: '1',
  email: 'admin@dfsmanager.com',
  created_at: new Date().toISOString()
};

const TEST_ADMIN_PROFILE: UserProfile = {
  id: '1',
  user_id: '1',
  role: 'Administrator',
  is_active: true,
  detailed_permissions: {}
};

export const SimpleAuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(GUEST_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile && userProfile.role !== 'Guest';

  const clearError = () => {
    setAuthError(null);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔐 Simple login attempt:', email);

      // Simple test authentication
      if (email === 'admin@dfsmanager.com' && password === 'Admin123!') {
        setUser(TEST_ADMIN);
        setUserProfile(TEST_ADMIN_PROFILE);
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!'
        });

        console.log('✅ Simple login successful');
        return true;
      } else {
        const errorMsg = 'Invalid email or password';
        setAuthError(errorMsg);
        toast({
          title: 'Login Failed',
          description: errorMsg,
          variant: 'destructive'
        });
        console.log('❌ Simple login failed');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setAuthError(null);

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setAuthError(null);
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Simple registration simulation
      toast({
        title: 'Registration Successful',
        description: 'Account created! You can now log in.'
      });

      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      toast({
        title: 'Reset Email Sent',
        description: 'Please check your email for reset instructions'
      });

      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      toast({
        title: 'Reset Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!user) return;
    
    // No-op for simple auth
    console.log('RefreshUserData called');
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!userProfile || userProfile.role === 'Guest') {
      return false;
    }

    // Admins have all permissions
    if (userProfile.role === 'Administrator' || userProfile.role === 'Admin') {
      return true;
    }

    // Default permissions for managers
    if (userProfile.role === 'Management' || userProfile.role === 'Manager') {
      const managerActions = ['view', 'create', 'edit'];
      return managerActions.includes(action);
    }

    // Default permissions for employees
    if (userProfile.role === 'Employee') {
      return action === 'view';
    }

    return false;
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';
  };

  const isManager = (): boolean => {
    return userProfile?.role === 'Management' ||
           userProfile?.role === 'Manager' ||
           userProfile?.role === 'Administrator' ||
           userProfile?.role === 'Admin';
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    authError,
    isInitialized,
    login,
    logout,
    register,
    resetPassword,
    refreshUserData,
    hasPermission,
    isAdmin,
    isManager,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSimpleAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export default SimpleAuthProvider;