import React, { useState, useEffect } from 'react';
import AdminSetup from '@/components/AdminSetup';
import { toast } from 'sonner';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTimeSetup();
  }, []);

  const checkFirstTimeSetup = async () => {
    try {
      // Check if any admin users exist in the UserProfile table
      const { data, error } = await window.ezsite.apis.tablePage('24040', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'role', op: 'Equal', value: 'admin' }]
      });

      if (error) {
        // If table doesn't exist or there's an error, assume first-time setup
        console.log('Table might not exist, showing first-time setup');
        setIsFirstTimeSetup(true);
      } else if (data?.List?.length === 0) {
        // No admin users found, show first-time setup
        setIsFirstTimeSetup(true);
      } else {
        // Admin users exist, skip setup
        setIsFirstTimeSetup(false);
      }
    } catch (error) {
      console.error('Error checking first-time setup:', error);
      // On error, assume first-time setup
      setIsFirstTimeSetup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    toast.success('System setup completed successfully!');
    setIsFirstTimeSetup(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <img
            src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
            alt="Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (isFirstTimeSetup) {
    return <AdminSetup onSetupComplete={handleSetupComplete} />;
  }

  return <>{children}</>;
};

export default AppInitializer;