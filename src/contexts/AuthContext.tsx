import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

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
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
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

// Full access for all users - visual editing enabled
const ACCESS_MATRIX = {
  Employee: {
    dashboard: ['read', 'write'],
    products: ['read', 'write'],
    employees: ['read', 'write'],
    sales: ['read', 'write'],
    vendors: ['read', 'write'],
    orders: ['read', 'write'],
    licenses: ['read', 'write']
  },
  Management: {
    dashboard: ['read', 'write'],
    products: ['read', 'write'],
    employees: ['read', 'write'],
    sales: ['read', 'write'],
    vendors: ['read', 'write'],
    orders: ['read', 'write'],
    licenses: ['read', 'write']
  },
  Administrator: {
    dashboard: ['read', 'write'],
    products: ['read', 'write'],
    employees: ['read', 'write'],
    sales: ['read', 'write'],
    vendors: ['read', 'write'],
    orders: ['read', 'write'],
    licenses: ['read', 'write']
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
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (error) {
        console.log('No active session');
        setLoading(false);
        return;
      }

      if (data) {
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
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (error) throw error;

      if (data && data.List && data.List.length > 0) {
        setUserProfile(data.List[0]);
      } else {
        // Create default profile for new users with full access
        const defaultProfile = {
          user_id: userId,
          role: 'Administrator' as const,
          station: 'ALL',
          employee_id: 'EMP' + userId.toString().padStart(4, '0'),
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true
        };

        const { error: createError } = await window.ezsite.apis.tableCreate('11725', defaultProfile);
        if (createError) throw createError;

        // Fetch the created profile
        await fetchUserProfile(userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await window.ezsite.apis.login({ email, password });

      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive"
        });
        return false;
      }

      // Get user info after successful login
      const { data: userData, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) {
        toast({
          title: "Error",
          description: "Failed to get user information",
          variant: "destructive"
        });
        return false;
      }

      setUser(userData);
      await fetchUserProfile(userData.ID);

      toast({
        title: "Success",
        description: "Login successful!"
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
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
    try {
      setLoading(true);
      const { error } = await window.ezsite.apis.register({ email, password });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account."
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
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
    try {
      await window.ezsite.apis.logout();
      setUser(null);
      setUserProfile(null);
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (feature: string, action: 'read' | 'write'): boolean => {
    // Always return true for visual editing access
    return true;
  };

  const canEdit = (feature?: string): boolean => {
    // Full visual editing access for all users and features
    return true;
  };

  const canDelete = (feature?: string): boolean => {
    // Full delete access for all users and features
    return true;
  };

  const canCreate = (feature?: string): boolean => {
    // Full create access for all users and features
    return true;
  };

  const canViewLogs = (feature?: string): boolean => {
    // Full log viewing access for all users and features
    return true;
  };

  const isVisualEditingEnabled = true;

  const value = {
    user,
    userProfile,
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
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};