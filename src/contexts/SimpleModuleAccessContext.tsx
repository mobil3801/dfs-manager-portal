import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  createDefaultModules: () => Promise<void>;
  canCreate: (moduleName: string) => boolean;
  canEdit: (moduleName: string) => boolean;
  canDelete: (moduleName: string) => boolean;
  isModuleAccessEnabled: boolean;
}

const ModuleAccessContext = createContext<ModuleAccessContextType | undefined>(undefined);

export const useModuleAccess = () => {
  const context = useContext(ModuleAccessContext);
  if (!context) {
    throw new Error('useModuleAccess must be used within a ModuleAccessProvider');
  }
  return context;
};

export const SimpleModuleAccessProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModuleAccessEnabled, setIsModuleAccessEnabled] = useState(true);
  const { toast } = useToast();

  const defaultModules = [
    { module_name: 'products', display_name: 'Products', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'employees', display_name: 'Employees', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'sales', display_name: 'Sales Reports', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'vendors', display_name: 'Vendors', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'orders', display_name: 'Orders', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'licenses', display_name: 'Licenses & Certificates', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'salary', display_name: 'Salary Records', create_enabled: true, edit_enabled: true, delete_enabled: true },
    { module_name: 'delivery', display_name: 'Delivery Records', create_enabled: true, edit_enabled: true, delete_enabled: true }
  ];

  const createDefaultModules = async () => {
    try {
      setLoading(true);
      
      // For now, just use the default modules as they are all enabled
      const modules = defaultModules.map((module, index) => ({
        id: index + 1,
        ...module,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      setModuleAccess(modules);
      
      toast({
        title: 'Success',
        description: 'Default modules initialized successfully'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create default modules';
      console.error('Error creating default modules:', err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, just use default modules with all permissions enabled
      const modules = defaultModules.map((module, index) => ({
        id: index + 1,
        ...module,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      setModuleAccess(modules);
      setIsModuleAccessEnabled(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch module access';
      setError(null); // Don't show error to user for module access failures
      setIsModuleAccessEnabled(true); // Keep enabled by default
      console.warn('Module access system error, using default permissions:', err);

      // Set default permissions when there's an error
      setModuleAccess(defaultModules.map((module, index) => ({
        id: index + 1,
        ...module,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    } finally {
      setLoading(false);
    }
  };

  const updateModuleAccess = async (id: number, updates: Partial<ModuleAccess>) => {
    try {
      // Update local state immediately for real-time feedback
      setModuleAccess((prev) =>
        prev.map((module) =>
          module.id === id ? { ...module, ...updates, updated_at: new Date().toISOString() } : module
        )
      );

      toast({
        title: 'Success',
        description: 'Module access updated successfully'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update module access';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      console.error('Error updating module access:', err);

      // Revert local state change by refetching data
      await fetchModuleAccess();
    }
  };

  const canCreate = (moduleName: string): boolean => {
    if (!isModuleAccessEnabled) return true; // If module access is disabled, allow everything

    const module = moduleAccess.find((m) => m.module_name.toLowerCase() === moduleName.toLowerCase());
    return module?.create_enabled ?? true; // Default to true if module not found
  };

  const canEdit = (moduleName: string): boolean => {
    if (!isModuleAccessEnabled) return true;

    const module = moduleAccess.find((m) => m.module_name.toLowerCase() === moduleName.toLowerCase());
    return module?.edit_enabled ?? true;
  };

  const canDelete = (moduleName: string): boolean => {
    if (!isModuleAccessEnabled) return true;

    const module = moduleAccess.find((m) => m.module_name.toLowerCase() === moduleName.toLowerCase());
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
    createDefaultModules,
    canCreate,
    canEdit,
    canDelete,
    isModuleAccessEnabled
  };

  return (
    <ModuleAccessContext.Provider value={value}>
      {children}
    </ModuleAccessContext.Provider>
  );
};