import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';

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

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{error: AuthError | null;}>;
  signIn: (email: string, password: string) => Promise<{error: AuthError | null;}>;
  signOut: () => Promise<{error: AuthError | null;}>;
  resetPassword: (email: string) => Promise<{error: AuthError | null;}>;
  updatePassword: (password: string) => Promise<{error: AuthError | null;}>;
  refreshProfile: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile = {
          user_id: parseInt(userId),
          role: 'Employee',
          station: 'MOBIL',
          employee_id: '',
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: JSON.stringify({
            products: { view: true, create: false, edit: false, delete: false },
            employees: { view: false, create: false, edit: false, delete: false },
            sales: { view: true, create: true, edit: true, delete: false },
            vendors: { view: true, create: false, edit: false, delete: false },
            orders: { view: true, create: true, edit: true, delete: false },
            licenses: { view: true, create: false, edit: false, delete: false },
            salary: { view: false, create: false, edit: false, delete: false },
            inventory: { view: true, create: false, edit: false, delete: false },
            delivery: { view: true, create: true, edit: true, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
            admin: { view: false, create: false, edit: false, delete: false }
          })
        };

        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (newProfile) {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive'
          });
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            toast({
              title: 'Welcome!',
              description: 'You have been successfully signed in.'
            });
            break;
          case 'SIGNED_OUT':
            toast({
              title: 'Signed Out',
              description: 'You have been successfully signed out.'
            });
            // Cleanup realtime subscriptions
            supabaseService.cleanup();
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
          case 'USER_UPDATED':
            toast({
              title: 'Profile Updated',
              description: 'Your profile has been updated successfully.'
            });
            break;
          case 'PASSWORD_RECOVERY':
            toast({
              title: 'Password Recovery',
              description: 'Please check your email for password reset instructions.'
            });
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await supabaseService.register(email, password);

      if (result.error) {
        toast({
          title: 'Sign Up Error',
          description: result.error,
          variant: 'destructive'
        });
        return { error: new Error(result.error) as AuthError };
      }

      toast({
        title: 'Check Your Email',
        description: 'We sent you a confirmation link. Please check your email.'
      });

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      const authError = error as AuthError;
      toast({
        title: 'Sign Up Error',
        description: authError.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await supabaseService.login(email, password);

      if (result.error) {
        toast({
          title: 'Sign In Error',
          description: result.error,
          variant: 'destructive'
        });
        return { error: new Error(result.error) as AuthError };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      const authError = error as AuthError;
      toast({
        title: 'Sign In Error',
        description: authError.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await supabaseService.logout();

      if (result.error) {
        toast({
          title: 'Sign Out Error',
          description: result.error,
          variant: 'destructive'
        });
        return { error: new Error(result.error) as AuthError };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      const authError = error as AuthError;
      toast({
        title: 'Sign Out Error',
        description: authError.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabaseService.sendResetPwdEmail(email);

      if (result.error) {
        toast({
          title: 'Password Reset Error',
          description: result.error,
          variant: 'destructive'
        });
        return { error: new Error(result.error) as AuthError };
      }

      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your email for password reset instructions.'
      });

      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      const authError = error as AuthError;
      toast({
        title: 'Password Reset Error',
        description: authError.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { error: authError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: 'Password Update Error',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully.'
      });

      return { error: null };
    } catch (error) {
      console.error('Password update error:', error);
      const authError = error as AuthError;
      toast({
        title: 'Password Update Error',
        description: authError.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { error: authError };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!profile || !profile.detailed_permissions) return false;
    
    try {
      const permissions = JSON.parse(profile.detailed_permissions);
      return permissions[resource]?.[action] || false;
    } catch {
      return false;
    }
  };

  const isAdmin = (): boolean => {
    return profile?.role === 'Administrator' || false;
  };

  const isManager = (): boolean => {
    return profile?.role === 'Management' || profile?.role === 'Administrator' || false;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    hasPermission,
    isAdmin,
    isManager,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};