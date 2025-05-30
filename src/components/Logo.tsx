import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const iconSize = {
    sm: 'text-xs',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        {!imageError ? (
          <img
            src="/dfs-logo.png"
            alt="DFS Logo"
            className={`${sizeClasses[size]} object-contain`}
            onError={() => {
              console.log('Logo not found, using fallback design');
              setImageError(true);
            }}
          />
        ) : (
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center text-white font-bold ${iconSize[size]} shadow-lg`}>
            DFS
          </div>
        )}
      </div>
      {showText && (
        <span className={`font-bold text-brand-900 ${textSizeClasses[size]}`}>
          DFS Manager Portal
        </span>
      )}
    </div>
  );
};

export default Logo;