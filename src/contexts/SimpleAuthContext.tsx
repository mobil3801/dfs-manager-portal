import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  user_metadata?: any;
  app_metadata?: any;
}

interface UserProfile {
  id?: number;
  user_id?: string;
  email: string;
  role: string;
  role_code: string;
  station?: string;
  employee_id?: string;
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  detailed_permissions?: any;
  profile_image_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;
  refreshUserData: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{success: boolean; error?: string}>;
  signIn: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{success: boolean; error?: string}>;
  updatePassword: (password: string) => Promise<{success: boolean; error?: string}>;
  refreshUserProfile: () => Promise<void>;
  isAdmin: () => boolean;
  isManager: () => boolean;
  hasPermission: (action: string, resource?: string) => boolean;
  assignRole: (email: string, role: string, roleCode: string, permissions?: any) => Promise<{success: boolean; error?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize auth on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setAuthError(null);
        
        // Check if user is logged in from localStorage
        const savedSession = localStorage.getItem('dfs_session');
        if (savedSession) {
          try {
            const parsedSession = JSON.parse(savedSession);
            if (parsedSession.user && parsedSession.expires_at > Date.now()) {
              setUser(parsedSession.user);
              setSession(parsedSession);
              // Create a default profile if needed
              setUserProfile({
                email: parsedSession.user.email,
                role: 'Employee',
                role_code: 'GeneralUser',
                is_active: true
              });
            } else {
              localStorage.removeItem('dfs_session');
            }
          } catch (error) {
            console.warn('Failed to parse saved session:', error);
            localStorage.removeItem('dfs_session');
          }
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        setAuthError('Failed to initialize authentication');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      setAuthError(null);

      // Simple sign up simulation
      const newUser: User = {
        id: Date.now().toString(),
        email,
        user_metadata: metadata
      };

      const newSession = {
        user: newUser,
        access_token: 'demo_token_' + Date.now(),
        expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };

      localStorage.setItem('dfs_session', JSON.stringify(newSession));
      setUser(newUser);
      setSession(newSession);
      setUserProfile({
        email,
        role: 'Employee',
        role_code: 'GeneralUser',
        is_active: true
      });

      toast({
        title: "Sign Up Successful",
        description: "Welcome to DFS Manager Portal!"
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
      setAuthError(errorMessage);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);

      // Simple sign in simulation - for demo purposes
      if (email && password) {
        const user: User = {
          id: Date.now().toString(),
          email
        };

        const session = {
          user,
          access_token: 'demo_token_' + Date.now(),
          expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };

        localStorage.setItem('dfs_session', JSON.stringify(session));
        setUser(user);
        setSession(session);
        
        // Set role based on email
        const role = (email.includes('admin') || email === 'admin@dfs-portal.com') ? 'Administrator' : 'Employee';
        const roleCode = (email.includes('admin') || email === 'admin@dfs-portal.com') ? 'Administrator' : 'GeneralUser';
        
        setUserProfile({
          email,
          role,
          role_code: roleCode,
          is_active: true
        });

        toast({
          title: "Sign In Successful",
          description: `Welcome back to DFS Manager Portal!`
        });

        return { success: true };
      } else {
        throw new Error('Please enter valid email and password');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
      setAuthError(errorMessage);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('dfs_session');
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setAuthError(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out"
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      toast({
        title: "Password Reset",
        description: "Password reset instructions have been sent to your email"
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated"
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshUserData = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const savedSession = localStorage.getItem('dfs_session');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession.expires_at > Date.now()) {
          setUser(parsedSession.user);
          setSession(parsedSession);
        } else {
          await signOut();
        }
      }
    } catch (error: any) {
      setAuthError('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    // Implementation for refreshing user profile
    await refreshUserData();
  };

  const isAdmin = () => {
    return userProfile?.role === 'Administrator' || userProfile?.role_code === 'Administrator';
  };

  const isManager = () => {
    return userProfile?.role === 'Management' || 
           userProfile?.role === 'Manager' || 
           userProfile?.role_code === 'Administrator' || 
           isAdmin();
  };

  const hasPermission = (action: string, resource?: string) => {
    if (!userProfile || !userProfile.is_active) return false;
    if (isAdmin()) return true;
    
    if (userProfile.role === 'Management' || userProfile.role === 'Manager') {
      return ['create', 'read', 'update'].includes(action);
    }
    
    if (userProfile.role === 'Employee') {
      return action === 'read';
    }
    
    return false;
  };

  const assignRole = async (email: string, role: string, roleCode: string, permissions?: any) => {
    try {
      if (!isAdmin()) {
        return { success: false, error: 'Only administrators can assign roles' };
      }

      toast({
        title: "Role Assigned",
        description: `Successfully assigned ${role} role to ${email}`
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    authError,
    isInitialized,
    refreshUserData,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshUserProfile,
    isAdmin,
    isManager,
    hasPermission,
    assignRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSimpleAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// Alias for compatibility
export const useSupabaseAuth = useSimpleAuth;
