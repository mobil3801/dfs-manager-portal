import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    auto: 'w-full h-full max-w-full max-h-full'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    auto: 'text-base'
  };

  const iconSize = {
    sm: 'text-xs',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    auto: 'text-sm'
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative flex-shrink-0">
        {!imageError ? (
          <img
            src="/dfs-logo.png"
            alt="DFS Manager Portal Logo"
            className={`${sizeClasses[size]} object-contain drop-shadow-sm`}
            onError={() => {
              console.log('DFS logo not found, using fallback design');
              setImageError(true);
            }}
          />
        ) : (
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center text-white font-bold ${iconSize[size]} shadow-lg border border-blue-700`}>
            <div className="text-center">
              <div className="font-extrabold tracking-wide">DFS</div>
              {size !== 'sm' && <div className="text-xs opacity-90">MGR</div>}
            </div>
          </div>
        )}
      </div>
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-bold text-gray-800 leading-tight ${textSizeClasses[size]}`}>
            DFS Manager Portal
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Business Management
            </span>
          )}
        </div>
      )}
    </div>
  );

};

export default Logo;