import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, auth } from '@/lib/supabase';
import AuditLoggerService from '@/services/auditLogger';

const auditLogger = AuditLoggerService.getInstance();

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  station_id?: string;
  employee_id: string;
  phone: string;
  hire_date: string;
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

// Default guest user profile for non-authenticated users
const GUEST_PROFILE: UserProfile = {
  id: '0',
  user_id: '0',
  role: 'Guest',
  station_id: '',
  employee_id: '',
  phone: '',
  hire_date: '',
  is_active: false,
  detailed_permissions: {}
};

export const AuthProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      const { data, error } = await supabase.
      from('user_profiles').
      select(`
          *,
          stations(name, address, phone)
        `).
      eq('user_id', userId).
      single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create a default one
          console.log('🔄 No profile found, creating default profile...');

          const defaultProfile = {
            user_id: userId,
            role: 'Employee',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          };

          const { data: newProfile, error: createError } = await supabase.
          from('user_profiles').
          insert(defaultProfile).
          select(`
              *,
              stations(name, address, phone)
            `).
          single();

          if (createError) {
            console.error('Failed to create default profile:', createError);
            return null;
          }

          return newProfile;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const safeFetchUserData = async (showErrors = false): Promise<{success: boolean;userData?: User;}> => {
    try {
      console.log('🔄 Attempting to fetch user data...');

      const { data: { user: supabaseUser }, error } = await auth.getUser();

      if (error) {
        console.log('❌ Auth error:', error);
        if (showErrors) {
          setAuthError(`Authentication failed: ${error.message}`);
        }
        setUser(null);
        setUserProfile(GUEST_PROFILE);
        return { success: false };
      }

      if (!supabaseUser) {
        console.log('👤 No user data - user not authenticated');
        setUser(null);
        setUserProfile(GUEST_PROFILE);
        setAuthError(null);
        return { success: false };
      }

      console.log('✅ User data fetched successfully:', supabaseUser);
      setUser(supabaseUser);

      // Fetch user profile
      const profile = await fetchUserProfile(supabaseUser.id);

      if (profile) {
        console.log('✅ User profile found:', profile);
        setUserProfile(profile);
      } else {
        console.log('⚠️ Using default profile');
        setUserProfile({
          id: '0',
          user_id: supabaseUser.id,
          role: 'Employee',
          station_id: '',
          employee_id: '',
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: {}
        });
      }

      setAuthError(null);
      return { success: true, userData: supabaseUser };

    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (showErrors && !errorMessage.includes('not authenticated')) {
        setAuthError(`Failed to load user data: ${errorMessage}`);
      }

      setUser(null);
      setUserProfile(GUEST_PROFILE);
      return { success: false };
    }
  };

  const refreshUserData = async (): Promise<void> => {
    console.log('🔄 Refreshing user data...');
    setIsLoading(true);
    await safeFetchUserData(true);
    setIsLoading(false);
  };

  const initializeAuth = async () => {
    console.log('🚀 Initializing authentication...');
    setIsLoading(true);

    try {
      // Check initial session
      const { data: { session }, error } = await auth.getSession();

      if (error) {
        console.error('Session error:', error);
      }

      if (session?.user) {
        await safeFetchUserData(false);
      } else {
        setUser(null);
        setUserProfile(GUEST_PROFILE);
      }

    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setAuthError(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      setUser(null);
      setUserProfile(GUEST_PROFILE);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('✅ Authentication initialization complete');
    }
  };

  useEffect(() => {
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUserProfile(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(GUEST_PROFILE);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔑 Attempting login for:', email);

      const { data, error } = await auth.signIn(email, password);

      if (error) {
        console.log('❌ Login failed:', error);
        await auditLogger.logLogin(email, false, undefined, error.message);
        setAuthError(error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        console.log('✅ Login successful');
        await auditLogger.logLogin(email, true, data.user.id);
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
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
      console.log('🚪 Logging out user...');

      // Log logout before clearing user data
      if (user) {
        await auditLogger.logLogout(user.email || '', user.id);
      }

      const { error } = await auth.signOut();

      if (error) {
        console.warn('Logout error (non-critical):', error);
      }

      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setAuthError(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('⚠️ Logout error (non-critical):', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setAuthError(null);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('📝 Attempting registration for:', email);

      const { data, error } = await auth.signUp(email, password, { name });

      if (error) {
        console.log('❌ Registration failed:', error);
        await auditLogger.logRegistration(email, false, error.message);
        setAuthError(error.message);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Registration successful');
      await auditLogger.logRegistration(email, true);
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account"
      });

      return true;
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
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
        let permissions;
        if (typeof userProfile.detailed_permissions === 'string') {
          if (userProfile.detailed_permissions.trim().startsWith('{') || userProfile.detailed_permissions.trim().startsWith('[')) {
            permissions = JSON.parse(userProfile.detailed_permissions);
          } else {
            permissions = {};
          }
        } else {
          permissions = userProfile.detailed_permissions;
        }

        if (resource && permissions[resource] && permissions[resource][action]) {
          return true;
        }
      } catch (error) {
        console.warn('Error parsing permissions, using default role-based permissions:', error);
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
    return userProfile?.role === 'Management' || userProfile?.role === 'Manager' ||
    userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';
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
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};