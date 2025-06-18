import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="https://newoaks.s3.us-west-1.amazonaws.com/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
        alt="DFS Manager Portal"
        className="h-8 w-auto"
        onError={(e) => {
          // Fallback to text logo if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
            DFS
          </div>
          <span className="ml-2 text-gray-800 font-semibold">Manager Portal</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;