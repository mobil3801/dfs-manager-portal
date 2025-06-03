import DatabaseConnectionManager from './databaseConnectionManager';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class EnhancedApiService {
  private static instance: EnhancedApiService;
  private connectionManager: DatabaseConnectionManager;

  private constructor() {
    this.connectionManager = DatabaseConnectionManager.getInstance();
  }

  static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  async executeWithConnection<T>(
    operation: (connectionId: string) => Promise<ApiResponse<T>>,
    operationName: string = 'API Operation'
  ): Promise<ApiResponse<T>> {
    let connectionId: string | null = null;
    
    try {
      // Acquire connection from pool
      connectionId = await this.connectionManager.acquireConnection();
      
      console.log(`[${operationName}] Using connection: ${connectionId}`);
      
      // Execute the operation
      const result = await operation(connectionId);
      
      return result;
      
    } catch (error) {
      console.error(`[${operationName}] Error:`, error);
      
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
    } finally {
      // Always release the connection
      if (connectionId) {
        this.connectionManager.releaseConnection(connectionId);
        console.log(`[${operationName}] Released connection: ${connectionId}`);
      }
    }
  }

  // Enhanced table operations with connection management
  async tablePage(tableId: string, queryParams: any): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      // Simulate API call with connection tracking
      console.log(`[tablePage] Querying table ${tableId} with connection ${connectionId}`);
      
      // Call the actual API
      const response = await (window as any).ezsite.apis.tablePage(tableId, queryParams);
      
      return response;
    }, `tablePage-${tableId}`);
  }

  async tableCreate(tableId: string, data: any): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[tableCreate] Creating record in table ${tableId} with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.tableCreate(tableId, data);
      
      return response;
    }, `tableCreate-${tableId}`);
  }

  async tableUpdate(tableId: string, data: any): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[tableUpdate] Updating record in table ${tableId} with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.tableUpdate(tableId, data);
      
      return response;
    }, `tableUpdate-${tableId}`);
  }

  async tableDelete(tableId: string, params: any): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[tableDelete] Deleting record from table ${tableId} with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.tableDelete(tableId, params);
      
      return response;
    }, `tableDelete-${tableId}`);
  }

  async upload(fileInfo: { filename: string; file: File }): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[upload] Uploading file ${fileInfo.filename} with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.upload(fileInfo);
      
      return response;
    }, `upload-${fileInfo.filename}`);
  }

  // Authentication operations
  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[login] Authenticating user with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.login(credentials);
      
      return response;
    }, 'login');
  }

  async register(credentials: { email: string; password: string }): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[register] Registering user with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.register(credentials);
      
      return response;
    }, 'register');
  }

  async getUserInfo(): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[getUserInfo] Fetching user info with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.getUserInfo();
      
      return response;
    }, 'getUserInfo');
  }

  async logout(): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[logout] Logging out user with connection ${connectionId}`);
      
      const response = await (window as any).ezsite.apis.logout();
      
      return response;
    }, 'logout');
  }

  // Bulk operations with optimized connection usage
  async bulkTableOperations(operations: Array<{
    type: 'create' | 'update' | 'delete';
    tableId: string;
    data: any;
  }>): Promise<ApiResponse> {
    return this.executeWithConnection(async (connectionId) => {
      console.log(`[bulkOperations] Executing ${operations.length} bulk operations with connection ${connectionId}`);
      
      const results = [];
      
      for (const operation of operations) {
        try {
          let result;
          switch (operation.type) {
            case 'create':
              result = await (window as any).ezsite.apis.tableCreate(operation.tableId, operation.data);
              break;
            case 'update':
              result = await (window as any).ezsite.apis.tableUpdate(operation.tableId, operation.data);
              break;
            case 'delete':
              result = await (window as any).ezsite.apis.tableDelete(operation.tableId, operation.data);
              break;
          }
          results.push({ success: true, result });
        } catch (error) {
          results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
      
      return { data: results };
    }, 'bulkOperations');
  }

  // Connection health check
  async healthCheck(): Promise<ApiResponse> {
    const stats = this.connectionManager.getConnectionStats();
    const detailedStats = this.connectionManager.getDetailedStats();
    
    return {
      data: {
        connectionStats: stats,
        detailedStats,
        status: stats.connectionPressure > 0.85 ? 'critical' : 
                stats.connectionPressure > 0.70 ? 'warning' : 'healthy',
        timestamp: new Date().toISOString()
      }
    };
  }

  // Get connection statistics
  getConnectionStats() {
    return this.connectionManager.getConnectionStats();
  }

  // Force connection optimization
  async optimizeConnections(): Promise<ApiResponse> {
    try {
      const statsBefore = this.connectionManager.getConnectionStats();
      
      // Allow some time for natural connection cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statsAfter = this.connectionManager.getConnectionStats();
      
      return {
        data: {
          message: 'Connection optimization completed',
          before: statsBefore,
          after: statsAfter,
          improvement: {
            activeReduction: statsBefore.activeConnections - statsAfter.activeConnections,
            pressureReduction: statsBefore.connectionPressure - statsAfter.connectionPressure
          }
        }
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Optimization failed'
      };
    }
  }
}

// Create global enhanced API service
const enhancedApiService = EnhancedApiService.getInstance();

// Extend the window object to include enhanced API
declare global {
  interface Window {
    enhancedApi: EnhancedApiService;
  }
}

if (typeof window !== 'undefined') {
  window.enhancedApi = enhancedApiService;
}

export default enhancedApiService;