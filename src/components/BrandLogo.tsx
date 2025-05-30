import React from 'react';

interface BrandLogoProps {
  station: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ 
  station, 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const getBrandInfo = (stationName: string) => {
    const station = stationName.toUpperCase();
    
    if (station.includes('MOBIL')) {
      return {
        brand: 'MOBIL',
        logo: 'https://images.unsplash.com/photo-1543285198-3af15c4592ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxUaGUlMjBsb2dvJTIwb2YlMjB0aGUlMjBNb2JpbCUyMGJyYW5kJTJDJTIwZmVhdHVyaW5nJTIwYSUyMHN0eWxpemVkJTIwdGV4dCUyMGRlc2lnbi58ZW58MHx8fHwxNzQ4NjQ5Mzk1fDA&ixlib=rb-4.1.0&q=80&w=200$w=800',
        color: 'bg-blue-600',
        textColor: 'text-blue-700'
      };
    } else if (station.includes('AMOCO')) {
      return {
        brand: 'AMOCO',
        logo: 'https://images.unsplash.com/photo-1604079681864-c6fbd7eb109c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxUaGUlMjBBbW9jbyUyMGxvZ28lMjBmZWF0dXJpbmclMjBhJTIwdG9yY2glMjBkZXNpZ24lMjB3aXRoJTIwYSUyMHJlZCUyQyUyMHdoaXRlJTJDJTIwYW5kJTIwYmx1ZSUyMGNvbG9yJTIwc2NoZW1lLnxlbnwwfHx8fDE3NDg2NDkzOTN8MA&ixlib=rb-4.1.0&q=80&w=200$w=800',
        color: 'bg-red-600',
        textColor: 'text-red-700'
      };
    }
    
    return {
      brand: 'STATION',
      logo: null,
      color: 'bg-gray-600',
      textColor: 'text-gray-700'
    };
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const brandInfo = getBrandInfo(station);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {brandInfo.logo ? (
        <img 
          src={brandInfo.logo} 
          alt={`${brandInfo.brand} logo`}
          className={`${getSizeClasses()} object-contain bg-white rounded-sm p-1 border border-gray-200`}
          onError={(e) => {
            // Fallback to colored circle if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
      ) : (
        <div className={`${getSizeClasses()} ${brandInfo.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
          {brandInfo.brand.charAt(0)}
        </div>
      )}
      
      {/* Fallback element for when image fails */}
      <div 
        className={`${getSizeClasses()} ${brandInfo.color} rounded-full items-center justify-center text-white text-xs font-bold hidden`}
      >
        {brandInfo.brand.charAt(0)}
      </div>
      
      {showText && (
        <span className={`font-medium ${brandInfo.textColor}`}>
          {brandInfo.brand}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;