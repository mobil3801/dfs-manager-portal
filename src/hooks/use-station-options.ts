import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface StationOption {
  value: string;
  label: string;
  color?: string;
}

/**
 * Hook to get station options based on user permissions
 * Automatically includes 'ALL_STATIONS' option for users with appropriate permissions
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
      }
    ];

    // Check if user should see ALL option based on their role and permissions
    const canViewAll = userProfile?.role === 'Administrator' ||
      userProfile?.role === 'Management' ||
      userProfile?.role === 'Manager' ||
      userProfile?.permissions?.includes('view_all_stations');

    if (includeAll && canViewAll) {
      return [
        {
          value: 'ALL_STATIONS',
          label: 'All Station',
          color: 'bg-indigo-600'
        },
        ...baseStations
      ];
    }

    return baseStations;
  }, [userProfile?.role, userProfile?.permissions, includeAll]);

  const getStationColor = (station: string): string => {
    const option = stationOptions.find((opt) => opt.value === station);
    return option?.color || 'bg-gray-500';
  };

  const canSelectAll = useMemo(() => {
    return userProfile?.role === 'Administrator' || 
           userProfile?.role === 'Management' ||
           userProfile?.role === 'Manager' ||
           userProfile?.permissions?.includes('view_all_stations');
  }, [userProfile?.role, userProfile?.permissions]);

  const getUserAccessibleStations = useMemo(() => {
    if (canSelectAll) {
      return ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];
    }
    
    // Filter stations based on user's specific station permissions
    const accessibleStations = [];
    if (userProfile?.permissions?.includes('view_mobil') || userProfile?.stationAccess?.includes('MOBIL')) {
      accessibleStations.push('MOBIL');
    }
    if (userProfile?.permissions?.includes('view_amoco_rosedale') || userProfile?.stationAccess?.includes('AMOCO ROSEDALE')) {
      accessibleStations.push('AMOCO ROSEDALE');
    }
    if (userProfile?.permissions?.includes('view_amoco_brooklyn') || userProfile?.stationAccess?.includes('AMOCO BROOKLYN')) {
      accessibleStations.push('AMOCO BROOKLYN');
    }
    
    return accessibleStations;
  }, [userProfile?.role, userProfile?.permissions, userProfile?.stationAccess, canSelectAll]);

  return {
    stationOptions,
    getStationColor,
    canSelectAll,
    allStations: ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'],
    getUserAccessibleStations
  };
};

/**
 * Hook for filtering logic when 'ALL_STATIONS' is selected
 */
export const useStationFilter = (selectedStation: string) => {
  const { getUserAccessibleStations, canSelectAll } = useStationOptions();

  const getStationFilters = useMemo(() => {
    if (selectedStation === 'ALL_STATIONS' || selectedStation === 'ALL') {
      // When All Station is selected, show data from all stations user has access to
      const accessibleStations = getUserAccessibleStations;
      
      if (accessibleStations.length === 0) {
        return [{ name: 'station', op: 'Equal', value: '__NO_ACCESS__' }]; // No access
      }
      
      if (accessibleStations.length === 1) {
        return [{ name: 'station', op: 'Equal', value: accessibleStations[0] }];
      }
      
      // For multiple stations, we'll return null to indicate no filtering
      // The calling component should handle this by either:
      // 1. Making multiple queries
      // 2. Using an IN operator if supported
      // 3. Aggregating results client-side
      return null; // No station filter - show all accessible stations
    }

    return [{ name: 'station', op: 'Equal', value: selectedStation }];
  }, [selectedStation, getUserAccessibleStations]);

  const shouldFilterByStation = selectedStation && selectedStation !== 'ALL_STATIONS' && selectedStation !== 'ALL';

  const getAccessibleStationsFilter = useMemo(() => {
    const accessibleStations = getUserAccessibleStations;
    return accessibleStations.map(station => ({ name: 'station', op: 'Equal', value: station }));
  }, [getUserAccessibleStations]);

  return {
    stationFilters: getStationFilters,
    shouldFilterByStation,
    isAllSelected: selectedStation === 'ALL_STATIONS' || selectedStation === 'ALL',
    accessibleStations: getUserAccessibleStations,
    accessibleStationsFilter: getAccessibleStationsFilter
  };
};

export default useStationOptions;