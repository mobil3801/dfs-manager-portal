import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  permissions?: any;
  station_access?: any;
  is_active: boolean;
  last_login?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

interface SupabaseAuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  hasPermission: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  clearError: () => void;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!userProfile;

  const clearError = () => {
    setAuthError(null);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔄 Fetching user profile for:', userId);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create a default one
          console.log('📝 Creating default profile for user:', userId);
          
          const { data: userData } = await supabase.auth.getUser();
          const userEmail = userData.user?.email || '';
          
          const defaultProfile = {
            user_id: userId,
            email: userEmail,
            role: 'Employee',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([defaultProfile])
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating user profile:', createError);
            throw createError;
          }

          setUserProfile(newProfile);
          return;
        }
        throw error;
      }

      console.log('✅ User profile fetched:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setAuthError(`Failed to load user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const initializeAuth = async () => {
    try {
      console.log('🚀 Initializing Supabase authentication...');
      setIsLoading(true);

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setAuthError(error.message);
        return;
      }

      if (session?.user) {
        console.log('✅ User session found:', session.user.id);
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('📝 No active session found');
        setUser(null);
        setUserProfile(null);
      }

      setAuthError(null);
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setAuthError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          setAuthError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setAuthError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('📝 Attempting sign up for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onauthsuccess`
        }
      });

      if (error) {
        console.error('❌ Sign up failed:', error);
        setAuthError(error.message);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Sign up successful');
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Sign up error:', error);
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
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('🔑 Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in failed:', error);
        setAuthError(error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        console.log('✅ Sign in successful');
        setUser(data.user);
        await fetchUserProfile(data.user.id);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Sign in error:', error);
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
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Signing out user...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        setAuthError(error.message);
        return;
      }

      setUser(null);
      setUserProfile(null);
      setAuthError(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(null);
      setAuthError(null);
    }
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!userProfile || !isAuthenticated) {
      return false;
    }

    // Admins have all permissions
    if (userProfile.role === 'Administrator' || userProfile.role === 'Admin') {
      return true;
    }

    // Parse permissions if they exist
    if (userProfile.permissions) {
      try {
        let permissions;
        if (typeof userProfile.permissions === 'string') {
          permissions = JSON.parse(userProfile.permissions);
        } else {
          permissions = userProfile.permissions;
        }

        if (resource && permissions[resource] && permissions[resource][action]) {
          return true;
        }
      } catch (error) {
        console.warn('Error parsing permissions:', error);
      }
    }

    // Default permissions for managers
    if (userProfile.role === 'Management' || userProfile.role === 'Manager') {
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
    return userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';
  };

  const isManager = (): boolean => {
    return userProfile?.role === 'Management' || 
           userProfile?.role === 'Manager' ||
           userProfile?.role === 'Administrator' || 
           userProfile?.role === 'Admin';
  };

  const value: SupabaseAuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    authError,
    isInitialized,
    signUp,
    signIn,
    signOut,
    refreshUserProfile,
    hasPermission,
    isAdmin,
    isManager,
    clearError
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};