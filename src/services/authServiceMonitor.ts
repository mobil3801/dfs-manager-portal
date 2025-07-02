// Authentication Service Monitor with automatic recovery
class AuthServiceMonitor {
  private static instance: AuthServiceMonitor;
  private isMonitoring: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private recoveryAttempts: number = 0;
  private maxRecoveryAttempts: number = 5;
  private baseRetryDelay: number = 1000; // 1 second
  private listeners: Array<(status: ServiceStatus) => void> = [];
  private lastHealthCheck: Date = new Date();
  private consecutiveFailures: number = 0;
  private maxConsecutiveFailures: number = 3;

  public static getInstance(): AuthServiceMonitor {
    if (!AuthServiceMonitor.instance) {
      AuthServiceMonitor.instance = new AuthServiceMonitor();
    }
    return AuthServiceMonitor.instance;
  }

  public addStatusListener(callback: (status: ServiceStatus) => void): void {
    this.listeners.push(callback);
  }

  public removeStatusListener(callback: (status: ServiceStatus) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(status: ServiceStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in auth service status listener:', error);
      }
    });
  }

  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('🔍 Auth service monitoring already active');
      return;
    }

    console.log('🚀 Starting authentication service monitoring...');
    this.isMonitoring = true;
    this.recoveryAttempts = 0;
    this.consecutiveFailures = 0;

    // Initial health check
    await this.performHealthCheck();

    // Set up continuous monitoring
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 10000); // Check every 10 seconds

    console.log('✅ Authentication service monitoring started');
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('⏹️ Stopping authentication service monitoring...');
    this.isMonitoring = false;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    console.log('✅ Authentication service monitoring stopped');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      const status = await this.checkServiceHealth();
      const responseTime = Date.now() - startTime;

      this.lastHealthCheck = new Date();

      if (status.isHealthy) {
        this.consecutiveFailures = 0;
        this.recoveryAttempts = 0;
        
        this.notifyListeners({
          ...status,
          responseTime,
          lastCheck: this.lastHealthCheck,
          consecutiveFailures: this.consecutiveFailures
        });
      } else {
        this.consecutiveFailures++;
        console.warn(`⚠️ Auth service health check failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}):`, status.error);

        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
          console.error('🚨 Multiple consecutive auth service failures detected, attempting recovery...');
          await this.attemptServiceRecovery();
        }

        this.notifyListeners({
          ...status,
          responseTime,
          lastCheck: this.lastHealthCheck,
          consecutiveFailures: this.consecutiveFailures
        });
      }
    } catch (error) {
      console.error('❌ Health check error:', error);
      this.consecutiveFailures++;
      
      this.notifyListeners({
        isHealthy: false,
        error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: 0,
        lastCheck: this.lastHealthCheck,
        consecutiveFailures: this.consecutiveFailures
      });
    }
  }

  private async checkServiceHealth(): Promise<{ isHealthy: boolean; error?: string; details?: any }> {
    try {
      // Check if ezsite APIs are available
      if (!window.ezsite?.apis) {
        return {
          isHealthy: false,
          error: 'EZSite APIs not available'
        };
      }

      // Test a simple API call to verify service is responsive
      const testResponse = await Promise.race([
        window.ezsite.apis.getUserInfo(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        )
      ]) as any;

      // The getUserInfo call should either return user data or an auth error
      // Both are valid responses that indicate the service is working
      return {
        isHealthy: true,
        details: {
          hasUserData: !!testResponse.data,
          apiError: testResponse.error || null
        }
      };

    } catch (error) {
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown health check error'
      };
    }
  }

  private async attemptServiceRecovery(): Promise<void> {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.error('🚨 Maximum recovery attempts exceeded, service may be permanently unavailable');
      return;
    }

    this.recoveryAttempts++;
    const delay = this.baseRetryDelay * Math.pow(2, this.recoveryAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting service recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})...`);

    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));

      // Attempt to reinitialize the service
      await this.reinitializeAuthService();

      // Verify recovery was successful
      const healthCheck = await this.checkServiceHealth();
      if (healthCheck.isHealthy) {
        console.log('✅ Authentication service recovery successful');
        this.consecutiveFailures = 0;
        this.recoveryAttempts = 0;
      } else {
        console.warn('⚠️ Recovery attempt did not restore service health');
      }

    } catch (error) {
      console.error(`❌ Recovery attempt ${this.recoveryAttempts} failed:`, error);
    }
  }

  private async reinitializeAuthService(): Promise<void> {
    console.log('🔄 Reinitializing authentication service...');

    // Wait for APIs to become available again
    let attempts = 0;
    const maxAttempts = 30;

    while (!window.ezsite?.apis && attempts < maxAttempts) {
      console.log(`⏳ Waiting for EZSite APIs to become available... (${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!window.ezsite?.apis) {
      throw new Error('Failed to reinitialize: EZSite APIs still not available');
    }

    console.log('✅ EZSite APIs are now available');
  }

  public getServiceStatus(): ServiceStatus | null {
    if (!this.isMonitoring) return null;

    return {
      isHealthy: this.consecutiveFailures === 0,
      error: this.consecutiveFailures > 0 ? `${this.consecutiveFailures} consecutive failures` : undefined,
      responseTime: 0,
      lastCheck: this.lastHealthCheck,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  public async forceServiceCheck(): Promise<ServiceStatus> {
    const startTime = Date.now();
    const status = await this.checkServiceHealth();
    const responseTime = Date.now() - startTime;

    return {
      ...status,
      responseTime,
      lastCheck: new Date(),
      consecutiveFailures: this.consecutiveFailures
    };
  }
}

export interface ServiceStatus {
  isHealthy: boolean;
  error?: string;
  responseTime: number;
  lastCheck: Date;
  consecutiveFailures: number;
  details?: any;
}

export const authServiceMonitor = AuthServiceMonitor.getInstance();
export default authServiceMonitor;
