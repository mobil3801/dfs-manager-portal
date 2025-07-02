import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface User {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
}

export interface UserProfile {
  id?: number;
  user_id: number;
  username: string;
  full_name: string;
  role: string;
  phone: string;
  department: string;
  status: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, additionalData?: Partial<UserProfile>) => Promise<boolean>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const TABLE_ID = '24040'; // UserProfile table ID

  // Load user and profile on app start
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const { data: userData, error: userError } = await window.ezsite.apis.getUserInfo();
        if (userError || !userData) {
          setUser(null);
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(userData);

        // Load user profile
        const { data: profileData, error: profileError } = await window.ezsite.apis.tablePage(TABLE_ID, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'user_id', op: 'Equal', value: userData.ID }]
        });

        if (!profileError && profileData?.List?.length > 0) {
          setUserProfile(profileData.List[0]);
        } else {
          // Create default profile if none exists
          const defaultProfile: Partial<UserProfile> = {
            user_id: userData.ID,
            username: userData.Email.split('@')[0],
            full_name: userData.Name || userData.Email.split('@')[0],
            role: 'employee',
            phone: '',
            department: '',
            status: 'active',
            avatar_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: createError } = await window.ezsite.apis.tableCreate(TABLE_ID, defaultProfile);
          if (!createError) {
            setUserProfile(defaultProfile as UserProfile);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await window.ezsite.apis.login({ email, password });
      if (error) {
        toast.error(error);
        return false;
      }

      // Reload user data after successful login
      const { data: userData, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError || !userData) {
        toast.error('Failed to load user information');
        return false;
      }

      setUser(userData);

      // Load user profile
      const { data: profileData, error: profileError } = await window.ezsite.apis.tablePage(TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: userData.ID }]
      });

      if (!profileError && profileData?.List?.length > 0) {
        setUserProfile(profileData.List[0]);
      }

      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const register = async (email: string, password: string, additionalData?: Partial<UserProfile>): Promise<boolean> => {
    try {
      const { error } = await window.ezsite.apis.register({ email, password });
      if (error) {
        toast.error(error);
        return false;
      }

      toast.success('Registration successful. Please check your email for verification.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await window.ezsite.apis.logout();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const updatedData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableUpdate(TABLE_ID, {
        id: userProfile.id,
        ...updatedData
      });

      if (error) {
        toast.error(error);
        return false;
      }

      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    return userProfile?.role === role;
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin';
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    hasRole,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
