import React from 'react';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import ModuleAccessManager from '@/components/ModuleAccessManager';
import StationAccessDemo from '@/components/StationAccessDemo';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2 } from 'lucide-react';

const ModuleAccessPage: React.FC = () => {
  return (
    <ModuleAccessProvider>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Module and Station Access Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="modules" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Module Access</span>
                </TabsTrigger>
                <TabsTrigger value="stations" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Station Access Demo</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="modules" className="mt-6">
                <ModuleAccessManager />
              </TabsContent>
              
              <TabsContent value="stations" className="mt-6">
                <StationAccessDemo />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ModuleAccessProvider>
  );
};

export default ModuleAccessPage;