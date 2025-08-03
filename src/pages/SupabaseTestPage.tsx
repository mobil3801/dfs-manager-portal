import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import SimpleAuthTest from '@/components/SimpleAuthTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SupabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Supabase Testing Dashboard</h1>
        
        <Tabs defaultValue="simple" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Simple Test</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple">
            <SimpleAuthTest />
          </TabsContent>
          
          <TabsContent value="advanced">
            <SupabaseConnectionTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>);

};

export default SupabaseTestPage;