
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="https://newoaks.s3.us-west-1.amazonaws.com/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
        alt="DFS Manager Portal" 
        className="h-8 w-auto"
      />
      <span className="font-bold text-lg text-gray-900">DFS Manager</span>
    </div>
  );
};
