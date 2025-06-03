import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{error: AuthError | null;}>;
  signIn: (email: string, password: string) => Promise<{error: AuthError | null;}>;
  signOut: () => Promise<{error: AuthError | null;}>;
  resetPassword: (email: string) => Promise<{error: AuthError | null;}>;
  updatePassword: (password: string) => Promise<{error: AuthError | null;}>;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: 'Sign Up Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Check Your Email',
          description: 'We sent you a confirmation link. Please check your email.'
        });
      }

      return { error };
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: 'Sign In Error',
          description: error.message,
          variant: 'destructive'
        });
      }

      return { error };
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
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: 'Sign Out Error',
          description: error.message,
          variant: 'destructive'
        });
      }

      return { error };
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        toast({
          title: 'Password Reset Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Password Reset Email Sent',
          description: 'Please check your email for password reset instructions.'
        });
      }

      return { error };
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
      } else {
        toast({
          title: 'Password Updated',
          description: 'Your password has been updated successfully.'
        });
      }

      return { error };
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

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>);

};