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
    return localStorage.getItem('visualEditMode') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('visualEditMode', isEditModeEnabled.toString());
  }, [isEditModeEnabled]);

  const setEditModeEnabled = (enabled: boolean) => {
    setIsEditModeEnabled(enabled);
  };

  const canEdit = () => {
    return isEditModeEnabled;
  };

  const checkEditPermission = (action: string) => {
    if (!isEditModeEnabled) {
      console.warn(`Action "${action}" blocked: Manual editing is disabled. Please use AI assistance.`);
      return false;
    }
    return true;
  };

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