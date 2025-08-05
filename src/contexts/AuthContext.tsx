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

  const safeExecute = async <T,>(
  operation: () => Promise<T>,
  fallback: T,
  errorContext: string)
  : Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      console.error(`Error in ${errorContext}:`, error);
      return fallback;
    }
  };

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    return safeExecute(async () => {
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
    }, null, 'fetchUserProfile');
  };

  const safeFetchUserData = async (showErrors = false): Promise<{success: boolean;userData?: User;}> => {
    return safeExecute(async () => {
      console.log('🔄 Attempting to fetch user data...');

      const { data: { user: supabaseUser }, error } = await auth.getUser();

      if (error) {
        console.log('❌ Auth error:', error);
        // Only show meaningful errors to users
        if (showErrors && !error.message.includes('not authenticated') && !error.message.includes('JWT')) {
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

      console.log('✅ User data fetched successfully:', supabaseUser.email);
      setUser(supabaseUser);

      // Fetch user profile with retry logic
      let profile = await fetchUserProfile(supabaseUser.id);
      
      // If no profile found, try creating one
      if (!profile) {
        console.log('⚠️ No profile found, creating default profile...');
        try {
          const defaultProfile = {
            user_id: supabaseUser.id,
            role: 'Employee',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          };

          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(defaultProfile)
            .select(`
              *,
              stations(name, address, phone)
            `)
            .single();

          if (!createError && newProfile) {
            profile = newProfile;
            console.log('✅ Default profile created:', profile);
          }
        } catch (createError) {
          console.warn('Failed to create default profile:', createError);
        }
      }

      if (profile) {
        console.log('✅ User profile loaded:', profile.role);
        setUserProfile(profile);
      } else {
        console.log('⚠️ Using fallback profile');
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

    }, { success: false }, 'safeFetchUserData');
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('not authenticated')) {
        setAuthError(`Initialization failed: ${errorMessage}`);
      }
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

      try {
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
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    return safeExecute(async () => {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔑 Attempting login for:', email);

      const { data, error } = await auth.signIn(email.trim(), password);

      if (error) {
        console.log('❌ Login failed:', error);
        await safeExecute(
          () => auditLogger.logLogin(email, false, undefined, error.message),
          undefined,
          'loginAuditLog'
        );
        
        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please check your email and click the verification link before logging in.';
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many login attempts. Please wait a moment and try again.';
        }
        
        setAuthError(userMessage);
        toast({
          title: "Login Failed",
          description: userMessage,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        console.log('✅ Login successful for:', data.user.email);
        await safeExecute(
          () => auditLogger.logLogin(email, true, data.user.id),
          undefined,
          'loginSuccessAuditLog'
        );
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.email}!`
        });
        return true;
      }

      return false;

    }, false, 'login').finally(() => {
      setIsLoading(false);
    });
  };

  const logout = async (): Promise<void> => {
    return safeExecute(async () => {
      console.log('🚪 Logging out user...');

      // Log logout before clearing user data
      if (user) {
        await safeExecute(
          () => auditLogger.logLogout(user.email || '', user.id),
          undefined,
          'logoutAuditLog'
        );
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
    }, undefined, 'logout');
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    return safeExecute(async () => {
      setIsLoading(true);
      setAuthError(null);

      console.log('📝 Attempting registration for:', email);

      const { data, error } = await auth.signUp(email.trim(), password, { name });

      if (error) {
        console.log('❌ Registration failed:', error);
        await safeExecute(
          () => auditLogger.logRegistration(email, false, error.message),
          undefined,
          'registrationAuditLog'
        );
        
        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('User already registered')) {
          userMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('Password should be at least')) {
          userMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Signup is disabled')) {
          userMessage = 'Account registration is currently disabled. Please contact an administrator.';
        }
        
        setAuthError(userMessage);
        toast({
          title: "Registration Failed",
          description: userMessage,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Registration successful');
      await safeExecute(
        () => auditLogger.logRegistration(email, true),
        undefined,
        'registrationSuccessAuditLog'
      );
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account before logging in."
      });

      return true;
    }, false, 'register').finally(() => {
      setIsLoading(false);
    });
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