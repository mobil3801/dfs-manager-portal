import { supabase } from '@/lib/supabase';

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  serverHealth?: 'healthy' | 'degraded' | 'down';
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'down';
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
  responseTime: number;
  timestamp: Date;
  errorDetails?: string;
}

class DatabaseConnectionManager {
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastChecked: new Date()
  };

  private healthCheckInterval?: NodeJS.Timeout;
  private listeners: Array<(status: ConnectionStatus) => void> = [];
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  constructor() {
    // Delay initial health check to allow app to initialize
    setTimeout(() => {
      this.startHealthCheck();
    }, 2000);
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck(): void {
    // Initial check
    this.checkConnection();

    // Set up periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.checkConnection();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Check database connection
   */
  async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();

    try {
      // Test basic Supabase connection with a simple auth check first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError && !authError.message.includes('not authenticated')) {
        throw new Error(`Auth service unavailable: ${authError.message}`);
      }

      // Try a simple database query if auth is working
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      // Consider connection successful even if no data (RLS may block query)
      if (error && !error.message.includes('row-level security') && !error.message.includes('permission denied')) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Connection successful
      this.connectionStatus = {
        isConnected: true,
        lastChecked: new Date(),
        responseTime,
        serverHealth: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'down'
      };

      this.retryCount = 0;
      this.notifyListeners();

      return this.connectionStatus;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.connectionStatus = {
        isConnected: false,
        lastChecked: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown connection error',
        serverHealth: 'down'
      };

      this.retryCount++;
      
      // Only log significant errors, not routine auth checks
      if (this.retryCount <= this.MAX_RETRIES) {
        console.warn(`Database connection check failed (attempt ${this.retryCount}):`, error);
      }

      this.notifyListeners();
      return this.connectionStatus;
    }
  }

  /**
   * Comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks = {
      database: false,
      auth: false,
      storage: false
    };

    let errorDetails = '';

    try {
      // Test database connection
      const { data: dbData, error: dbError } = await supabase.
      from('user_profiles').
      select('id').
      limit(1);

      checks.database = !dbError;
      if (dbError) errorDetails += `Database: ${dbError.message}; `;

      // Test auth service
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        checks.auth = !authError;
        if (authError) errorDetails += `Auth: ${authError.message}; `;
      } catch (authError) {
        checks.auth = false;
        errorDetails += `Auth: ${authError instanceof Error ? authError.message : 'Unknown auth error'}; `;
      }

      // Test storage service (list files in bucket)
      try {
        const { data: storageData, error: storageError } = await supabase.
        storage.
        from('').
        list('', {
          limit: 1
        });

        checks.storage = !storageError;
        if (storageError) errorDetails += `Storage: ${storageError.message}; `;
      } catch (storageError) {
        checks.storage = false;
        errorDetails += `Storage: ${storageError instanceof Error ? storageError.message : 'Unknown storage error'}; `;
      }

    } catch (error) {
      errorDetails = error instanceof Error ? error.message : 'Unknown error during health check';
    }

    const responseTime = Date.now() - startTime;
    const allChecksPass = Object.values(checks).every((check) => check);
    const someChecksPass = Object.values(checks).some((check) => check);

    let status: 'healthy' | 'degraded' | 'down';
    if (allChecksPass) {
      status = 'healthy';
    } else if (someChecksPass) {
      status = 'degraded';
    } else {
      status = 'down';
    }

    return {
      status,
      checks,
      responseTime,
      timestamp: new Date(),
      errorDetails: errorDetails || undefined
    };
  }

  /**
   * Test a specific database operation
   */
  async testDatabaseOperation(): Promise<{success: boolean;error?: string;responseTime: number;}> {
    const startTime = Date.now();

    try {
      // Test a simple select operation
      const { data, error } = await supabase.
      from('user_profiles').
      select('id, role').
      limit(5);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          success: false,
          error: error.message,
          responseTime
        };
      }

      return {
        success: true,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        responseTime
      };
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get connection health metrics
   */
  getHealthMetrics(): {
    isHealthy: boolean;
    responseTime: number;
    lastChecked: Date;
    retryCount: number;
  } {
    return {
      isHealthy: this.connectionStatus.isConnected,
      responseTime: this.connectionStatus.responseTime || 0,
      lastChecked: this.connectionStatus.lastChecked,
      retryCount: this.retryCount
    };
  }

  /**
   * Force a connection check
   */
  async forceCheck(): Promise<ConnectionStatus> {
    return await this.checkConnection();
  }

  /**
   * Add listener for connection status changes
   */
  addListener(callback: (status: ConnectionStatus) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: (status: ConnectionStatus) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.connectionStatus);
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    currentStatus: string;
    avgResponseTime: number | null;
    uptime: number;
    lastError: string | null;
  } {
    return {
      currentStatus: this.connectionStatus.isConnected ? 'Connected' : 'Disconnected',
      avgResponseTime: this.connectionStatus.responseTime || null,
      uptime: this.retryCount === 0 ? 100 : Math.max(0, 100 - this.retryCount * 10),
      lastError: this.connectionStatus.error || null
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopHealthCheck();
    this.listeners = [];
  }
}

// Export singleton instance
export const databaseConnectionManager = new DatabaseConnectionManager();
export default databaseConnectionManager;