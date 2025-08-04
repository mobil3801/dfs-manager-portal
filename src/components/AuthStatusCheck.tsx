import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthStatusCheckProps {
  children: React.ReactNode;
}

interface UserSession {
  email: string;
  role: string;
  station: string;
  isAuthenticated: boolean;
  loginTime: string;
}

const AuthStatusCheck: React.FC<AuthStatusCheckProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const sessionData = sessionStorage.getItem('user_session');
        if (sessionData) {
          const session: UserSession = JSON.parse(sessionData);
          
          // Check if session is still valid (not older than 24 hours)
          const loginTime = new Date(session.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24 && session.isAuthenticated) {
            setIsAuthenticated(true);
            setUserSession(session);
          } else {
            // Session expired
            sessionStorage.removeItem('user_session');
            setIsAuthenticated(false);
            setUserSession(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserSession(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUserSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Make user session available to child components
  return (
    <div data-user-role={userSession?.role} data-user-station={userSession?.station}>
      {children}
    </div>
  );
};

export default AuthStatusCheck;