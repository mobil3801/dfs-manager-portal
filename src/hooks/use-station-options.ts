import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface StationOption {
  value: string;
  label: string;
  color?: string;
}

/**
 * Hook to get station options based on user permissions
 * Automatically includes 'ALL' option for users with appropriate permissions
 */
export const useStationOptions = (includeAll: boolean = true) => {
  const { userProfile } = useAuth();

  const stationOptions: StationOption[] = useMemo(() => {
    const baseStations: StationOption[] = [
    {
      value: 'MOBIL',
      label: 'MOBIL',
      color: 'bg-blue-500'
    },
    {
      value: 'AMOCO ROSEDALE',
      label: 'AMOCO ROSEDALE',
      color: 'bg-green-500'
    },
    {
      value: 'AMOCO BROOKLYN',
      label: 'AMOCO BROOKLYN',
      color: 'bg-purple-500'
    }];


    // Check if user should see ALL option
    const canViewAll = userProfile?.role === 'Administrator' ||
    userProfile?.role === 'Management';

    if (includeAll && canViewAll) {
      return [
      {
        value: 'ALL',
        label: 'ALL',
        color: 'bg-gray-600'
      },
      ...baseStations];

    }

    return baseStations;
  }, [userProfile?.role, includeAll]);

  const getStationColor = (station: string): string => {
    const option = stationOptions.find((opt) => opt.value === station);
    return option?.color || 'bg-gray-500';
  };

  const canSelectAll = useMemo(() => {
    return userProfile?.role === 'Administrator' || userProfile?.role === 'Management';
  }, [userProfile?.role]);

  return {
    stationOptions,
    getStationColor,
    canSelectAll,
    allStations: ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN']
  };
};

/**
 * Hook for filtering logic when 'ALL' is selected
 */
export const useStationFilter = (selectedStation: string) => {
  const { allStations } = useStationOptions();

  const getStationFilters = useMemo(() => {
    if (selectedStation === 'ALL') {
      // When ALL is selected, we typically want to show data from all stations
      // This means we don't add a station filter, or we add multiple filters
      return null; // No station filter
    }

    return [{ name: 'station', op: 'Equal', value: selectedStation }];
  }, [selectedStation, allStations]);

  const shouldFilterByStation = selectedStation && selectedStation !== 'ALL';

  return {
    stationFilters: getStationFilters,
    shouldFilterByStation,
    isAllSelected: selectedStation === 'ALL'
  };
};

export default useStationOptions;