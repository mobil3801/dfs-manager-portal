import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuditLoggerService from '@/services/auditLogger';

const auditLogger = AuditLoggerService.getInstance();

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
  id: 0,
  user_id: 0,
  role: 'Guest',
  station: '',
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
  const [loginInProgress, setLoginInProgress] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile;

  const clearError = () => {
    setAuthError(null);
  };

  const clearUserData = () => {
    console.log('🧹 Clearing user data');
    setUser(null);
    setUserProfile(GUEST_PROFILE);
    setAuthError(null);
  };

  const safeFetchUserData = async (showErrors = false): Promise<{success: boolean;userData?: User;}> => {
    try {
      console.log('🔄 Attempting to fetch user data...');

      // Check if APIs are available
      if (!window.ezsite?.apis) {
        throw new Error('EZSite APIs not available');
      }

      // Clear any existing data first to prevent stale data issues
      clearUserData();

      const userResponse = await window.ezsite.apis.getUserInfo();
      console.log('📡 Raw user API response:', userResponse);

      // Handle response with no data (user not authenticated)
      if (!userResponse.data) {
        console.log('👤 No user data - user not authenticated');
        return { success: false };
      }

      // Handle API errors
      if (userResponse.error) {
        console.log('❌ User info API error:', userResponse.error);
        if (showErrors) {
          setAuthError(`Authentication failed: ${userResponse.error}`);
        }
        return { success: false };
      }

      const currentUser = userResponse.data;
      console.log('✅ User data fetched successfully:', currentUser);
      console.log('🔍 User ID for profile lookup:', currentUser.ID);
      console.log('📧 User Email:', currentUser.Email);

      // Set user data immediately
      setUser(currentUser);

      // Fetch user profile with the correct user ID
      try {
        console.log('🔄 Fetching user profile for user ID:', currentUser.ID);

        const profileResponse = await window.ezsite.apis.tablePage(11725, {
          PageNo: 1,
          PageSize: 1,
          Filters: [
          { name: "user_id", op: "Equal", value: currentUser.ID }]

        });

        console.log('📡 Raw profile API response:', profileResponse);

        if (profileResponse.error) {
          console.log('⚠️ Profile fetch error:', profileResponse.error);
          // Use default profile for authenticated user without profile
          const defaultProfile = {
            id: 0,
            user_id: currentUser.ID, // Use the CORRECT user ID
            role: 'Employee',
            station: 'MOBIL',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          };
          console.log('📝 Using default profile:', defaultProfile);
          setUserProfile(defaultProfile);
        } else if (profileResponse.data?.List?.length > 0) {
          const foundProfile = profileResponse.data.List[0];
          console.log('✅ User profile found:', foundProfile);
          console.log('🔍 Profile user_id:', foundProfile.user_id, 'should match current user ID:', currentUser.ID);

          // Verify the profile belongs to the current user
          if (foundProfile.user_id === currentUser.ID) {
            console.log('✅ Profile user_id matches current user - setting profile');
            setUserProfile(foundProfile);
          } else {
            console.error('❌ CRITICAL: Profile user_id does not match current user!');
            console.error('Profile user_id:', foundProfile.user_id);
            console.error('Current user ID:', currentUser.ID);

            // Use default profile to prevent wrong user data
            const defaultProfile = {
              id: 0,
              user_id: currentUser.ID,
              role: 'Employee',
              station: 'MOBIL',
              employee_id: '',
              phone: '',
              hire_date: new Date().toISOString(),
              is_active: true,
              detailed_permissions: {}
            };
            setUserProfile(defaultProfile);
          }
        } else {
          console.log('⚠️ No profile found, creating default profile');
          // Create default profile for user without one
          const defaultProfile = {
            id: 0,
            user_id: currentUser.ID, // Use the CORRECT user ID
            role: 'Employee',
            station: 'MOBIL',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          };
          console.log('📝 Using default profile for new user:', defaultProfile);
          setUserProfile(defaultProfile);
        }
      } catch (profileError) {
        console.log('⚠️ Profile fetch failed, using default:', profileError);
        // Use default profile if profile fetch fails
        const defaultProfile = {
          id: 0,
          user_id: currentUser.ID, // Use the CORRECT user ID
          role: 'Employee',
          station: 'MOBIL',
          employee_id: '',
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: {}
        };
        setUserProfile(defaultProfile);
      }

      setAuthError(null);
      return { success: true, userData: currentUser };

    } catch (error) {
      console.error('❌ Error fetching user data:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Only show error for critical failures
      if (showErrors && !errorMessage.includes('not authenticated')) {
        setAuthError(`Failed to load user data: ${errorMessage}`);
      }

      // Set guest state for any error
      clearUserData();
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
      // Wait for APIs to be available
      let attempts = 0;
      while (!window.ezsite?.apis && attempts < 30) {
        console.log(`⏳ Waiting for EZSite APIs... (attempt ${attempts + 1})`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.ezsite?.apis) {
        throw new Error('EZSite APIs failed to load');
      }

      console.log('✅ EZSite APIs loaded, fetching user data...');
      await safeFetchUserData(false);

    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setAuthError(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      clearUserData();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('✅ Authentication initialization complete');
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Prevent multiple concurrent login attempts
    if (loginInProgress) {
      console.log('⏳ Login already in progress, ignoring duplicate request');
      return false;
    }

    try {
      setLoginInProgress(true);
      setIsLoading(true);
      setAuthError(null);

      console.log('🔑 Attempting login for:', email);

      if (!window.ezsite?.apis) {
        throw new Error('Authentication system not available');
      }

      // Clear any existing user data before login
      clearUserData();

      // Small delay to prevent rapid successive calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await window.ezsite.apis.login({ email, password });

      if (response.error) {
        console.log('❌ Login API failed:', response.error);
        await auditLogger.logLogin(email, false, undefined, response.error);
        setAuthError(response.error);
        toast({
          title: "Login Failed",
          description: response.error,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Login API successful, fetching user data...');

      // Add delay to ensure server state is updated
      await new Promise((resolve) => setTimeout(resolve, 300));

      const userDataResult = await safeFetchUserData(true);

      if (userDataResult.success && userDataResult.userData) {
        console.log('✅ User data fetched successfully after login');
        console.log('👤 Logged in user:', userDataResult.userData.Email, 'ID:', userDataResult.userData.ID);
        await auditLogger.logLogin(email, true, userDataResult.userData.ID);
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        return true;
      } else {
        console.log('❌ Failed to fetch user data after successful login');
        throw new Error('Failed to load user information after login');
      }

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
      setLoginInProgress(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user...');

      // Log logout before clearing user data
      if (user) {
        await auditLogger.logLogout(user.Email, user.ID);
      }

      if (window.ezsite?.apis) {
        await window.ezsite.apis.logout();
      }

      clearUserData();

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('⚠️ Logout error (non-critical):', error);
      // Still clear local state even if API call fails
      clearUserData();
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('📝 Attempting registration for:', email);

      if (!window.ezsite?.apis) {
        throw new Error('Registration system not available');
      }

      const response = await window.ezsite.apis.register({ email, password });

      if (response.error) {
        console.log('❌ Registration failed:', response.error);
        await auditLogger.logRegistration(email, false, response.error);
        setAuthError(response.error);
        toast({
          title: "Registration Failed",
          description: response.error,
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
    if (userProfile.role === 'Administrator') {
      return true;
    }

    // Parse detailed permissions if they exist
    if (userProfile.detailed_permissions) {
      try {
        const permissions = typeof userProfile.detailed_permissions === 'string' ?
        JSON.parse(userProfile.detailed_permissions) :
        userProfile.detailed_permissions;

        if (resource && permissions[resource] && permissions[resource][action]) {
          return true;
        }
      } catch (error) {
        console.error('Error parsing permissions:', error);
      }
    }

    // Default permissions for managers
    if (userProfile.role === 'Management') {
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
    return userProfile?.role === 'Administrator';
  };

  const isManager = (): boolean => {
    return userProfile?.role === 'Management' || userProfile?.role === 'Administrator';
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