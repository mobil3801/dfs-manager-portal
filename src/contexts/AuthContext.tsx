
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const fetchUserData = async () => {
    try {
      const userResponse = await window.ezsite.apis.getUserInfo();
      if (userResponse.error) {
        throw new Error(userResponse.error);
      }

      if (userResponse.data) {
        setUser(userResponse.data);
        
        // Fetch user profile
        const profileResponse = await window.ezsite.apis.tablePage(11725, {
          PageNo: 1,
          PageSize: 1,
          Filters: [
            { name: "user_id", op: "Equal", value: userResponse.data.ID }
          ]
        });

        if (profileResponse.data?.List?.length > 0) {
          setUserProfile(profileResponse.data.List[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setUserProfile(null);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await fetchUserData();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await window.ezsite.apis.login({ email, password });
      if (response.error) {
        await auditLogger.logLogin(email, false, undefined, response.error);
        toast({
          title: "Login Failed",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      await fetchUserData();
      
      // Log successful login
      await auditLogger.logLogin(email, true, user?.ID);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      await auditLogger.logLogin(email, false, undefined, 'System error');
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Log logout before clearing user data
      if (user) {
        await auditLogger.logLogout(user.Email, user.ID);
      }

      await window.ezsite.apis.logout();
      setUser(null);
      setUserProfile(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(null);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await window.ezsite.apis.register({ email, password });
      if (response.error) {
        await auditLogger.logRegistration(email, false, response.error);
        toast({
          title: "Registration Failed",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      await auditLogger.logRegistration(email, true);
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account",
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      await auditLogger.logRegistration(email, false, 'System error');
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!userProfile) return false;
    
    // Admins have all permissions
    if (userProfile.role === 'Administrator') return true;
    
    // Parse detailed permissions if they exist
    if (userProfile.detailed_permissions) {
      try {
        const permissions = typeof userProfile.detailed_permissions === 'string' 
          ? JSON.parse(userProfile.detailed_permissions) 
          : userProfile.detailed_permissions;
        
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
    login,
    logout,
    register,
    refreshUserData,
    hasPermission,
    isAdmin,
    isManager,
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
