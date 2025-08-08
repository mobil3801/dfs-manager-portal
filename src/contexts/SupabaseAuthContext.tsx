import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, authService, databaseService } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define types
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
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const SupabaseAuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!session;

  const clearError = () => {
    setAuthError(null);
  };

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      let profile = await databaseService.getUserProfile(userId);

      // Create default profile if none exists
      if (!profile) {
        const defaultProfile = createDefaultProfile(userId);
        profile = await databaseService.createUserProfile(userId, defaultProfile);
      }

      return profile;
    } catch (error) {
      console.error('Error fetching/creating user profile:', error);
      // Return a minimal profile to prevent blocking
      return {
        id: 'temp',
        user_id: userId,
        role: 'Employee',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      setAuthError(null);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setAuthError('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await authService.signIn(email, password);

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
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await authService.signOut();

      if (error) {
        console.error('Logout error:', error);
      }

      // Clear state regardless of API response
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setAuthError(null);

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setAuthError(null);
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await authService.signUp(email, password, {
        full_name: fullName,
        display_name: fullName
      });

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
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      await authService.resetPassword(email);

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

  const updatePassword = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      await authService.updatePassword(password);

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
  };

  const hasPermission = (action: string, resource?: string): boolean => {
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

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setAuthError(error.message);
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setSession(session);

            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          } else {
            setUser(null);
            setUserProfile(null);
            setSession(null);
          }
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          setAuthError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setAuthError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setSession(session);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export default SupabaseAuthProvider;