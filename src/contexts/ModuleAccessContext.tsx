import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ModuleAccess {
  id: number;
  module_name: string;
  display_name: string;
  create_enabled: boolean;
  edit_enabled: boolean;
  delete_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleAccessContextType {
  moduleAccess: ModuleAccess[];
  loading: boolean;
  error: string | null;
  fetchModuleAccess: () => Promise<void>;
  updateModuleAccess: (id: number, updates: Partial<ModuleAccess>) => Promise<void>;
  canCreate: (moduleName: string) => boolean;
  canEdit: (moduleName: string) => boolean;
  canDelete: (moduleName: string) => boolean;
}

const ModuleAccessContext = createContext<ModuleAccessContextType | undefined>(undefined);

export const useModuleAccess = () => {
  const context = useContext(ModuleAccessContext);
  if (!context) {
    throw new Error('useModuleAccess must be used within a ModuleAccessProvider');
  }
  return context;
};

export const ModuleAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModuleAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await window.ezsite.apis.tablePage("25712", {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: true,
        Filters: []
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setModuleAccess(response.data.List || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch module access';
      setError(errorMessage);
      console.error('Error fetching module access:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateModuleAccess = async (id: number, updates: Partial<ModuleAccess>) => {
    try {
      const response = await window.ezsite.apis.tableUpdate("25712", {
        ID: id,
        ...updates,
        updated_at: new Date().toISOString()
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state
      setModuleAccess(prev => 
        prev.map(module => 
          module.id === id ? { ...module, ...updates } : module
        )
      );

      toast.success('Module access updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update module access';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating module access:', err);
    }
  };

  const canCreate = (moduleName: string): boolean => {
    const module = moduleAccess.find(m => m.module_name.toLowerCase() === moduleName.toLowerCase());
    return module?.create_enabled ?? true;
  };

  const canEdit = (moduleName: string): boolean => {
    const module = moduleAccess.find(m => m.module_name.toLowerCase() === moduleName.toLowerCase());
    return module?.edit_enabled ?? true;
  };

  const canDelete = (moduleName: string): boolean => {
    const module = moduleAccess.find(m => m.module_name.toLowerCase() === moduleName.toLowerCase());
    return module?.delete_enabled ?? true;
  };

  useEffect(() => {
    fetchModuleAccess();
  }, []);

  const value: ModuleAccessContextType = {
    moduleAccess,
    loading,
    error,
    fetchModuleAccess,
    updateModuleAccess,
    canCreate,
    canEdit,
    canDelete
  };

  return (
    <ModuleAccessContext.Provider value={value}>
      {children}
    </ModuleAccessContext.Provider>
  );
};
