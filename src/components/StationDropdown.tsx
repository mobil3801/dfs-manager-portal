import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useStationOptions } from '@/hooks/use-station-options';

interface StationDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  includeAll?: boolean;
  showBadge?: boolean;
  className?: string;
  id?: string;
}

const StationDropdown: React.FC<StationDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Select station",
  label,
  required = false,
  disabled = false,
  includeAll = true,
  showBadge = false,
  className = "",
  id
}) => {
  const { stationOptions, getStationColor } = useStationOptions(includeAll);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && ' *'}
        </Label>
      )}
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder}>
            {value && showBadge ? (
              <Badge className={`text-white ${getStationColor(value)}`}>
                {value}
              </Badge>
            ) : (
              value || placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stationOptions.map((station) => (
            <SelectItem key={station.value} value={station.value}>
              <div className="flex items-center space-x-2">
                {showBadge && (
                  <div className={`w-3 h-3 rounded-full ${station.color}`} />
                )}
                <span>{station.label}</span>
                {station.value === 'ALL' && (
                  <span className="text-xs text-gray-500">(All Stations)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StationDropdown;