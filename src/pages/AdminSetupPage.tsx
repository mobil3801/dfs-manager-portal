import React from 'react';
import AdminSetupManager from '@/components/AdminSetupManager';

const AdminSetupPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DFS Manager Portal</h1>
          <p className="text-xl text-gray-600">Administrator Account Setup & Testing</p>
        </div>

        {/* Main Setup Component */}
        <div className="flex justify-center">
          <AdminSetupManager />
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">🔒 Security Information</h3>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• The default password is temporary and should be changed immediately</li>
              <li>• Admin account has full system access</li>
              <li>• All actions are logged for security audit</li>
              <li>• Two-factor authentication can be enabled later</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">⚙️ System Features</h3>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• Complete user and role management</li>
              <li>• Station and inventory tracking</li>
              <li>• Sales reporting and analytics</li>
              <li>• SMS notifications and alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;