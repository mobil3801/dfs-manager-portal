import React, { createContext, useContext, useState } from 'react';

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
  // Always start with visual edit enabled by default
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(true);

  const setEditModeEnabled = (enabled: boolean) => {
    setIsEditModeEnabled(enabled);
  };

  const canEdit = () => {
    return true; // Always allow editing - remove blocking
  };

  const checkEditPermission = (action: string) => {
    return true; // Always allow editing - remove blocking
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
    </VisualEditContext.Provider>
  );

};

export default VisualEditContext;