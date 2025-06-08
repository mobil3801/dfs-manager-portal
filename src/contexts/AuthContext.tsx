import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import AuditLoggerService from '@/services/auditLogger';

interface User {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
}

interface UserProfile {
  ID: number;
  user_id: number;
  role: 'Administrator' | 'Management' | 'Employee';
  station: string;
  employee_id: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  detailed_permissions?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  hasPermission: (feature: string, action: 'read' | 'write') => boolean;
  canEdit: (feature?: string) => boolean;
  canDelete: (feature?: string) => boolean;
  canCreate: (feature?: string) => boolean;
  canViewLogs: (feature?: string) => boolean;
  isVisualEditingEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Access matrix with monitoring restrictions
const ACCESS_MATRIX = {
  Employee: {
    dashboard: ['read', 'write'],
    products: ['read', 'write'],
    employees: ['read', 'write'],
    sales: ['read', 'write'],
    vendors: ['read', 'write'],
    orders: ['read', 'write'],
    licenses: ['read', 'write'],
    monitoring: [] // No monitoring access
  },
  Management: {
    dashboard: ['read', 'write'],
    products: ['read', 'write'],
    employees: ['read', 'write'],
    sales: ['read', 'write'],
    vendors: ['read', 'write'],
    orders: ['read', 'write'],
    licenses: ['read', 'write'],
    monitoring: ['read'] // Limited monitoring access
  },
  Administrator: {
    dashboard: ['read', 'write'],
    products: ['read', 'write'],
    employees: ['read', 'write'],
    sales: ['read', 'write'],
    vendors: ['read', 'write'],
    orders: ['read', 'write'],
    licenses: ['read', 'write'],
    monitoring: ['read', 'write'] // Full monitoring access
  }
};

export const AuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      console.log('Checking user session...');
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (error) {
        console.log('No active session:', error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Active session found for user:', data);
        setUser(data);
        await fetchUserProfile(data.ID);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: number) => {
    try {
      console.log('Fetching user profile for user ID:', userId);
      
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (data && data.List && data.List.length > 0) {
        console.log('User profile found:', data.List[0]);
        setUserProfile(data.List[0]);
      } else {
        console.log('No user profile found, creating default admin profile...');
        
        // Create default admin profile for new users
        const defaultProfile = {
          user_id: userId,
          role: 'Administrator' as const,
          station: 'ALL',
          employee_id: 'EMP' + userId.toString().padStart(4, '0'),
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: JSON.stringify({
            canViewReports: true,
            canEditProducts: true,
            canManageUsers: true,
            canAccessAdmin: true,
            canViewLogs: true
          })
        };

        console.log('Creating user profile:', defaultProfile);

        const { error: createError } = await window.ezsite.apis.tableCreate('11725', defaultProfile);
        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }

        console.log('User profile created successfully, fetching updated profile...');
        
        // Fetch the created profile
        await fetchUserProfile(userId);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile. Please try logging in again.",
        variant: "destructive"
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const auditLogger = AuditLoggerService.getInstance();

    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const { error } = await window.ezsite.apis.login({ email, password });

      if (error) {
        console.error('Login failed:', error);
        // Log failed login attempt
        await auditLogger.logLogin(email, false, undefined, error);

        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive"
        });
        return false;
      }

      console.log('Login successful, getting user info...');

      // Get user info after successful login
      const { data: userData, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) {
        console.error('Failed to get user info:', userError);
        await auditLogger.logLogin(email, false, undefined, 'Failed to get user information');

        toast({
          title: "Error",
          description: "Failed to get user information",
          variant: "destructive"
        });
        return false;
      }

      console.log('User data retrieved:', userData);
      setUser(userData);
      await fetchUserProfile(userData.ID);

      // Log successful login
      await auditLogger.logLogin(email, true, userData.ID);

      toast({
        title: "Success",
        description: "Login successful!"
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      await auditLogger.logLogin(email, false, undefined, 'Unexpected error during login');

      toast({
        title: "Error",
        description: "An unexpected error occurred during login",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    const auditLogger = AuditLoggerService.getInstance();

    try {
      setLoading(true);
      console.log('Attempting registration for:', email);
      
      const { error } = await window.ezsite.apis.register({ email, password });

      if (error) {
        console.error('Registration failed:', error);
        // Log failed registration attempt
        await auditLogger.logRegistration(email, false, error);

        toast({
          title: "Registration Failed",
          description: error,
          variant: "destructive"
        });
        return false;
      }

      // Log successful registration
      await auditLogger.logRegistration(email, true);

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account."
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      await auditLogger.logRegistration(email, false, 'Unexpected error during registration');

      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const auditLogger = AuditLoggerService.getInstance();

    try {
      console.log('Logging out user...');
      
      // Log logout before clearing user state
      if (user) {
        await auditLogger.logLogout(user.Email, user.ID);
      }

      await window.ezsite.apis.logout();
      setUser(null);
      setUserProfile(null);
      
      console.log('Logout successful');
      
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (feature: string, action: 'read' | 'write'): boolean => {
    if (!userProfile) return false;

    // Special handling for admin features
    if (feature === 'admin' || feature === 'monitoring') {
      return userProfile.role === 'Administrator' || userProfile.role === 'Management';
    }

    // Full access for all other features for authenticated users
    return true;
  };

  const canEdit = (feature?: string): boolean => {
    if (!userProfile) return false;

    // Admin features restricted to Administrator and Management
    if (feature === 'admin' || feature === 'monitoring') {
      return userProfile.role === 'Administrator' || userProfile.role === 'Management';
    }

    // Full editing access for all other features
    return true;
  };

  const canDelete = (feature?: string): boolean => {
    if (!userProfile) return false;

    // Admin features restricted to Administrator and Management
    if (feature === 'admin' || feature === 'monitoring') {
      return userProfile.role === 'Administrator' || userProfile.role === 'Management';
    }

    // Full delete access for all other features
    return true;
  };

  const canCreate = (feature?: string): boolean => {
    if (!userProfile) return false;

    // Admin features restricted to Administrator and Management
    if (feature === 'admin' || feature === 'monitoring') {
      return userProfile.role === 'Administrator' || userProfile.role === 'Management';
    }

    // Full create access for all other features
    return true;
  };

  const canViewLogs = (feature?: string): boolean => {
    if (!userProfile) return false;

    // Admin features restricted to Administrator and Management
    if (feature === 'admin' || feature === 'monitoring') {
      return userProfile.role === 'Administrator' || userProfile.role === 'Management';
    }

    // Full log viewing access for all other features
    return true;
  };

  const isVisualEditingEnabled = true;
  const isAdmin = userProfile?.role === 'Administrator' || userProfile?.role === 'Management';

  console.log('Auth context state:', {
    user: user?.Email,
    userProfile: userProfile?.role,
    isAdmin,
    loading
  });

  const value = {
    user,
    userProfile,
    isAdmin,
    login,
    logout,
    register,
    loading,
    hasPermission,
    canEdit,
    canDelete,
    canCreate,
    canViewLogs,
    isVisualEditingEnabled
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};