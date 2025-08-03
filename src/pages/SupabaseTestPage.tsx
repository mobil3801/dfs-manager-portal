import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';

const SupabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SupabaseConnectionTest />
    </div>
  );
};

export default SupabaseTestPage;