import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, databaseService, authService } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Timeout constants
const AUTH_INITIALIZATION_TIMEOUT = 10000; // 10 seconds
const AUTH_OPERATION_TIMEOUT = 8000; // 8 seconds
const SESSION_REFRESH_TIMEOUT = 5000; // 5 seconds

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: any;
  app_metadata?: any;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_at?: number;
  refresh_token?: string;
  user: User;
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
  detailed_permissions?: any;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  stations?: {
    name: string;
    address: string;
    phone: string;
  };
}

interface AuthContextType {
  // User and session data
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;

  // State flags
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;

  // Permission methods
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;

  // Utility methods
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeout: number, errorMessage: string): Promise<T> {
  return Promise.race([
  promise,
  new Promise<T>((_, reject) =>
  setTimeout(() => reject(new Error(errorMessage)), timeout)
  )]
  );
}

// Default profile for new users
const createDefaultProfile = (userId: string): Partial<UserProfile> => ({
  user_id: userId,
  role: 'Employee',
  station_id: null,
  employee_id: '',
  phone: '',
  hire_date: new Date().toISOString().split('T')[0],
  is_active: true,
  detailed_permissions: {}
});

export const ConsolidatedAuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!session && !authError;

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const profile = await withTimeout(
        databaseService.getUserProfile(userId),
        5000,
        'Profile fetch timeout'
      );

      if (!profile) {
        // Try to create a default profile
        const defaultProfile = createDefaultProfile(userId);
        const newProfile = await databaseService.createUserProfile(userId, defaultProfile);
        return newProfile as UserProfile;
      }

      return profile as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);

      // Return minimal fallback profile to prevent blocking
      return {
        id: 'temp-' + Date.now(),
        user_id: userId,
        role: 'Employee',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }
  }, []);

  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      setAuthError(null);

      const profile = await withTimeout(
        fetchUserProfile(user.id),
        SESSION_REFRESH_TIMEOUT,
        'User data refresh timeout'
      );

      setUserProfile(profile);
    } catch (error: any) {
      console.error('Error refreshing user data:', error);
      setAuthError(error?.message || 'Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await withTimeout(
        authService.signIn(email, password),
        AUTH_OPERATION_TIMEOUT,
        'Login timeout - please try again'
      );

      if (error) {
        setAuthError(error.message);
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);

        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);

        toast({
          title: 'Login Successful',
          description: 'Welcome back!'
        });

        return true;
      }

      return false;
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
  }, [fetchUserProfile, toast]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await withTimeout(
        authService.signOut(),
        AUTH_OPERATION_TIMEOUT,
        'Logout timeout'
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state regardless of API response
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setAuthError(null);

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out'
      });
    }
  }, [toast]);

  const register = useCallback(async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await withTimeout(
        authService.signUp(email, password, {
          full_name: fullName,
          display_name: fullName
        }),
        AUTH_OPERATION_TIMEOUT,
        'Registration timeout - please try again'
      );

      if (error) {
        setAuthError(error.message);
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Registration Successful',
        description: 'Please check your email to verify your account'
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
  }, [toast]);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      await withTimeout(
        authService.resetPassword(email),
        AUTH_OPERATION_TIMEOUT,
        'Password reset timeout'
      );

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
  }, [toast]);

  const updatePassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      await withTimeout(
        authService.updatePassword(password),
        AUTH_OPERATION_TIMEOUT,
        'Password update timeout'
      );

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated'
      });

      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const hasPermission = useCallback((action: string, resource?: string): boolean => {
    if (!userProfile) return false;

    // Admins have all permissions
    if (userProfile.role === 'Administrator' || userProfile.role === 'Admin') {
      return true;
    }

    // Parse detailed permissions if they exist
    if (userProfile.detailed_permissions) {
      try {
        let permissions = userProfile.detailed_permissions;
        if (typeof permissions === 'string') {
          permissions = JSON.parse(permissions);
        }

        if (resource && permissions[resource] && permissions[resource][action]) {
          return true;
        }
      } catch (error) {
        console.warn('Error parsing permissions:', error);
      }
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
  }, [userProfile]);

  const isAdmin = useCallback((): boolean => {
    return userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';
  }, [userProfile]);

  const isManager = useCallback((): boolean => {
    return userProfile?.role === 'Management' ||
    userProfile?.role === 'Manager' ||
    userProfile?.role === 'Administrator' ||
    userProfile?.role === 'Admin';
  }, [userProfile]);

  // Initialize authentication state with timeout protection
  useEffect(() => {
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Set initialization timeout
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Authentication initialization timeout');
            setAuthError('Authentication initialization timed out. Please refresh the page.');
            setIsInitialized(true);
            setIsLoading(false);
          }
        }, AUTH_INITIALIZATION_TIMEOUT);

        // Get initial session with timeout
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_INITIALIZATION_TIMEOUT / 2,
          'Session initialization timeout'
        );

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthError(error.message);
          }
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setSession(session);

            try {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
            } catch (profileError) {
              console.error('Profile fetch error during initialization:', profileError);
              // Don't block initialization for profile errors
            }
          } else {
            setUser(null);
            setUserProfile(null);
            setSession(null);
          }

          clearTimeout(initializationTimeout);
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthError(error?.message || 'Failed to initialize authentication');
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setSession(session);

            try {
              const profile = await fetchUserProfile(session.user.id);
              setUserProfile(profile);
            } catch (profileError) {
              console.error('Profile fetch error on sign in:', profileError);
            }

            setAuthError(null);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserProfile(null);
            setSession(null);
            setAuthError(null);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            setSession(session);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isAuthenticated,
    isLoading,
    authError,
    isInitialized,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    refreshUserData,
    hasPermission,
    isAdmin,
    isManager,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useConsolidatedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useConsolidatedAuth must be used within a ConsolidatedAuthProvider');
  }
  return context;
};

// Backward compatibility exports
export const useAuth = useConsolidatedAuth;
export const useSupabaseAuth = useConsolidatedAuth;
export const AuthProvider = ConsolidatedAuthProvider;
export const SupabaseAuthProvider = ConsolidatedAuthProvider;

export default ConsolidatedAuthProvider;