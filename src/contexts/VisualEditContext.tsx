import React, { createContext, useContext, useState, useEffect } from 'react';

interface VisualEditContextType {
  isEditModeEnabled: boolean;
  setEditModeEnabled: (enabled: boolean) => void;
  canEdit: () => boolean;
  checkEditPermission: (action: string) => boolean;
}

const VisualEditContext = createContext<VisualEditContextType | undefined>(undefined);

export const useVisualEdit = () => {
  const context = useContext(VisualEditContext);
  if (context === undefined) {
    throw new Error('useVisualEdit must be used within a VisualEditProvider');
  }
  return context;
};

interface VisualEditProviderProps {
  children: React.ReactNode;
}

export const VisualEditProvider: React.FC<VisualEditProviderProps> = ({ children }) => {
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(() => {
    const savedMode = localStorage.getItem('visualEditMode');
    return savedMode === null ? true : savedMode === 'true';
  });

  useEffect(() => {
    localStorage.setItem('visualEditMode', isEditModeEnabled.toString());
  }, [isEditModeEnabled]);

  const setEditModeEnabled = (enabled: boolean) => {
    setIsEditModeEnabled(enabled);
    localStorage.setItem('visualEditMode', enabled.toString());
  };

  const canEdit = () => {
    return true; // Always allow editing - remove blocking
  };

  const checkEditPermission = (action: string) => {
    return true; // Always allow editing - remove blocking
  };

  // Auto-enable edit mode if it's not set
  React.useEffect(() => {
    const savedMode = localStorage.getItem('visualEditMode');

    if (savedMode === null) {
      localStorage.setItem('visualEditMode', 'true');
      setIsEditModeEnabled(true);
    }
  }, []);

  const value = {
    isEditModeEnabled,
    setEditModeEnabled,
    canEdit,
    checkEditPermission
  };

  return (
    <VisualEditContext.Provider value={value}>
      {children}
    </VisualEditContext.Provider>);

};

export default VisualEditContext;