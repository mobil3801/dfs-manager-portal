import { useConsolidatedAuth } from '@/contexts/ConsolidatedAuthContext';

/**
 * Safe authentication hook that provides null-safe access to user data and auth methods
 * This hook prevents the common "undefined is not an object" errors by providing
 * safe defaults and null checks for all auth-related operations.
 */
export const useSafeAuth = () => {
  const auth = useConsolidatedAuth();

  // Safe accessors with null checks and fallbacks
  const safeUser = auth.user || null;
  const safeUserProfile = auth.userProfile || null;
  const safeSession = auth.session || null;

  // Safe boolean checks
  const safeIsAuthenticated = Boolean(auth.isAuthenticated && safeUser && safeUserProfile);
  const safeIsLoading = Boolean(auth.isLoading);
  const safeIsInitialized = Boolean(auth.isInitialized);

  // Safe role checks with error handling
  const safeIsAdmin = (): boolean => {
    try {
      return safeIsAuthenticated ? auth.isAdmin() : false;
    } catch (error) {
      console.warn('Error checking admin status:', error);
      return false;
    }
  };

  const safeIsManager = (): boolean => {
    try {
      return safeIsAuthenticated ? auth.isManager() : false;
    } catch (error) {
      console.warn('Error checking manager status:', error);
      return false;
    }
  };

  const safeHasPermission = (action: string, resource?: string): boolean => {
    try {
      return safeIsAuthenticated ? auth.hasPermission(action, resource) : false;
    } catch (error) {
      console.warn('Error checking permission:', error);
      return false;
    }
  };

  // Safe user display information
  const getUserDisplayName = (): string => {
    if (!safeUser) return 'User';

    return (
      safeUser.user_metadata?.full_name ||
      safeUser.user_metadata?.display_name ||
      safeUser.email?.split('@')[0] ||
      'User');

  };

  const getUserInitial = (): string => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const getUserEmail = (): string => {
    return safeUser?.email || '';
  };

  const getUserRole = (): string => {
    return safeUserProfile?.role || 'Employee';
  };

  // Safe auth methods with error handling
  const safeLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      return await auth.login(email, password);
    } catch (error) {
      console.error('Safe login error:', error);
      return false;
    }
  };

  const safeLogout = async (): Promise<void> => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Safe logout error:', error);
    }
  };

  const safeRegister = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      return await auth.register(email, password, fullName);
    } catch (error) {
      console.error('Safe register error:', error);
      return false;
    }
  };

  const safeResetPassword = async (email: string): Promise<boolean> => {
    try {
      return await auth.resetPassword(email);
    } catch (error) {
      console.error('Safe reset password error:', error);
      return false;
    }
  };

  const safeRefreshUserData = async (): Promise<void> => {
    try {
      await auth.refreshUserData();
    } catch (error) {
      console.error('Safe refresh user data error:', error);
    }
  };

  return {
    // Raw auth context (for advanced usage)
    rawAuth: auth,

    // Safe data accessors
    user: safeUser,
    userProfile: safeUserProfile,
    session: safeSession,
    authError: auth.authError,

    // Safe state flags
    isAuthenticated: safeIsAuthenticated,
    isLoading: safeIsLoading,
    isInitialized: safeIsInitialized,

    // Safe role checks
    isAdmin: safeIsAdmin,
    isManager: safeIsManager,
    hasPermission: safeHasPermission,

    // Safe user information
    getUserDisplayName,
    getUserInitial,
    getUserEmail,
    getUserRole,

    // Safe auth methods
    login: safeLogin,
    logout: safeLogout,
    register: safeRegister,
    resetPassword: safeResetPassword,
    updatePassword: auth.updatePassword,
    refreshUserData: safeRefreshUserData,
    clearError: auth.clearError
  };
};

export default useSafeAuth;