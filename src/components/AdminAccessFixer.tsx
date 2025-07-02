import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const AdminAccessFixer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const { toast } = useToast();

  const fixAdminAccess = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Find the admin profile (user_id 24466)
      const profileResponse = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'user_id', op: 'Equal', value: 24466 }
        ]
      });

      if (profileResponse.error) {
        throw new Error('Failed to find admin profile: ' + profileResponse.error);
      }

      if (!profileResponse.data?.List?.length) {
        throw new Error('Admin profile not found');
      }

      const adminProfile = profileResponse.data.List[0];

      // Update the admin profile to ensure proper role and permissions
      const updateResponse = await window.ezsite.apis.tableUpdate(11725, {
        ID: adminProfile.id,
        user_id: adminProfile.user_id,
        role: 'Administrator', // Standardize to Administrator
        station: 'ALL',
        employee_id: 'ADMIN-001',
        phone: adminProfile.phone || '',
        hire_date: adminProfile.hire_date || new Date().toISOString(),
        is_active: true,
        detailed_permissions: JSON.stringify({
          users: { view: true, create: true, edit: true, delete: true },
          products: { view: true, create: true, edit: true, delete: true },
          sales: { view: true, create: true, edit: true, delete: true },
          employees: { view: true, create: true, edit: true, delete: true },
          vendors: { view: true, create: true, edit: true, delete: true },
          orders: { view: true, create: true, edit: true, delete: true },
          licenses: { view: true, create: true, edit: true, delete: true },
          salary: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, create: true, edit: true, delete: true },
          delivery: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, create: true, edit: true, delete: true },
          admin: { view: true, create: true, edit: true, delete: true }
        })
      });

      if (updateResponse.error) {
        throw new Error('Failed to update admin profile: ' + updateResponse.error);
      }

      setMessage('Admin access has been fixed successfully! The admin user now has proper Administrator privileges.');
      setMessageType('success');
      
      toast({
        title: 'Success',
        description: 'Admin access fixed successfully'
      });

    } catch (error) {
      console.error('Error fixing admin access:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fix admin access';
      setMessage(errorMessage);
      setMessageType('error');
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <Shield className="w-12 h-12 mx-auto text-blue-600 mb-2" />
        <CardTitle>Fix Admin Access</CardTitle>
        <CardDescription>
          Fix admin access issues for admin@dfs-portal.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className={`${messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {messageType === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">This will:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Update the admin role to "Administrator"</li>
            <li>• Grant full system permissions</li>
            <li>• Enable access to all admin features</li>
            <li>• Fix any permission issues</li>
          </ul>
        </div>

        <Button
          onClick={fixAdminAccess}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Fixing Admin Access...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Fix Admin Access
            </>
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>User ID: 24466 (admin@dfs-portal.com)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAccessFixer;