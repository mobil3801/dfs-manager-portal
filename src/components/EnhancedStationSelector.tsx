import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Globe } from 'lucide-react';
import { useStationOptions } from '@/hooks/use-station-options';

interface EnhancedStationSelectorProps {
  onStationSelect: (station: string) => void;
  title?: string;
  description?: string;
  includeAll?: boolean;
}

const EnhancedStationSelector: React.FC<EnhancedStationSelectorProps> = ({
  onStationSelect,
  title = "Select Station",
  description = "Choose the station to create a daily sales report for",
  includeAll = true
}) => {
  const { stationOptions, canSelectAll } = useStationOptions(includeAll);

  // Filter out ALL option if user doesn't have permission and includeAll is true
  const visibleStations = stationOptions.filter((station) =>
  station.value !== 'ALL' || canSelectAll
  );

  const getStationIcon = (stationValue: string) => {
    if (stationValue === 'ALL') {
      return <Globe className="w-8 h-8" />;
    }
    return <MapPin className="w-8 h-8" />;
  };

  const getStationDescription = (stationValue: string, stationLabel: string) => {
    if (stationValue === 'ALL') {
      return 'View and manage all stations';
    }

    switch (stationValue) {
      case 'MOBIL':
        return 'Gas station with convenience store';
      case 'AMOCO ROSEDALE':
        return 'Full service gas station';
      case 'AMOCO BROOKLYN':
        return 'Full service gas station';
      default:
        return 'Gas station location';
    }
  };

  const getStationLocation = (stationValue: string) => {
    if (stationValue === 'ALL') {
      return 'All Locations';
    }

    switch (stationValue) {
      case 'MOBIL':
        return 'Far Rockaway';
      case 'AMOCO ROSEDALE':
        return 'Rosedale';
      case 'AMOCO BROOKLYN':
        return 'Brooklyn';
      default:
        return 'Location';
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Building2 className="w-6 h-6" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 ${visibleStations.length <= 2 ? 'md:grid-cols-2' : visibleStations.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
          {visibleStations.map((station) =>
          <Button
            key={station.value}
            variant="outline"
            className={`h-auto p-6 flex flex-col items-center space-y-3 ${
            station.value === 'ALL' ?
            'bg-gray-50 border-gray-300 hover:bg-gray-100' :
            station.color?.replace('bg-', 'bg-') + '-50 border-' + station.color?.replace('bg-', '') + '-200 hover:bg-' + station.color?.replace('bg-', '') + '-100'} transition-all duration-200`
            }
            onClick={() => onStationSelect(station.value)}>

              {getStationIcon(station.value)}
              <div className="text-center">
                <div className="font-semibold text-lg flex items-center space-x-2">
                  <span>{station.label}</span>
                  {station.value === 'ALL' &&
                <Badge variant="secondary" className="text-xs">
                      All
                    </Badge>
                }
                </div>
                <div className="text-sm text-muted-foreground">
                  {getStationLocation(station.value)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getStationDescription(station.value, station.label)}
                </div>
              </div>
            </Button>
          )}
        </div>
        
        {includeAll && !canSelectAll &&
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> The "ALL" option is available for Administrators and Management only.
            </div>
          </div>
        }
      </CardContent>
    </Card>);

};

export default EnhancedStationSelector;