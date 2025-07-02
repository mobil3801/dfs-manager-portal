import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUtils } from '../utils/authUtils';
import { toast } from '../hooks/use-toast';

interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  email_verified: boolean;
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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{error?: string;}>;
  register: (email: string, password: string, name: string) => Promise<{error?: string;}>;
  logout: () => Promise<{error?: string;}>;
  getUserInfo: () => Promise<{data?: User;error?: string;}>;
  sendResetPwdEmail: (email: string) => Promise<{error?: string;}>;
  resetPassword: (token: string, password: string) => Promise<{error?: string;}>;
  verifyEmail: (token: string) => Promise<{error?: string;}>;
}

const DatabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_TABLE_ID = '24015';
const USER_SESSIONS_TABLE_ID = '24016';
const USER_PROFILES_TABLE_ID = '11725';

export const DatabaseAuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      // Verify session in database
      const { data: sessions, error: sessionError } = await window.ezsite.apis.tablePage(
        USER_SESSIONS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [
          { name: 'session_token', op: 'Equal', value: sessionToken },
          { name: 'is_active', op: 'Equal', value: true }]

        }
      );

      if (sessionError || !sessions?.List?.length) {
        localStorage.removeItem('session_token');
        setLoading(false);
        return;
      }

      const session = sessions.List[0];

      // Check if session is expired
      if (AuthUtils.isSessionExpired(session.expires_at)) {
        await deactivateSession(sessionToken);
        localStorage.removeItem('session_token');
        setLoading(false);
        return;
      }

      // Update last activity
      await window.ezsite.apis.tableUpdate(USER_SESSIONS_TABLE_ID, {
        id: session.id,
        last_activity: new Date().toISOString()
      });

      // Get user info
      const { data: users, error: userError } = await window.ezsite.apis.tablePage(
        USERS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'id', op: 'Equal', value: session.user_id }]
        }
      );

      if (userError || !users?.List?.length) {
        await deactivateSession(sessionToken);
        localStorage.removeItem('session_token');
        setLoading(false);
        return;
      }

      const userData = users.List[0];
      setUser(userData);

      // Get user profile
      await loadUserProfile(userData.id);

    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: number) => {
    try {
      const { data: profiles, error } = await window.ezsite.apis.tablePage(
        USER_PROFILES_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'user_id', op: 'Equal', value: userId }]
        }
      );

      if (!error && profiles?.List?.length) {
        setProfile(profiles.List[0]);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const deactivateSession = async (sessionToken: string) => {
    try {
      const { data: sessions } = await window.ezsite.apis.tablePage(
        USER_SESSIONS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'session_token', op: 'Equal', value: sessionToken }]
        }
      );

      if (sessions?.List?.length) {
        await window.ezsite.apis.tableUpdate(USER_SESSIONS_TABLE_ID, {
          id: sessions.List[0].id,
          is_active: false
        });
      }
    } catch (error) {
      console.error('Session deactivation error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{error?: string;}> => {
    try {
      setLoading(true);

      if (!AuthUtils.isValidEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      // Find user by email
      const { data: users, error: userError } = await window.ezsite.apis.tablePage(
        USERS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'email', op: 'Equal', value: email.toLowerCase() }]
        }
      );

      if (userError) {
        return { error: 'Login failed. Please try again.' };
      }

      if (!users?.List?.length) {
        return { error: 'Invalid email or password' };
      }

      const userData = users.List[0];

      if (!userData.is_active) {
        return { error: 'Your account has been deactivated. Please contact support.' };
      }

      // Verify password
      const isPasswordValid = await AuthUtils.verifyPassword(
        password,
        userData.password_hash,
        userData.salt
      );

      if (!isPasswordValid) {
        return { error: 'Invalid email or password' };
      }

      // Create session
      const sessionToken = AuthUtils.generateSessionToken();
      const expiresAt = AuthUtils.getSessionExpiration();
      const ipAddress = await AuthUtils.getClientIP();
      const userAgent = AuthUtils.getUserAgent();

      const { error: sessionError } = await window.ezsite.apis.tableCreate(
        USER_SESSIONS_TABLE_ID,
        {
          user_id: userData.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true
        }
      );

      if (sessionError) {
        return { error: 'Failed to create session. Please try again.' };
      }

      // Update last login
      await window.ezsite.apis.tableUpdate(USERS_TABLE_ID, {
        id: userData.id,
        last_login: new Date().toISOString()
      });

      // Store session token
      localStorage.setItem('session_token', sessionToken);

      setUser(userData);
      await loadUserProfile(userData.id);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`
      });

      return {};

    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{error?: string;}> => {
    try {
      setLoading(true);

      if (!AuthUtils.isValidEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      const passwordValidation = AuthUtils.isValidPassword(password);
      if (!passwordValidation.valid) {
        return { error: passwordValidation.message };
      }

      if (!name.trim()) {
        return { error: 'Please enter your full name' };
      }

      // Check if user already exists
      const { data: existingUsers, error: checkError } = await window.ezsite.apis.tablePage(
        USERS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'email', op: 'Equal', value: email.toLowerCase() }]
        }
      );

      if (checkError) {
        return { error: 'Registration failed. Please try again.' };
      }

      if (existingUsers?.List?.length) {
        return { error: 'An account with this email already exists' };
      }

      // Hash password
      const salt = await AuthUtils.generateSalt();
      const passwordHash = await AuthUtils.hashPassword(password, salt);
      const verificationToken = AuthUtils.generateVerificationToken();

      // Create user
      const { error: createError } = await window.ezsite.apis.tableCreate(
        USERS_TABLE_ID,
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          salt: salt,
          name: name.trim(),
          is_active: true,
          created_at: new Date().toISOString(),
          email_verified: false,
          verification_token: verificationToken
        }
      );

      if (createError) {
        return { error: 'Registration failed. Please try again.' };
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully. You can now log in."
      });

      return {};

    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<{error?: string;}> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        await deactivateSession(sessionToken);
        localStorage.removeItem('session_token');
      }

      setUser(null);
      setProfile(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });

      return {};

    } catch (error) {
      console.error('Logout error:', error);
      return { error: 'An error occurred during logout.' };
    }
  };

  const getUserInfo = async (): Promise<{data?: User;error?: string;}> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }
    return { data: user };
  };

  const sendResetPwdEmail = async (email: string): Promise<{error?: string;}> => {
    try {
      if (!AuthUtils.isValidEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      // Find user by email
      const { data: users, error: userError } = await window.ezsite.apis.tablePage(
        USERS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'email', op: 'Equal', value: email.toLowerCase() }]
        }
      );

      if (userError || !users?.List?.length) {
        // Don't reveal if email exists or not for security
        toast({
          title: "Reset Email Sent",
          description: "If an account with this email exists, you will receive a password reset link."
        });
        return {};
      }

      const userData = users.List[0];
      const resetToken = AuthUtils.generateVerificationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

      // Update user with reset token
      await window.ezsite.apis.tableUpdate(USERS_TABLE_ID, {
        id: userData.id,
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      });

      // In a real app, you would send an email here
      toast({
        title: "Reset Email Sent",
        description: "If an account with this email exists, you will receive a password reset link."
      });

      return {};

    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An error occurred. Please try again.' };
    }
  };

  const resetPassword = async (token: string, password: string): Promise<{error?: string;}> => {
    try {
      const passwordValidation = AuthUtils.isValidPassword(password);
      if (!passwordValidation.valid) {
        return { error: passwordValidation.message };
      }

      // Find user by reset token
      const { data: users, error: userError } = await window.ezsite.apis.tablePage(
        USERS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'reset_token', op: 'Equal', value: token }]
        }
      );

      if (userError || !users?.List?.length) {
        return { error: 'Invalid or expired reset token' };
      }

      const userData = users.List[0];

      // Check if token is expired
      if (!userData.reset_token_expires || new Date() > new Date(userData.reset_token_expires)) {
        return { error: 'Reset token has expired. Please request a new one.' };
      }

      // Hash new password
      const newSalt = await AuthUtils.generateSalt();
      const newPasswordHash = await AuthUtils.hashPassword(password, newSalt);

      // Update password and clear reset token
      const { error: updateError } = await window.ezsite.apis.tableUpdate(USERS_TABLE_ID, {
        id: userData.id,
        password_hash: newPasswordHash,
        salt: newSalt,
        reset_token: '',
        reset_token_expires: null
      });

      if (updateError) {
        return { error: 'Failed to reset password. Please try again.' };
      }

      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now log in with your new password."
      });

      return {};

    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An error occurred. Please try again.' };
    }
  };

  const verifyEmail = async (token: string): Promise<{error?: string;}> => {
    try {
      // Find user by verification token
      const { data: users, error: userError } = await window.ezsite.apis.tablePage(
        USERS_TABLE_ID,
        {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'verification_token', op: 'Equal', value: token }]
        }
      );

      if (userError || !users?.List?.length) {
        return { error: 'Invalid verification token' };
      }

      const userData = users.List[0];

      if (userData.email_verified) {
        return { error: 'Email is already verified' };
      }

      // Verify email
      const { error: updateError } = await window.ezsite.apis.tableUpdate(USERS_TABLE_ID, {
        id: userData.id,
        email_verified: true,
        verification_token: ''
      });

      if (updateError) {
        return { error: 'Failed to verify email. Please try again.' };
      }

      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully!"
      });

      return {};

    } catch (error) {
      console.error('Email verification error:', error);
      return { error: 'An error occurred. Please try again.' };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    getUserInfo,
    sendResetPwdEmail,
    resetPassword,
    verifyEmail
  };

  return (
    <DatabaseAuthContext.Provider value={value}>
      {children}
    </DatabaseAuthContext.Provider>);

};

export const useDatabaseAuth = (): AuthContextType => {
  const context = useContext(DatabaseAuthContext);
  if (context === undefined) {
    throw new Error('useDatabaseAuth must be used within a DatabaseAuthProvider');
  }
  return context;
};

export default DatabaseAuthContext;