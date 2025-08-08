import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import AuditLoggerService from '@/services/auditLogger';

const auditLogger = AuditLoggerService.getInstance();

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Role {
  id: number;
  role_name: string;
  role_code: string;
  description: string;
  permissions: any;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: number;
  roles: Role;
  created_at: string;
  updated_at: string;
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
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isEmployee: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile;

  const clearError = () => {
    setAuthError(null);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      select(`
          *,
          roles (
            id,
            role_name,
            role_code,
            description,
            permissions
          )
        `).
      eq('id', userId).
      single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { data: { user: authUser }, error } = await supabase.auth.getUser();

      if (error || !authUser) {
        setUser(null);
        setUserProfile(null);
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name
      });

      const profile = await fetchUserProfile(authUser.id);
      setUserProfile(profile);

    } catch (error) {
      console.error('Error refreshing user data:', error);
      setAuthError('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setAuthError('Failed to initialize authentication');
        return;
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name
        });

        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name
          });

          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setAuthError(error.message);
        await auditLogger.logLogin(email, false, undefined, error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name
        });

        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);

        await auditLogger.logLogin(email, true, data.user.id);
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      await auditLogger.logLogin(email, false, undefined, errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (user) {
        await auditLogger.logLogout(user.email, user.id);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
      }

      setUser(null);
      setUserProfile(null);
      setAuthError(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setAuthError(error.message);
        await auditLogger.logRegistration(email, false, error.message);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        // Create user profile with default Employee role
        const { data: roles } = await supabase.
        from('roles').
        select('id').
        eq('role_code', 'Employee').
        single();

        if (roles) {
          await supabase.
          from('user_profiles').
          insert([{
            id: data.user.id,
            email: email,
            full_name: name,
            role_id: roles.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        }

        await auditLogger.logRegistration(email, true);
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account"
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      await auditLogger.logRegistration(email, false, errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !userProfile || !userProfile.roles) {
      return false;
    }

    // Admins have all permissions
    if (userProfile.roles.role_code === 'Administrator') {
      return true;
    }

    // Check role permissions
    const permissions = userProfile.roles.permissions || {};

    if (permissions.all_modules === true) {
      return true;
    }

    return permissions[permission] === true;
  };

  const isAdmin = (): boolean => {
    if (!user || !userProfile) return false;
    return userProfile?.roles?.role_code === 'Administrator';
  };

  const isManager = (): boolean => {
    if (!user || !userProfile) return false;
    return userProfile?.roles?.role_code === 'Manager' || isAdmin();
  };

  const isEmployee = (): boolean => {
    if (!user || !userProfile) return false;
    return userProfile?.roles?.role_code === 'Employee';
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
    refreshUserData,
    hasPermission,
    isAdmin,
    isManager,
    isEmployee,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};