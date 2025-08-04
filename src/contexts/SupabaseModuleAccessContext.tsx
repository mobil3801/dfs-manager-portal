import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface ModuleAccess {
  id: string;
  user_id: string;
  module_name: string;
  access_level: string;
  is_active: boolean;
  display_name?: string;
  create_enabled: boolean;
  edit_enabled: boolean;
  delete_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ModuleAccessContextType {
  moduleAccess: ModuleAccess[];
  loading: boolean;
  error: string | null;
  fetchModuleAccess: () => Promise<void>;
  updateModuleAccess: (id: string, updates: Partial<ModuleAccess>) => Promise<void>;
  setupModuleAccess: (userId: string) => Promise<boolean>;
  canCreate: (moduleName: string) => boolean;
  canEdit: (moduleName: string) => boolean;
  canDelete: (moduleName: string) => boolean;
  isModuleAccessEnabled: boolean;
}

const SupabaseModuleAccessContext = createContext<ModuleAccessContextType | undefined>(undefined);

export const useSupabaseModuleAccess = () => {
  const context = useContext(SupabaseModuleAccessContext);
  if (!context) {
    throw new Error('useSupabaseModuleAccess must be used within a SupabaseModuleAccessProvider');
  }
  return context;
};

export const SupabaseModuleAccessProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModuleAccessEnabled, setIsModuleAccessEnabled] = useState(true);
  
  const { user, isAuthenticated } = useSupabaseAuth();

  const defaultModules = [
    { module_name: 'products', display_name: 'Products', access_level: 'full' },
    { module_name: 'employees', display_name: 'Employees', access_level: 'full' },
    { module_name: 'sales', display_name: 'Sales Reports', access_level: 'full' },
    { module_name: 'vendors', display_name: 'Vendors', access_level: 'full' },
    { module_name: 'orders', display_name: 'Orders', access_level: 'full' },
    { module_name: 'licenses', display_name: 'Licenses & Certificates', access_level: 'full' },
    { module_name: 'salary', display_name: 'Salary Records', access_level: 'full' },
    { module_name: 'delivery', display_name: 'Delivery Records', access_level: 'full' },
    { module_name: 'admin', display_name: 'Administration', access_level: 'full' }
  ];

  const setupModuleAccess = async (userId: string): Promise<boolean> => {
    if (!userId) {
      console.log('❌ No user ID provided for module access setup');
      return false;
    }

    try {
      console.log(`🔧 Setting up module access for user ${userId}...`);
      
      // Clear existing access first
      try {
        console.log('🧹 Clearing existing module access...');
        const { error: deleteError } = await supabase
          .from('module_access')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.warn('⚠️ Could not clear existing access:', deleteError);
        }
      } catch (clearError) {
        console.warn('⚠️ Could not clear existing access (table might be empty):', clearError);
      }

      // Create module access records
      const moduleRecords = defaultModules.map(module => ({
        user_id: userId,
        module_name: module.module_name,
        display_name: module.display_name,
        access_level: module.access_level,
        is_active: true,
        create_enabled: true,
        edit_enabled: true,
        delete_enabled: true,
        granted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('📝 Creating module access records:', moduleRecords.length);
      
      const { data, error: insertError } = await supabase
        .from('module_access')
        .insert(moduleRecords)
        .select();

      if (insertError) {
        console.error('❌ Error creating module access:', insertError);
        throw insertError;
      }

      console.log('✅ Module access setup complete:', data?.length);
      return true;
    } catch (error) {
      console.error('❌ Error setting up module access:', error);
      return false;
    }
  };

  const fetchModuleAccess = async () => {
    if (!user || !isAuthenticated) {
      setModuleAccess([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching module access for user:', user.id);

      const { data, error } = await supabase
        .from('module_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('module_name');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('📝 No module access found, setting up default access...');
        const setupSuccess = await setupModuleAccess(user.id);
        
        if (setupSuccess) {
          // Fetch again after setup
          const { data: newData, error: fetchError } = await supabase
            .from('module_access')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('module_name');

          if (fetchError) {
            throw fetchError;
          }

          setModuleAccess(newData || []);
        } else {
          // Use default permissions if setup fails
          setModuleAccess(defaultModules.map((module, index) => ({
            id: `default-${index}`,
            user_id: user.id,
            module_name: module.module_name,
            display_name: module.display_name,
            access_level: module.access_level,
            is_active: true,
            create_enabled: true,
            edit_enabled: true,
            delete_enabled: true
          })));
        }
      } else {
        console.log('✅ Module access loaded:', data.length);
        setModuleAccess(data);
      }

      setIsModuleAccessEnabled(true);
    } catch (err) {
      console.error('❌ Error fetching module access:', err);
      setError(null); // Don't show error to user
      setIsModuleAccessEnabled(false);
      
      // Set default permissions when there's an error
      setModuleAccess(defaultModules.map((module, index) => ({
        id: `fallback-${index}`,
        user_id: user?.id || '',
        module_name: module.module_name,
        display_name: module.display_name,
        access_level: module.access_level,
        is_active: true,
        create_enabled: true,
        edit_enabled: true,
        delete_enabled: true
      })));
    } finally {
      setLoading(false);
    }
  };

  const updateModuleAccess = async (id: string, updates: Partial<ModuleAccess>) => {
    try {
      const { error } = await supabase
        .from('module_access')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setModuleAccess(prev => 
        prev.map(module => 
          module.id === id 
            ? { ...module, ...updates, updated_at: new Date().toISOString() }
            : module
        )
      );

      toast.success('Module access updated successfully');
    } catch (err) {
      console.error('❌ Error updating module access:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update module access';
      toast.error(errorMessage);
      
      // Refresh data to revert changes
      await fetchModuleAccess();
    }
  };

  const canCreate = (moduleName: string): boolean => {
    if (!isModuleAccessEnabled) return true;
    
    const module = moduleAccess.find(m => 
      m.module_name.toLowerCase() === moduleName.toLowerCase()
    );
    return module?.create_enabled ?? true;
  };

  const canEdit = (moduleName: string): boolean => {
    if (!isModuleAccessEnabled) return true;
    
    const module = moduleAccess.find(m => 
      m.module_name.toLowerCase() === moduleName.toLowerCase()
    );
    return module?.edit_enabled ?? true;
  };

  const canDelete = (moduleName: string): boolean => {
    if (!isModuleAccessEnabled) return true;
    
    const module = moduleAccess.find(m => 
      m.module_name.toLowerCase() === moduleName.toLowerCase()
    );
    return module?.delete_enabled ?? true;
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchModuleAccess();
    }
  }, [isAuthenticated, user]);

  const value: ModuleAccessContextType = {
    moduleAccess,
    loading,
    error,
    fetchModuleAccess,
    updateModuleAccess,
    setupModuleAccess,
    canCreate,
    canEdit,
    canDelete,
    isModuleAccessEnabled
  };

  return (
    <SupabaseModuleAccessContext.Provider value={value}>
      {children}
    </SupabaseModuleAccessContext.Provider>
  );
};