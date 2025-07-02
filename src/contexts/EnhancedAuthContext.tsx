import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuditLoggerService from '@/services/auditLogger';
import authServiceMonitor, { ServiceStatus } from '@/services/authServiceMonitor';

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
  serviceStatus: ServiceStatus | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  clearError: () => void;
  checkServiceHealth: () => Promise<ServiceStatus>;
  restartAuthService: () => Promise<void>;
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

export const EnhancedAuthProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile;

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const clearUserData = useCallback(() => {
    console.log('🧹 Clearing user data');
    setUser(null);
    setUserProfile(GUEST_PROFILE);
    setAuthError(null);
  }, []);

  // Enhanced error handling with automatic retry
  const withRetry = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Operation failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    
    throw lastError;
  };

  const safeFetchUserData = async (showErrors = false): Promise<{success: boolean; userData?: User;}> => {
    try {
      console.log('🔄 Attempting to fetch user data...');

      // Check service health first
      const healthCheck = await authServiceMonitor.forceServiceCheck();
      if (!healthCheck.isHealthy) {
        throw new Error(`Auth service unhealthy: ${healthCheck.error}`);
      }

      // Check if APIs are available
      if (!window.ezsite?.apis) {
        throw new Error('EZSite APIs not available');
      }

      // Clear any existing data first to prevent stale data issues
      clearUserData();

      const userResponse = await withRetry(async () => {
        return await window.ezsite.apis.getUserInfo();
      });

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
      
      // Set user data immediately
      setUser(currentUser);

      // Fetch user profile with retry logic
      try {
        console.log('🔄 Fetching user profile for user ID:', currentUser.ID);

        const profileResponse = await withRetry(async () => {
          return await window.ezsite.apis.tablePage(11725, {
            PageNo: 1,
            PageSize: 1,
            Filters: [{ name: "user_id", op: "Equal", value: currentUser.ID }]
          });
        });

        console.log('📡 Raw profile API response:', profileResponse);

        if (profileResponse.error) {
          console.log('⚠️ Profile fetch error:', profileResponse.error);
          // Use default profile for authenticated user without profile
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
          console.log('📝 Using default profile:', defaultProfile);
          setUserProfile(defaultProfile);
        } else if (profileResponse.data?.List?.length > 0) {
          const foundProfile = profileResponse.data.List[0];
          console.log('✅ User profile found:', foundProfile);
          
          // Verify the profile belongs to the current user
          if (foundProfile.user_id === currentUser.ID) {
            console.log('✅ Profile user_id matches current user - setting profile');
            setUserProfile(foundProfile);
          } else {
            console.error('❌ CRITICAL: Profile user_id does not match current user!');
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
          console.log('📝 Using default profile for new user:', defaultProfile);
          setUserProfile(defaultProfile);
        }
      } catch (profileError) {
        console.log('⚠️ Profile fetch failed, using default:', profileError);
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

      setAuthError(null);
      setRetryCount(0); // Reset retry count on success
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
    try {
      await safeFetchUserData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAuth = async () => {
    console.log('🚀 Initializing enhanced authentication...');
    setIsLoading(true);

    try {
      // Start service monitoring
      await authServiceMonitor.startMonitoring();

      // Wait for APIs to be available with enhanced retry logic
      let attempts = 0;
      const maxAttempts = 60; // Wait up to 1 minute
      
      while (!window.ezsite?.apis && attempts < maxAttempts) {
        console.log(`⏳ Waiting for EZSite APIs... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!window.ezsite?.apis) {
        throw new Error('EZSite APIs failed to load after extended wait');
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
      console.log('✅ Enhanced authentication initialization complete');
    }
  };

  // Service status monitoring
  useEffect(() => {
    const handleStatusChange = (status: ServiceStatus) => {
      setServiceStatus(status);
      
      if (!status.isHealthy && status.consecutiveFailures >= 3) {
        setAuthError(`Authentication service is experiencing issues: ${status.error}`);
        toast({
          title: "Authentication Service Warning",
          description: "The authentication service is temporarily unavailable. Attempting to restore...",
          variant: "destructive"
        });
      } else if (status.isHealthy && authError?.includes('service')) {
        setAuthError(null);
        toast({
          title: "Authentication Service Restored",
          description: "The authentication service is now working normally.",
        });
      }
    };

    authServiceMonitor.addStatusListener(handleStatusChange);
    
    return () => {
      authServiceMonitor.removeStatusListener(handleStatusChange);
    };
  }, [authError, toast]);

  useEffect(() => {
    initializeAuth();
    
    return () => {
      // Cleanup monitoring on unmount
      authServiceMonitor.stopMonitoring();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (loginInProgress) {
      console.log('⏳ Login already in progress, ignoring duplicate request');
      return false;
    }

    try {
      setLoginInProgress(true);
      setIsLoading(true);
      setAuthError(null);

      console.log('🔐 Attempting enhanced login for:', email);

      // Check service health before attempting login
      const healthCheck = await authServiceMonitor.forceServiceCheck();
      if (!healthCheck.isHealthy) {
        throw new Error(`Authentication service is unavailable: ${healthCheck.error}`);
      }

      if (!window.ezsite?.apis) {
        throw new Error('Authentication system not available');
      }

      // Clear any existing user data before login
      clearUserData();

      // Small delay to prevent rapid successive calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await withRetry(async () => {
        return await window.ezsite.apis.login({ email, password });
      });

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userDataResult = await safeFetchUserData(true);

      if (userDataResult.success && userDataResult.userData) {
        console.log('✅ User data fetched successfully after login');
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
        await withRetry(async () => {
          await window.ezsite.apis.logout();
        });
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

      // Check service health before attempting registration
      const healthCheck = await authServiceMonitor.forceServiceCheck();
      if (!healthCheck.isHealthy) {
        throw new Error(`Authentication service is unavailable: ${healthCheck.error}`);
      }

      if (!window.ezsite?.apis) {
        throw new Error('Registration system not available');
      }

      const response = await withRetry(async () => {
        return await window.ezsite.apis.register({ email, password });
      });

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

  const checkServiceHealth = async (): Promise<ServiceStatus> => {
    return await authServiceMonitor.forceServiceCheck();
  };

  const restartAuthService = async (): Promise<void> => {
    console.log('🔄 Restarting authentication service...');
    setIsLoading(true);
    
    try {
      // Stop current monitoring
      authServiceMonitor.stopMonitoring();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Restart monitoring
      await authServiceMonitor.startMonitoring();
      
      // Re-initialize auth
      await initializeAuth();
      
      toast({
        title: "Service Restarted",
        description: "Authentication service has been restarted successfully"
      });
    } catch (error) {
      console.error('❌ Failed to restart auth service:', error);
      toast({
        title: "Restart Failed",
        description: "Failed to restart authentication service",
        variant: "destructive"
      });
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
    serviceStatus,
    login,
    logout,
    register,
    refreshUserData,
    hasPermission,
    isAdmin,
    isManager,
    clearError,
    checkServiceHealth,
    restartAuthService
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
