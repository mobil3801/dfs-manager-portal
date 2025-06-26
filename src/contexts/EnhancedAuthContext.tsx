import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';

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
  detailed_permissions: string;
}

interface EnhancedAuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  login: (credentials: {email: string;password: string;}) => Promise<string | null>;
  register: (credentials: {email: string;password: string;}) => Promise<string | null>;
  logout: () => Promise<string | null>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  loading: boolean;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  hasStationAccess: (station: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize enhanced permissions hook
  const {
    hasPermission: permissionCheck,
    hasStationAccess: stationAccessCheck,
    isAdmin: adminCheck,
    isManager: managerCheck,
    refreshPermissions
  } = useEnhancedPermissions();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await window.ezsite.apis.getUserInfo();
      if (response.data && !response.error) {
        setUser(response.data);
        setIsAuthenticated(true);
        await loadUserProfile(response.data.ID);
        await refreshPermissions();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: number) => {
    try {
      const response = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "id",
        IsAsc: false,
        Filters: [
        { name: "user_id", op: "Equal", value: userId }]

      });

      if (response.data?.List?.[0]) {
        setUserProfile(response.data.List[0]);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (credentials: {email: string;password: string;}): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await window.ezsite.apis.login(credentials);

      if (response.error) {
        return response.error;
      }

      // Log audit event
      await logAuditEvent('Login', 'User logged in successfully', 'Success');

      await checkAuthStatus();
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      // Log failed login
      await logAuditEvent('Login', 'Login attempt failed', 'Failed', errorMessage);

      return errorMessage;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: {email: string;password: string;}): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await window.ezsite.apis.register(credentials);

      if (response.error) {
        return response.error;
      }

      // Log audit event
      await logAuditEvent('Registration', 'User registered successfully', 'Success');

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      // Log failed registration
      await logAuditEvent('Registration', 'Registration attempt failed', 'Failed', errorMessage);

      return errorMessage;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<string | null> => {
    try {
      setLoading(true);

      // Log audit event before logout
      await logAuditEvent('Logout', 'User logged out', 'Success');

      const response = await window.ezsite.apis.logout();

      if (response.error) {
        return response.error;
      }

      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);

      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Logout failed';
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!userProfile) return;

    try {
      const response = await window.ezsite.apis.tableUpdate(11725, {
        id: userProfile.id,
        ...profileData
      });

      if (response.error) throw new Error(response.error);

      // Update local state
      setUserProfile((prev) => prev ? { ...prev, ...profileData } : null);

      // Log audit event
      await logAuditEvent('Profile Update', 'User profile updated', 'Success');

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);

      // Log failed update
      await logAuditEvent('Profile Update', 'Profile update failed', 'Failed');

      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (user) {
      await loadUserProfile(user.ID);
      await refreshPermissions();
    }
  };

  const logAuditEvent = async (
  eventType: string,
  actionPerformed: string,
  status: 'Success' | 'Failed' = 'Success',
  failureReason?: string) =>
  {
    try {
      await window.ezsite.apis.tableCreate(12706, {
        event_type: eventType,
        user_id: user?.ID || 0,
        username: user?.Email || 'anonymous',
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        event_timestamp: new Date().toISOString(),
        event_status: status,
        resource_accessed: 'Authentication',
        action_performed: actionPerformed,
        failure_reason: failureReason || '',
        session_id: Date.now().toString(),
        risk_level: status === 'Failed' ? 'Medium' : 'Low',
        additional_data: JSON.stringify({
          module: 'EnhancedAuth',
          timestamp: Date.now()
        }),
        station: userProfile?.station || ''
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  const value: EnhancedAuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile,
    refreshUserData,
    loading,
    hasPermission: permissionCheck,
    hasStationAccess: stationAccessCheck,
    isAdmin: adminCheck,
    isManager: managerCheck
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>);

};

export const useEnhancedAuth = (): EnhancedAuthContextType => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export default EnhancedAuthProvider;