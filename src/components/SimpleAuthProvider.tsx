import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleAuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('dfs_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (error) {
        localStorage.removeItem('dfs_auth');
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Simple validation - accept admin@dfs-portal.com with password admin123
    if (email === 'admin@dfs-portal.com' && password === 'admin123') {
      const userData = { email, name: 'Admin User' };
      setIsAuthenticated(true);
      setUser(userData);
      
      // Store in localStorage for persistence
      localStorage.setItem('dfs_auth', JSON.stringify({ user: userData }));
      
      return true;
    }
    
    // Also accept any email ending with @dfs-portal.com for demo purposes
    if (email.endsWith('@dfs-portal.com') && password.length >= 6) {
      const userData = { email, name: email.split('@')[0] };
      setIsAuthenticated(true);
      setUser(userData);
      
      localStorage.setItem('dfs_auth', JSON.stringify({ user: userData }));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('dfs_auth');
  };

  return (
    <SimpleAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider');
  }
  return context;
};