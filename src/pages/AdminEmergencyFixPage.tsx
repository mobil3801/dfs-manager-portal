import React from 'react';
import AdminAccessEmergencyFix from '@/components/AdminAccessEmergencyFix';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';

const AdminEmergencyFixPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Shield className="w-6 h-6" />
              🚨 ADMIN ACCESS EMERGENCY CENTER 🚨
            </CardTitle>
            <CardDescription className="text-red-600">
              Emergency diagnostics and repair center for admin access issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-300 bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>CRITICAL ISSUE DETECTED:</strong> Admin user "admin@dfs-portal.com" cannot access the system. 
                This page provides emergency tools to diagnose and fix the problem immediately.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Emergency Fix Component */}
        <AdminAccessEmergencyFix />

        {/* Additional Help */}
        <Card>
          <CardHeader>
            <CardTitle>📞 Emergency Support Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">If the above fix doesn't work:</h4>
              <div className="text-sm text-yellow-800 space-y-2">
                <p>1. Check your database connection</p>
                <p>2. Verify Supabase authentication is configured correctly</p>
                <p>3. Ensure the user_profiles table exists and has the correct schema</p>
                <p>4. Contact system administrator or check server logs</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">System Architecture Notes:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Authentication: Supabase Auth (auth.users table)</p>
                <p>• User Profiles: user_profiles table with role-based permissions</p>
                <p>• Admin Role: "Administrator" role with full system access</p>
                <p>• Permissions: JSON-based permission system for granular control</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEmergencyFixPage;