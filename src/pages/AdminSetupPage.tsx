import React, { useState } from 'react';
import AdminUserSetup from '@/components/AdminUserSetup';
import AdminAccessFixer from '@/components/AdminAccessFixer';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo and Company Name */}
        <div className="text-center">
          <div className="flex flex-col items-center">
            <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
              <Logo className="mb-4" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              DFS Manager Portal
            </h1>
            <p className="text-slate-600 font-medium">Admin Setup</p>
          </div>
        </div>

        <Tabs defaultValue="fix-access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fix-access">Fix Admin Access</TabsTrigger>
            <TabsTrigger value="create-new">Create New Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fix-access" className="space-y-4">
            <AdminAccessFixer />
          </TabsContent>
          
          <TabsContent value="create-new" className="space-y-4">
            <AdminUserSetup />
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button 
            variant="link" 
            onClick={() => window.location.href = '/login'}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Login
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>&copy; 2024 DFS Management Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;