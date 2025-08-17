import React from 'react';
import AdminAccessFix from '@/components/AdminAccessFix';

const AdminDebugPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Debugger</h1>
          <p className="text-gray-600">Diagnose and fix admin account access issues</p>
        </div>
        
        <AdminAccessFix />
      </div>
    </div>);

};

export default AdminDebugPage;