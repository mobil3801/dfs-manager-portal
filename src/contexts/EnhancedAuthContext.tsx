import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ezsite?: {
      apis?: {
        login: (credentials: { email: string; password: string }) => Promise<{ error?: string }>;
        logout: () => Promise<{ error?: string }>;
        register: (credentials: { email: string; password: string }) => Promise<{ error?: string }>;
        getUserInfo: () => Promise<{ data?: User; error?: string }>;
        sendResetPwdEmail: (email: { email: string }) => Promise<{ error?: string }>;
        resetPassword: (resetInfo: { token: string; password: string }) => Promise<{ error?: string }>;
        tablePage: (tableId: number, params: any) => Promise<{ data?: any; error?: string }>;
        tableCreate: (tableId: number, data: any) => Promise<{ error?: string }>;
        tableUpdate: (tableId: number, data: any) => Promise<{ error?: string }>;
        tableDelete: (tableId: number, params: any) => Promise<{ error?: string }>;
        upload: (fileInfo: { filename: string; file: File }) => Promise<{ data?: number; error?: string }>;
      };
    };
  }
}

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

interface EnhancedAuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;
  apiStatus: 'checking' | 'available' | 'unavailable';
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  clearError: () => void;
  checkApiAvailability: () => Promise<boolean>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

// Default guest user profile
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

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile;

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const checkApiAvailability = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Checking EZSite API availability...');
    
    try {
      // Check if window.ezsite exists
      if (!window.ezsite) {
        console.log('⏳ EZSite object not found, waiting...');
        return false;
      }

      // Check if APIs are available
      if (!window.ezsite.apis) {
        console.log('⏳ EZSite APIs not found, waiting...');
        return false;
      }

      // Test a simple API call to verify functionality
      const testResponse = await window.ezsite.apis.getUserInfo();
      console.log('✅ EZSite APIs are available and functional');
      setApiStatus('available');
      return true;
    } catch (error) {
      console.log('❌ EZSite APIs test failed:', error);
      setApiStatus('unavailable');
      return false;
    }
  }, []);

  const waitForApis = useCallback(async (maxAttempts = 50, interval = 200): Promise<boolean> => {
    console.log('⏳ Waiting for EZSite APIs to become available...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isAvailable = await checkApiAvailability();
      
      if (isAvailable) {
        console.log(`✅ EZSite APIs available after ${attempt} attempts`);
        return true;
      }

      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - APIs not ready yet`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    console.log('❌ EZSite APIs failed to become available after maximum attempts');
    setApiStatus('unavailable');
    setAuthError('Authentication system is temporarily unavailable. Please refresh the page.');
    return false;
  }, [checkApiAvailability]);

  const safeFetchUserData = useCallback(async (showErrors = false): Promise<{ success: boolean; userData?: User }> => {
    try {
      console.log('📊 Fetching user data...');

      const userResponse = await window.ezsite?.apis?.getUserInfo();

      if (!userResponse) {
        throw new Error('No response from authentication service');
      }

      // Handle no data (user not authenticated)
      if (!userResponse.data) {
        console.log('👤 No user data - user not authenticated');
        setUser(null);
        setUserProfile(GUEST_PROFILE);
        setAuthError(null);
        return { success: false };
      }

      // Handle API errors
      if (userResponse.error) {
        console.log('❌ User info API error:', userResponse.error);
        if (showErrors) {
          setAuthError(`Authentication failed: ${userResponse.error}`);
        }
        setUser(null);
        setUserProfile(GUEST_PROFILE);
        return { success: false };
      }

      console.log('✅ User data fetched successfully:', userResponse.data);
      setUser(userResponse.data);

      // Fetch user profile
      try {
        console.log('📋 Fetching user profile for user ID:', userResponse.data.ID);

        const profileResponse = await window.ezsite?.apis?.tablePage(11725, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: "user_id", op: "Equal", value: userResponse.data.ID }]
        });

        if (profileResponse?.error) {
          console.log('⚠️ Profile fetch error:', profileResponse.error);
          // Use default profile for authenticated user without profile
          setUserProfile({
            id: 0,
            user_id: userResponse.data.ID,
            role: 'Employee',
            station: 'MOBIL',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          });
        } else if (profileResponse?.data?.List?.length > 0) {
          console.log('✅ User profile found:', profileResponse.data.List[0]);
          setUserProfile(profileResponse.data.List[0]);
        } else {
          console.log('⚠️ No profile found, creating default profile');
          setUserProfile({
            id: 0,
            user_id: userResponse.data.ID,
            role: 'Employee',
            station: 'MOBIL',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          });
        }
      } catch (profileError) {
        console.log('⚠️ Profile fetch failed, using default:', profileError);
        setUserProfile({
          id: 0,
          user_id: userResponse.data.ID,
          role: 'Employee',
          station: 'MOBIL',
          employee_id: '',
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: {}
        });
      }

      setAuthError(null);
      return { success: true, userData: userResponse.data };

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
  }, []);

  const refreshUserData = useCallback(async (): Promise<void> => {
    console.log('🔄 Refreshing user data...');
    setIsLoading(true);
    await safeFetchUserData(true);
    setIsLoading(false);
  }, [safeFetchUserData]);

  const initializeAuth = useCallback(async () => {
    console.log('🚀 Initializing enhanced authentication...');
    setIsLoading(true);
    setApiStatus('checking');

    try {
      // Wait for APIs to be available
      const apisAvailable = await waitForApis();
      
      if (!apisAvailable) {
        throw new Error('Authentication system failed to initialize');
      }

      console.log('✅ EZSite APIs available, fetching user data...');
      await safeFetchUserData(false);

    } catch (error) {
      console.error('❌ Enhanced auth initialization failed:', error);
      setAuthError(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setApiStatus('unavailable');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('✅ Enhanced authentication initialization complete');
    }
  }, [waitForApis, safeFetchUserData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      console.log('🔐 Attempting enhanced login for:', email);

      if (!window.ezsite?.apis) {
        throw new Error('Authentication system not available');
      }

      const response = await window.ezsite.apis.login({ email, password });

      if (response.error) {
        console.log('❌ Login API failed:', response.error);
        setAuthError(response.error);
        toast({
          title: "Login Failed",
          description: response.error,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Login API successful, fetching user data...');
      await new Promise(resolve => setTimeout(resolve, 200));

      const userDataResult = await safeFetchUserData(true);

      if (userDataResult.success && userDataResult.userData) {
        console.log('✅ User data fetched successfully after login');
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
      console.error('❌ Enhanced login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [safeFetchUserData, toast]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user...');

      if (window.ezsite?.apis) {
        await window.ezsite.apis.logout();
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
      setUser(null);
      setUserProfile(GUEST_PROFILE);
      setAuthError(null);
    }
  }, [toast]);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      console.log('📝 Attempting enhanced registration for:', email);

      if (!window.ezsite?.apis) {
        throw new Error('Registration system not available');
      }

      const response = await window.ezsite.apis.register({ email, password });

      if (response.error) {
        console.log('❌ Registration failed:', response.error);
        setAuthError(response.error);
        toast({
          title: "Registration Failed",
          description: response.error,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Registration successful');
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account"
      });

      return true;
    } catch (error) {
      console.error('❌ Enhanced registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const hasPermission = useCallback((action: string, resource?: string): boolean => {
    if (!userProfile || userProfile.role === 'Guest') {
      return false;
    }

    if (userProfile.role === 'Administrator' || userProfile.role === 'Admin') {
      return true;
    }

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

    if (userProfile.role === 'Management' || userProfile.role === 'Manager') {
      const managerActions = ['view', 'create', 'edit'];
      return managerActions.includes(action);
    }

    if (userProfile.role === 'Employee') {
      return action === 'view';
    }

    return false;
  }, [userProfile]);

  const isAdmin = useCallback((): boolean => {
    return userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';
  }, [userProfile]);

  const isManager = useCallback((): boolean => {
    return userProfile?.role === 'Management' || userProfile?.role === 'Manager' ||
           userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';
  }, [userProfile]);

  const value: EnhancedAuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    authError,
    isInitialized,
    apiStatus,
    login,
    logout,
    register,
    refreshUserData,
    hasPermission,
    isAdmin,
    isManager,
    clearError,
    checkApiAvailability
  };

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>;
};

export const useEnhancedAuth = (): EnhancedAuthContextType => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};
