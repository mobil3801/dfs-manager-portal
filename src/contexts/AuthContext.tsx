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

export interface UserRole {
  id: number;
  role_name: string;
  role_display_name: string;
  role_description: string;
  permissions_json: string;
  is_active: boolean;
  is_system_role: boolean;
  created_by: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, additionalData?: Partial<UserProfile>) => Promise<boolean>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  hasPermission: (module: string, action: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isActive: () => boolean;
  refreshUserData: () => Promise<void>;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const USER_PROFILE_TABLE_ID = '24040';
  const USER_ROLES_TABLE_ID = '24054';

  // Load user data helper function
  const loadUserData = async (userData: User) => {
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await window.ezsite.apis.tablePage(USER_PROFILE_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: userData.ID }]
      });

      let currentProfile: UserProfile | null = null;

      if (!profileError && profileData?.List?.length > 0) {
        currentProfile = profileData.List[0];
        setUserProfile(currentProfile);
      } else {
        // Create default profile if none exists
        const defaultProfile: Partial<UserProfile> = {
          user_id: userData.ID,
          username: userData.Email.split('@')[0],
          full_name: userData.Name || userData.Email.split('@')[0],
          role: 'employee', // Default role
          phone: '',
          department: '',
          status: 'active',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await window.ezsite.apis.tableCreate(USER_PROFILE_TABLE_ID, defaultProfile);
        if (!createError) {
          currentProfile = { ...defaultProfile, id: createdProfile } as UserProfile;
          setUserProfile(currentProfile);
        }
      }

      // Load user role details
      if (currentProfile?.role) {
        const { data: roleData, error: roleError } = await window.ezsite.apis.tablePage(USER_ROLES_TABLE_ID, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'role_name', op: 'Equal', value: currentProfile.role }]
        });

        if (!roleError && roleData?.List?.length > 0) {
          setUserRole(roleData.List[0]);
        } else {
          // Create default roles if they don't exist
          await createDefaultRoles();
          // Try loading role again
          const { data: retryRoleData } = await window.ezsite.apis.tablePage(USER_ROLES_TABLE_ID, {
            PageNo: 1,
            PageSize: 1,
            Filters: [{ name: 'role_name', op: 'Equal', value: currentProfile.role }]
          });
          if (retryRoleData?.List?.length > 0) {
            setUserRole(retryRoleData.List[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createDefaultRoles = async () => {
    const defaultRoles = [
    {
      role_name: 'admin',
      role_display_name: 'Administrator',
      role_description: 'Full system access with all permissions',
      permissions_json: JSON.stringify({
        users: { view: true, create: true, edit: true, delete: true },
        products: { view: true, create: true, edit: true, delete: true },
        sales: { view: true, create: true, edit: true, delete: true },
        employees: { view: true, create: true, edit: true, delete: true },
        vendors: { view: true, create: true, edit: true, delete: true },
        orders: { view: true, create: true, edit: true, delete: true },
        licenses: { view: true, create: true, edit: true, delete: true },
        salary: { view: true, create: true, edit: true, delete: true },
        inventory: { view: true, create: true, edit: true, delete: true },
        delivery: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true }
      }),
      is_active: true,
      is_system_role: true,
      created_by: 1
    },
    {
      role_name: 'manager',
      role_display_name: 'Manager',
      role_description: 'Station management with limited administrative access',
      permissions_json: JSON.stringify({
        users: { view: true, create: false, edit: false, delete: false },
        products: { view: true, create: true, edit: true, delete: false },
        sales: { view: true, create: true, edit: true, delete: false },
        employees: { view: true, create: true, edit: true, delete: false },
        vendors: { view: true, create: true, edit: true, delete: false },
        orders: { view: true, create: true, edit: true, delete: false },
        licenses: { view: true, create: false, edit: false, delete: false },
        salary: { view: true, create: true, edit: true, delete: false },
        inventory: { view: true, create: true, edit: true, delete: false },
        delivery: { view: true, create: true, edit: true, delete: false },
        settings: { view: false, create: false, edit: false, delete: false }
      }),
      is_active: true,
      is_system_role: true,
      created_by: 1
    },
    {
      role_name: 'employee',
      role_display_name: 'Employee',
      role_description: 'Basic access for daily operations',
      permissions_json: JSON.stringify({
        users: { view: false, create: false, edit: false, delete: false },
        products: { view: true, create: false, edit: false, delete: false },
        sales: { view: true, create: true, edit: false, delete: false },
        employees: { view: false, create: false, edit: false, delete: false },
        vendors: { view: false, create: false, edit: false, delete: false },
        orders: { view: true, create: false, edit: false, delete: false },
        licenses: { view: false, create: false, edit: false, delete: false },
        salary: { view: false, create: false, edit: false, delete: false },
        inventory: { view: true, create: false, edit: false, delete: false },
        delivery: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false }
      }),
      is_active: true,
      is_system_role: true,
      created_by: 1
    }];


    for (const role of defaultRoles) {
      try {
        await window.ezsite.apis.tableCreate(USER_ROLES_TABLE_ID, role);
      } catch (error) {
        console.error('Error creating default role:', error);
      }
    }
  };

  // Load user and profile on app start
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const { data: userData, error: userError } = await window.ezsite.apis.getUserInfo();
        if (userError || !userData) {
          setUser(null);
          setUserProfile(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        setUser(userData);
        await loadUserData(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
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
      await loadUserData(userData);

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
      setUserRole(null);
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

      const { error } = await window.ezsite.apis.tableUpdate(USER_PROFILE_TABLE_ID, {
        id: userProfile.id,
        ...updatedData
      });

      if (error) {
        toast.error(error);
        return false;
      }

      setUserProfile((prev) => prev ? { ...prev, ...updatedData } : null);

      // Reload role if role was changed
      if (updatedData.role && updatedData.role !== userProfile.role) {
        const { data: roleData } = await window.ezsite.apis.tablePage(USER_ROLES_TABLE_ID, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'role_name', op: 'Equal', value: updatedData.role }]
        });
        if (roleData?.List?.length > 0) {
          setUserRole(roleData.List[0]);
        }
      }

      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!user) return;
    await loadUserData(user);
  };

  const hasRole = (role: string): boolean => {
    return userProfile?.role === role;
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!userRole || !userProfile?.status || userProfile.status !== 'active') {
      return false;
    }

    try {
      const permissions = JSON.parse(userRole.permissions_json);
      return permissions[module]?.[action] === true;
    } catch (error) {
      console.error('Error parsing permissions:', error);
      return false;
    }
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin' && userProfile?.status === 'active';
  };

  const isManager = (): boolean => {
    return (userProfile?.role === 'manager' || userProfile?.role === 'admin') && userProfile?.status === 'active';
  };

  const isActive = (): boolean => {
    return userProfile?.status === 'active';
  };

  const value: AuthContextType = {
    user,
    userProfile,
    userRole,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    isActive,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};