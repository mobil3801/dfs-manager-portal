import React from 'react';

export const Logo: React.FC<{className?: string; size?: 'sm' | 'md' | 'lg';}> = ({ 
  className = "",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
        alt="DFS Manager Portal"
        className={sizeClasses[size]}
        onError={(e) => {
          // Fallback to text logo if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback text logo - hidden by default, shown if image fails */}
      <div className="hidden">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white px-3 py-1 rounded-lg font-bold text-lg">
            DFS
          </div>
          <span className="ml-2 text-gray-800 dark:text-gray-200 font-semibold">Manager Portal</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;