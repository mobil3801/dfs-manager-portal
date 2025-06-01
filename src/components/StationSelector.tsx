import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building2 } from 'lucide-react';

interface StationSelectorProps {
  onStationSelect: (station: string) => void;
}

const stations = [
{
  id: 'MOBIL',
  name: 'MOBIL',
  location: 'Far Rockaway',
  description: 'Gas station with convenience store',
  color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
},
{
  id: 'AMOCO ROSEDALE',
  name: 'AMOCO',
  location: 'Rosedale',
  description: 'Full service gas station',
  color: 'bg-green-50 border-green-200 hover:bg-green-100'
},
{
  id: 'AMOCO BROOKLYN',
  name: 'AMOCO',
  location: 'Brooklyn',
  description: 'Full service gas station',
  color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
}];


const StationSelector: React.FC<StationSelectorProps> = ({ onStationSelect }) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Building2 className="w-6 h-6" />
          <span>Select Station</span>
        </CardTitle>
        <CardDescription>
          Choose the station to create a daily sales report for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stations.map((station) =>
          <Button
            key={station.id}
            variant="outline"
            className={`h-auto p-6 flex flex-col items-center space-y-3 ${station.color} transition-all duration-200`}
            onClick={() => onStationSelect(station.id)}>

              <MapPin className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold text-lg">{station.name}</div>
                <div className="text-sm text-muted-foreground">{station.location}</div>
                <div className="text-xs text-muted-foreground mt-1">{station.description}</div>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>);

};

export default StationSelector;