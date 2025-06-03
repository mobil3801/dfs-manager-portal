import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import autoSyncService from '@/services/autoSyncService';

interface DatabaseSyncConfig {
  projectUrl: string;
  apiKey: string;
  jwtSecret: string;
  databaseType: string;
  autoSync: boolean;
  syncInterval: number;
  backupEnabled: boolean;
  encryptionEnabled: boolean;
}

interface SyncStatus {
  isActive: boolean;
  isConnected: boolean;
  lastSync: string;
  structureCount: number;
  errorCount: number;
  successRate: number;
}

interface DetectedStructure {
  name: string;
  type: 'form' | 'table' | 'component';
  fields: string[];
  status: 'new' | 'existing' | 'updated';
  lastModified: string;
}

export const useDatabaseSync = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<DatabaseSyncConfig>({
    projectUrl: '',
    apiKey: '',
    jwtSecret: '',
    databaseType: 'postgresql',
    autoSync: true,
    syncInterval: 300,
    backupEnabled: true,
    encryptionEnabled: true
  });

  const [status, setStatus] = useState<SyncStatus>({
    isActive: false,
    isConnected: false,
    lastSync: '',
    structureCount: 0,
    errorCount: 0,
    successRate: 0
  });

  const [structures, setStructures] = useState<DetectedStructure[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize sync service
  const initializeSync = useCallback(async (syncConfig: DatabaseSyncConfig) => {
    try {
      setIsLoading(true);
      autoSyncService.initialize(syncConfig);
      setConfig(syncConfig);

      // Store config securely (in production, use proper encryption)
      localStorage.setItem('databaseSyncConfig', JSON.stringify({
        ...syncConfig,
        apiKey: btoa(syncConfig.apiKey), // Basic encoding for demo
        jwtSecret: btoa(syncConfig.jwtSecret)
      }));

      setStatus((prev) => ({ ...prev, isConnected: true }));

      toast({
        title: "Configuration Saved",
        description: "Database sync configuration has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: "Failed to save sync configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Test database connection
  const testConnection = useCallback(async (testConfig: DatabaseSyncConfig) => {
    try {
      setIsLoading(true);

      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock validation
      if (!testConfig.projectUrl || !testConfig.apiKey) {
        throw new Error('Missing required credentials');
      }

      setStatus((prev) => ({ ...prev, isConnected: true }));

      toast({
        title: "Connection Successful",
        description: "Successfully connected to the database."
      });

      return true;
    } catch (error) {
      setStatus((prev) => ({ ...prev, isConnected: false }));

      toast({
        title: "Connection Failed",
        description: "Unable to connect to the database. Please check your credentials.",
        variant: "destructive"
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Scan for application structures
  const scanStructures = useCallback(async () => {
    try {
      setIsLoading(true);

      // Trigger scan using auto sync service
      await autoSyncService.triggerSync();

      // Get detected structures
      const detected = autoSyncService.getDetectedStructures();

      // Convert to our interface format
      const formattedStructures: DetectedStructure[] = detected.map((structure) => ({
        name: structure.name,
        type: structure.type,
        fields: structure.fields.map((field) => field.name),
        status: 'new', // This would be determined by comparing with existing structures
        lastModified: structure.lastModified
      }));

      setStructures(formattedStructures);
      setStatus((prev) => ({ ...prev, structureCount: formattedStructures.length }));

      toast({
        title: "Scan Complete",
        description: `Found ${formattedStructures.length} structures in your application.`
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to scan for structures. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Start auto-sync
  const startAutoSync = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!status.isConnected) {
        throw new Error('Not connected to database');
      }

      // Start monitoring with auto sync service
      autoSyncService.startMonitoring();

      // Process detected structures
      for (const structure of structures) {
        if (structure.status === 'new') {
          await createTableForStructure(structure);
        }
      }

      setStatus((prev) => ({
        ...prev,
        isActive: true,
        lastSync: new Date().toISOString()
      }));

      toast({
        title: "Auto-Sync Started",
        description: "Database synchronization is now active."
      });
    } catch (error) {
      toast({
        title: "Failed to Start Auto-Sync",
        description: "Unable to start auto-sync. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [status.isConnected, structures, toast]);

  // Stop auto-sync
  const stopAutoSync = useCallback(() => {
    autoSyncService.stopMonitoring();
    setStatus((prev) => ({ ...prev, isActive: false }));

    toast({
      title: "Auto-Sync Stopped",
      description: "Database synchronization has been paused."
    });
  }, [toast]);

  // Create table for detected structure
  const createTableForStructure = async (structure: DetectedStructure) => {
    try {
      // This would use the CreateOrUpdateTable function
      const fieldDefinitions = structure.fields.map((fieldName) => ({
        FieldName: fieldName,
        FieldDisplayName: formatDisplayName(fieldName),
        FieldDesc: `Auto-generated field for ${fieldName}`,
        DefaultValue: getDefaultValue(fieldName),
        ValueType: inferFieldType(fieldName),
        ComponentType: inferComponentType(fieldName)
      }));

      // Mock table creation - in production this would call the actual API
      console.log('Creating table:', {
        TableName: structure.name,
        TableDisplayName: formatDisplayName(structure.name),
        TableDesc: `Auto-generated table for ${structure.type}`,
        FieldDefinitions: fieldDefinitions
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Failed to create table for ${structure.name}:`, error);
      throw error;
    }
  };

  // Helper functions
  const formatDisplayName = (name: string): string => {
    return name.
    split('_').
    map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
    join(' ');
  };

  const getDefaultValue = (fieldName: string): string => {
    if (fieldName.includes('date') || fieldName.includes('time')) return '';
    if (fieldName.includes('count') || fieldName.includes('amount') || fieldName.includes('price')) return '0';
    if (fieldName.includes('active') || fieldName.includes('enabled')) return 'true';
    return '';
  };

  const inferFieldType = (fieldName: string): string => {
    if (fieldName.includes('date') || fieldName.includes('time')) return 'DateTime';
    if (fieldName.includes('count') || fieldName.includes('quantity')) return 'Integer';
    if (fieldName.includes('amount') || fieldName.includes('price') || fieldName.includes('rate')) return 'Number';
    if (fieldName.includes('active') || fieldName.includes('enabled')) return 'Bool';
    return 'String';
  };

  const inferComponentType = (fieldName: string): string => {
    if (fieldName.includes('image') || fieldName.includes('photo') || fieldName.includes('picture')) return 'Image';
    if (fieldName.includes('file') || fieldName.includes('document') || fieldName.includes('attachment')) return 'File';
    return 'Default';
  };

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('databaseSyncConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          ...parsed,
          apiKey: atob(parsed.apiKey || ''),
          jwtSecret: atob(parsed.jwtSecret || '')
        });
        setStatus((prev) => ({ ...prev, isConnected: true }));
      } catch (error) {
        console.error('Failed to load saved config:', error);
      }
    }
  }, []);

  // Update status periodically
  useEffect(() => {
    if (status.isActive) {
      const interval = setInterval(() => {
        const serviceStatus = autoSyncService.getStatus();
        setStatus((prev) => ({
          ...prev,
          structureCount: serviceStatus.structureCount,
          lastSync: serviceStatus.lastSync
        }));
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [status.isActive]);

  return {
    config,
    status,
    structures,
    isLoading,
    initializeSync,
    testConnection,
    scanStructures,
    startAutoSync,
    stopAutoSync,
    setConfig
  };
};

export default useDatabaseSync;