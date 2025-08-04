import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  user_metadata: any;
  app_metadata: any;
}

interface UserProfile {
  id: number;
  user_id?: string;
  email: string;
  role: string;
  role_code: string;
  station: string;
  employee_id: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  detailed_permissions: any;
  profile_image_id?: number | null;
  created_at: string;
  updated_at: string;
}

interface SupabaseAuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isInitialized: boolean;
  refreshUserData: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{success: boolean;error?: string;}>;
  signIn: (email: string, password: string) => Promise<{success: boolean;error?: string;}>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{success: boolean;error?: string;}>;
  updatePassword: (password: string) => Promise<{success: boolean;error?: string;}>;
  refreshUserProfile: () => Promise<void>;
  isAdmin: () => boolean;
  isManager: () => boolean;
  hasPermission: (action: string, resource?: string) => boolean;
  assignRole: (email: string, role: string, roleCode: string, permissions?: any) => Promise<{success: boolean;error?: string;}>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // First try to get profile by user_id
      let { data: profile, error } = await supabase.
      from('user_profiles').
      select('*').
      eq('user_id', userId).
      single();

      // If not found by user_id, try by email
      if (error && error.code === 'PGRST116') {
        const { data: profileByEmail, error: emailError } = await supabase.
        from('user_profiles').
        select('*').
        eq('email', email).
        single();

        if (!emailError && profileByEmail) {
          // Update the profile with the user_id
          const { data: updatedProfile } = await supabase.
          from('user_profiles').
          update({ user_id: userId }).
          eq('email', email).
          select().
          single();

          profile = updatedProfile;
        } else {
          // Create a new profile if none exists
          const { data: newProfile, error: createError } = await supabase.
          from('user_profiles').
          insert([{
            user_id: userId,
            email: email,
            role: 'Employee',
            role_code: 'GeneralUser',
            station: 'MOBIL',
            employee_id: '',
            phone: '',
            hire_date: new Date().toISOString(),
            is_active: true,
            detailed_permissions: {}
          }]).
          select().
          single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            return null;
          }

          profile = newProfile;
        }
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const initializeAuth = async () => {
    try {
      setAuthError(null);
      
      // Get initial session
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Session error:', sessionError);
        setAuthError(sessionError.message);
      }

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);

        const profile = await fetchUserProfile(initialSession.user.id, initialSession.user.email);
        setUserProfile(profile);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session);

          setSession(session);

          if (session?.user) {
            setUser(session.user);
            const profile = await fetchUserProfile(session.user.id, session.user.email);
            setUserProfile(profile);
          } else {
            setUser(null);
            setUserProfile(null);
          }
        }
      );

      return subscription;
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      setAuthError(error.message || 'Failed to initialize authentication');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    let subscription: any;

    initializeAuth().then((sub) => {
      subscription = sub;
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onauthsuccess`,
          data: metadata
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Sign Up Successful",
        description: "Please check your email to verify your account"
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Sign In Successful",
        description: "Welcome back!"
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
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
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out"
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id, user.email);
      setUserProfile(profile);
    }
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

    // Admins have all permissions
    if (isAdmin()) return true;

    // Check detailed permissions
    if (userProfile.detailed_permissions && resource) {
      const resourcePermissions = userProfile.detailed_permissions[resource];
      if (resourcePermissions && resourcePermissions[action]) {
        return true;
      }
    }

    // Default role-based permissions
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

      const { data, error } = await supabase.
      from('user_profiles').
      upsert({
        email,
        role,
        role_code: roleCode,
        detailed_permissions: permissions || {},
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      }).
      select();

      if (error) {
        return { success: false, error: error.message };
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

  const refreshUserData = async () => {
    try {
      setAuthError(null);
      setLoading(true);
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        setAuthError(error.message);
        return;
      }
      
      if (currentSession?.user) {
        setUser(currentSession.user);
        setSession(currentSession);
        const profile = await fetchUserProfile(currentSession.user.id, currentSession.user.email);
        setUserProfile(profile);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  const value: SupabaseAuthContextType = {
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
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>);

};

export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};