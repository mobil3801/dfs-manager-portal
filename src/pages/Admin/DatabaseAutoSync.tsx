import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Monitor, Settings } from 'lucide-react';
import DatabaseSyncForm from '@/components/DatabaseSyncForm';
import SyncMonitoringDashboard from '@/components/SyncMonitoringDashboard';
import { useAdminAccess } from '@/hooks/use-admin-access';
import AccessDenied from '@/components/AccessDenied';

const DatabaseAutoSyncPage: React.FC = () => {
  const { hasAdminAccess } = useAdminAccess();

  if (!hasAdminAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Database Auto-Sync
        </h1>
        <p className="text-muted-foreground text-lg">
          Automatically synchronize your application forms and tables with the database
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="bg-blue-50">
            <Database className="h-3 w-3 mr-1" />
            Auto Structure Detection
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <Monitor className="h-3 w-3 mr-1" />
            Real-time Monitoring
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            <Settings className="h-3 w-3 mr-1" />
            Smart Configuration
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            How Auto-Sync Works
          </CardTitle>
          <CardDescription>
            Understanding the automated database synchronization process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Structure Detection</h3>
              <p className="text-sm text-muted-foreground">
                Automatically scans your application for forms, tables, and data structures
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Continuously monitors for changes and updates to your application structure
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Auto Synchronization</h3>
              <p className="text-sm text-muted-foreground">
                Automatically creates, updates, or removes database tables as needed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Setup & Configuration
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Monitoring & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <DatabaseSyncForm />
        </TabsContent>

        <TabsContent value="monitoring">
          <SyncMonitoringDashboard />
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Key Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-blue-800">Zero Manual Configuration</h4>
                <p className="text-sm text-blue-600">
                  No need to manually create database tables or update schemas
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-green-800">Real-time Updates</h4>
                <p className="text-sm text-green-600">
                  Database structure stays in sync with your application changes
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-purple-800">Data Integrity</h4>
                <p className="text-sm text-purple-600">
                  Backup and rollback capabilities ensure data safety
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-orange-800">Performance Monitoring</h4>
                <p className="text-sm text-orange-600">
                  Built-in analytics and performance tracking
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseAutoSyncPage;