import React from 'react';
import AdminSetupHelper from '@/components/AdminSetupHelper';

const AdminSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
            DFS Manager Portal
          </h1>
          <p className="text-slate-600 font-medium">Admin Setup</p>
        </div>
        <AdminSetupHelper />
      </div>
    </div>);

};

export default AdminSetup;