import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Settings, Info, ExternalLink } from 'lucide-react';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

const SupabaseConnectionTestPage = () => {
  const { hasAdminAccess, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Connection Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test and verify Supabase database connectivity and configuration
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Database className="h-3 w-3 mr-1" />
          Admin Tools
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Real-time database connectivity status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor database connection health and performance metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Environment and API settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verify Supabase URL, keys, and feature configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Diagnostics
            </CardTitle>
            <CardDescription>
              Detailed connection diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In-depth analysis of database tables and permissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This page runs comprehensive tests on your Supabase configuration including database connectivity, 
          authentication, real-time capabilities, and table access. Use this to troubleshoot connection issues.
        </AlertDescription>
      </Alert>

      <SupabaseConnectionTest />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common troubleshooting and maintenance actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://supabase.com/docs', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Supabase Documentation
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(import.meta.env.VITE_SUPABASE_URL, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Supabase Dashboard
            </Button>
          </div>
          
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Environment Configuration:</strong> Ensure your .env.local file contains the correct 
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values from your Supabase project settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseConnectionTestPage;