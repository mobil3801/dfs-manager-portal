import React from 'react';
import SupabaseConnectionValidator from '@/components/SupabaseConnectionValidator';

const DatabaseConnectionTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <SupabaseConnectionValidator />
      </div>
    </div>
  );
};

export default DatabaseConnectionTest;