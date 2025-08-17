import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import AdminRoleManager from '@/components/AdminRoleManager';
import { Shield, Users, Key, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleManagement = () => {
  const { isAdmin, userProfile } = useSupabaseAuth();
  const navigate = useNavigate();

  if (!isAdmin()) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access role management.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <AdminRoleManager />
    </div>);

};

export default RoleManagement;