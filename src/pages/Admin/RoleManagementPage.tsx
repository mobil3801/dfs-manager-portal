import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';
import RoleManagement from '@/components/RoleManagement';

const RoleManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>);

  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RoleManagement />
    </div>);

};

export default RoleManagementPage;