
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  station_id: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: { full_name?: string; role?: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error loading user profile:', error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Load user profile
          const profile = await loadUserProfile(initialSession.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Load user profile
          const profile = await loadUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (
    email: string, 
    password: string, 
    userData?: { full_name?: string; role?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      })

      if (error) throw error

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account."
      })
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive"
      })
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast({
        title: "Signed in successfully",
        description: "Welcome back!"
      })
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Signed out successfully",
        description: "You have been logged out."
      })
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out",
        variant: "destructive"
      })
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions."
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast({
        title: "Reset password failed",
        description: error.message || "An error occurred",
        variant: "destructive"
      })
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserProfile(data as UserProfile)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      })
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    const profile = await loadUserProfile(user.id)
    setUserProfile(profile)
  }

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
