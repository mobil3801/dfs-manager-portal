import { supabase } from '@/lib/supabase';

export interface Station {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StationOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
}

interface StationServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

class StationService {
  private static instance: StationService;
  private stationsCache: Station[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): StationService {
    if (!StationService.instance) {
      StationService.instance = new StationService();
    }
    return StationService.instance;
  }

  // Get all stations with caching
  async getStations(forceRefresh = false): Promise<Station[]> {
    if (!forceRefresh && this.stationsCache && this.isCacheValid()) {
      return this.stationsCache;
    }

    try {
      const { data, error } = await supabase.
      from('stations').
      select('*').
      eq('is_active', true).
      order('name', { ascending: true });

      if (error) throw error;

      this.stationsCache = data || [];
      this.cacheTimestamp = Date.now();
      return this.stationsCache;
    } catch (error) {
      console.error('Error fetching stations:', error);
      return [];
    }
  }

  // Get station options for dropdowns
  async getStationOptions(
  includeAll: boolean = true,
  userRole?: string,
  userPermissions?: string[])
  : Promise<StationOption[]> {
    try {
      const stations = await this.getStations();
      const options: StationOption[] = [];

      // Add "All Stations" option if requested and user has permission
      if (includeAll && this.canUserSelectAll(userRole, userPermissions)) {
        options.push({
          value: 'ALL_STATIONS',
          label: 'All Stations',
          color: 'bg-blue-600',
          description: 'View data from all stations'
        });
      }

      // Add individual station options
      stations.forEach((station) => {
        options.push({
          value: station.name,
          label: station.name,
          color: this.getStationColor(station.name),
          description: station.address
        });
      });

      return options;
    } catch (error) {
      console.error('Error getting station options:', error);
      return [];
    }
  }

  // Get station color for UI consistency
  getStationColor(stationName: string): string {
    const colors: Record<string, string> = {
      'MOBIL': 'bg-blue-500',
      'AMOCO ROSEDALE': 'bg-green-500',
      'AMOCO BROOKLYN': 'bg-purple-500'
    };

    return colors[stationName?.toUpperCase()] || 'bg-gray-500';
  }

  // Get accessible stations for a user
  async getUserAccessibleStations(
  userRole?: string,
  userPermissions?: string[],
  userStationAccess?: string[])
  : Promise<string[]> {
    try {
      // Admins and managers can access all stations
      if (this.canUserSelectAll(userRole, userPermissions)) {
        const stations = await this.getStations();
        return stations.map((station) => station.name);
      }

      // Return user's specific station access
      if (userStationAccess && userStationAccess.length > 0) {
        return userStationAccess;
      }

      // Default to no access
      return [];
    } catch (error) {
      console.error('Error getting user accessible stations:', error);
      return [];
    }
  }

  // Check if user can select "All Stations"
  private canUserSelectAll(userRole?: string, userPermissions?: string[]): boolean {
    return userRole === 'Administrator' ||
    userRole === 'Management' ||
    userRole === 'Manager' ||
    userPermissions?.includes('view_all_stations') || false;
  }

  // Add a new station
  async addStation(stationData: Omit<Station, 'id'>): Promise<StationServiceResult> {
    try {
      const { data, error } = await supabase.
      from('stations').
      insert([{
        ...stationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]).
      select().
      single();

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to add station'
      };
    }
  }

  // Update an existing station
  async updateStation(stationData: Station): Promise<StationServiceResult> {
    try {
      const { data, error } = await supabase.
      from('stations').
      update({
        ...stationData,
        updated_at: new Date().toISOString()
      }).
      eq('id', stationData.id).
      select().
      single();

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update station'
      };
    }
  }

  // Delete (deactivate) a station
  async deleteStation(stationId: string): Promise<StationServiceResult> {
    try {
      const { data, error } = await supabase.
      from('stations').
      update({
        is_active: false,
        updated_at: new Date().toISOString()
      }).
      eq('id', stationId).
      select().
      single();

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete station'
      };
    }
  }

  // Get station by ID
  async getStationById(stationId: string): Promise<Station | null> {
    try {
      const { data, error } = await supabase.
      from('stations').
      select('*').
      eq('id', stationId).
      single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching station by ID:', error);
      return null;
    }
  }

  // Get station by name
  async getStationByName(stationName: string): Promise<Station | null> {
    try {
      const stations = await this.getStations();
      return stations.find((station) => station.name === stationName) || null;
    } catch (error) {
      console.error('Error fetching station by name:', error);
      return null;
    }
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  // Clear the cache
  clearCache(): void {
    this.stationsCache = null;
    this.cacheTimestamp = 0;
  }

  // Get station statistics
  async getStationStatistics(): Promise<{
    totalStations: number;
    activeStations: number;
    stationsByType: Array<{type: string;count: number;}>;
  }> {
    try {
      const stations = await this.getStations();
      const totalStations = stations.length;
      const activeStations = stations.filter((station) => station.is_active).length;

      // Group by station type (based on name patterns)
      const typeGroups: Record<string, number> = {};
      stations.forEach((station) => {
        const type = station.name.split(' ')[0]; // First word as type
        typeGroups[type] = (typeGroups[type] || 0) + 1;
      });

      const stationsByType = Object.entries(typeGroups).
      map(([type, count]) => ({ type, count })).
      sort((a, b) => b.count - a.count);

      return {
        totalStations,
        activeStations,
        stationsByType
      };
    } catch (error) {
      console.error('Error getting station statistics:', error);
      return {
        totalStations: 0,
        activeStations: 0,
        stationsByType: []
      };
    }
  }
}

// Export singleton instance
export const stationService = StationService.getInstance();
export default stationService;