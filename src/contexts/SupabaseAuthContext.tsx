import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Define types locally since we're using a custom Supabase client
interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_at?: number;
  user: User;
}
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_role: string;
  role?: string; // backward compatibility
  permissions?: any;
  station_access?: any;
  is_active: boolean;
  last_login?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
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
  email: '',
  user_role: 'Guest',
  role: 'Guest',
  phone: '',
  is_active: false,
  permissions: {}
};

export const SupabaseAuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
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
      // Query the user_profiles table directly
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create default profile for new user
          const user = await supabase.auth.getUser();
          const defaultProfile = {
            user_id: userId,
            email: user.data.user?.email || '',
            first_name: '',
            last_name: '',
            user_role: 'Employee',
            permissions: {},
            station_access: {},
            is_active: true,
            phone: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(defaultProfile)
            .select()
            .single();

          if (createError) {
            console.error('Failed to create user profile:', createError);
            return GUEST_PROFILE;
          }

          return { ...newProfile, role: newProfile.user_role };
        }

        console.error('Failed to fetch user profile:', error);
        return GUEST_PROFILE;
      }

      return { ...data, role: data.user_role };
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

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setAuthError(error.message);
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
      const { error } = await supabase.auth.signOut();

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

      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

      if (error) {
        setAuthError(error.message);
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      if (data.user) {
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

      const { error } = await supabase.auth.resetPasswordForEmail(email);

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

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setAuthError(error.message);
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
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
    if (!userProfile || userProfile.user_role === 'Guest') {
      return false;
    }

    // Admins have all permissions
    if (userProfile.user_role === 'Administrator' || userProfile.user_role === 'Admin') {
      return true;
    }

    // Parse detailed permissions if they exist
    if (userProfile.permissions) {
      try {
        let permissions = userProfile.permissions;
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
    if (userProfile.user_role === 'Management' || userProfile.user_role === 'Manager') {
      const managerActions = ['view', 'create', 'edit'];
      return managerActions.includes(action);
    }

    // Default permissions for employees
    if (userProfile.user_role === 'Employee') {
      return action === 'view';
    }

    return false;
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'Administrator' || userProfile?.role === 'Admin' || userProfile?.user_role === 'Administrator';
  };

  const isManager = (): boolean => {
    return userProfile?.user_role === 'Management' ||
    userProfile?.user_role === 'Manager' ||
    userProfile?.user_role === 'Administrator' ||
    userProfile?.user_role === 'Admin';
  };

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set default state first
        if (mounted) {
          setUser(null);
          setUserProfile(GUEST_PROFILE);
          setSession(null);
          setIsInitialized(true);
          setIsLoading(false);
          setAuthError(null);
        }

        // Try to get initial session, but don't fail if it doesn't work
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (mounted && session?.user && !error) {
            setUser(session.user);
            setSession(session);

            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
          }
        } catch (sessionError) {
          console.warn('Session check failed:', sessionError);
          // Continue with guest state
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(GUEST_PROFILE);
          setSession(null);
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with error handling
    let subscription: any;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);

        try {
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
        } catch (stateChangeError) {
          console.warn('Auth state change error:', stateChangeError);
        }

        setIsLoading(false);
      });
      subscription = data.subscription;
    } catch (subscriptionError) {
      console.warn('Auth subscription failed:', subscriptionError);
    }

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) {
        try {
          subscription.unsubscribe();
        } catch (unsubscribeError) {
          console.warn('Unsubscribe error:', unsubscribeError);
        }
      }
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