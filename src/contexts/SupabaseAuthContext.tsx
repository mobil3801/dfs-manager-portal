import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabase, auth } from '@/lib/supabase';
import { userProfileService, auditLogService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';

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

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile && userProfile.role !== 'Guest';

  const clearError = () => {
    setAuthError(null);
  };

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await userProfileService.getUserProfileByUserId(userId);
      
      if (error) {
        if (error.message.includes('No rows')) {
          // Create default profile for new user
          const defaultProfile = {
            role: 'Employee',
            station_id: null,
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString().split('T')[0],
            is_active: true,
            detailed_permissions: {}
          };
          
          const { data: newProfile, error: createError } = await userProfileService.createUserProfile(userId, defaultProfile);
          
          if (createError) {
            console.error('Failed to create user profile:', createError);
            return GUEST_PROFILE;
          }
          
          return newProfile;
        }
        
        console.error('Failed to fetch user profile:', error);
        return GUEST_PROFILE;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return GUEST_PROFILE;
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
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        setAuthError(error.message);
        await auditLogService.logActivity('unknown', 'login_failed', 'users', undefined, undefined, { email, error: error.message });
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        
        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
        
        await auditLogService.logActivity(data.user.id, 'login_success', 'users', data.user.id);
        
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
      if (user) {
        await auditLogService.logActivity(user.id, 'logout', 'users', user.id);
      }
      
      const { error } = await auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setSession(null);
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
      setSession(null);
      setAuthError(null);
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { data, error } = await auth.signUp(email, password, { full_name: fullName });
      
      if (error) {
        setAuthError(error.message);
        await auditLogService.logActivity('unknown', 'registration_failed', 'users', undefined, undefined, { email, error: error.message });
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      if (data.user) {
        await auditLogService.logActivity(data.user.id, 'registration_success', 'users', data.user.id);
        
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account'
        });
        
        return true;
      }
      
      return false;
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
      
      const { error } = await auth.resetPassword(email);
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: 'Reset Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
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
      
      const { error } = await auth.updatePassword(password);
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      if (user) {
        await auditLogService.logActivity(user.id, 'password_update', 'users', user.id);
      }
      
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
    if (!userProfile || userProfile.role === 'Guest') {
      return false;
    }

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
            setUserProfile(GUEST_PROFILE);
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
          setUserProfile(GUEST_PROFILE);
          setSession(null);
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        setUserProfile(GUEST_PROFILE);
        setSession(null);
        setAuthError(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setSession(session);
      }
      
      setIsLoading(false);
    });

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