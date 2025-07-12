// Deployment Configuration and Utilities
export const deploymentConfig = {
  // EasySite Platform Configuration
  platform: {
    projectName: 'DFS Manager Portal',
    projectToken: 'z20jntw7fp3a',
    deploymentTarget: 'easysite',
    baseUrl: import.meta.env.VITE_EASYSITE_BASE_URL || 'https://ezsite.ai'
  },

  // Check if we're in production
  isProduction: import.meta.env.PROD,

  // App configuration
  appName: import.meta.env.VITE_APP_NAME || 'DFS Manager Portal',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnvironment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',

  // Feature flags
  features: {
    fileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD !== 'false',
    smsAlerts: import.meta.env.VITE_ENABLE_SMS_ALERTS !== 'false',
    auditLogging: import.meta.env.VITE_ENABLE_AUDIT_LOGGING !== 'false',
    visualEditing: import.meta.env.VITE_ENABLE_VISUAL_EDITING !== 'false',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false',
    performanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false'
  },

  // Security settings
  security: {
    sessionTimeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '240'),
    enableMFA: import.meta.env.VITE_ENABLE_MFA === 'true',
    maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '3')
  },

  // Performance settings
  performance: {
    apiTimeoutMs: parseInt(import.meta.env.VITE_API_TIMEOUT_MS || '10000'),
    maxRetryAttempts: parseInt(import.meta.env.VITE_MAX_RETRY_ATTEMPTS || '2'),
    enableApiCaching: import.meta.env.VITE_ENABLE_API_CACHING !== 'false',
    cacheDurationMinutes: parseInt(import.meta.env.VITE_CACHE_DURATION_MINUTES || '60')
  },

  // Business configuration
  business: {
    defaultStation: import.meta.env.VITE_DEFAULT_STATION || 'MOBIL',
    currencyCode: import.meta.env.VITE_CURRENCY_CODE || 'USD',
    taxRatePercentage: parseFloat(import.meta.env.VITE_TAX_RATE_PERCENTAGE || '8.25'),
    lowStockThreshold: parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10'),
    criticalStockThreshold: parseInt(import.meta.env.VITE_CRITICAL_STOCK_THRESHOLD || '5')
  },

  // File upload settings
  fileUpload: {
    maxFileSizeMB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '10'),
    autoCompressImages: import.meta.env.VITE_AUTO_COMPRESS_IMAGES !== 'false',
    imageCompressionQuality: parseFloat(import.meta.env.VITE_IMAGE_COMPRESSION_QUALITY || '0.8')
  },

  // External services
  external: {
    clickSend: {
      username: import.meta.env.VITE_CLICKSEND_USERNAME || '',
      apiKey: import.meta.env.VITE_CLICKSEND_API_KEY || '',
      rateLimitPerHour: parseInt(import.meta.env.VITE_SMS_RATE_LIMIT_PER_HOUR || '100')
    },
    email: {
      fromAddress: import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'noreply@dfs-manager.com',
      replyToAddress: import.meta.env.VITE_EMAIL_REPLY_TO_ADDRESS || 'support@dfs-manager.com'
    }
  },

  // Development settings
  development: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'error',
    enableMemoryLeakDetection: import.meta.env.VITE_ENABLE_MEMORY_LEAK_DETECTION !== 'false'
  }
};

// EasySite platform deployment checker
export const checkEasySitePlatformReadiness = () => {
  const checks = {
    projectName: !!deploymentConfig.platform.projectName,
    projectToken: !!deploymentConfig.platform.projectToken,
    apis: typeof window !== 'undefined' && !!window.ezsite?.apis,
    authentication: typeof window !== 'undefined' && !!window.ezsite?.apis?.login,
    database: typeof window !== 'undefined' && !!window.ezsite?.apis?.tablePage,
    fileUpload: typeof window !== 'undefined' && !!window.ezsite?.apis?.upload,
    runtime: true // If we're running, runtime is working
  };

  const allReady = Object.values(checks).every(Boolean);

  return {
    checks,
    allReady,
    readinessScore: Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100,
    platform: 'EasySite',
    projectInfo: {
      name: deploymentConfig.platform.projectName,
      token: deploymentConfig.platform.projectToken
    }
  };
};

// Legacy deployment readiness checker (for compatibility)
export const checkDeploymentReadiness = () => {
  return checkEasySitePlatformReadiness();
};

// Utility to log deployment info
export const logDeploymentInfo = () => {
  if (deploymentConfig.development.debugMode) {
    console.group('🚀 DFS Manager Portal - EasySite Deployment Info');
    console.log('Platform:', 'EasySite');
    console.log('Project Name:', deploymentConfig.platform.projectName);
    console.log('Project Token:', deploymentConfig.platform.projectToken);
    console.log('App Name:', deploymentConfig.appName);
    console.log('Version:', deploymentConfig.appVersion);
    console.log('Environment:', deploymentConfig.appEnvironment);
    console.log('Production Build:', deploymentConfig.isProduction);
    console.log('Features:', deploymentConfig.features);
    console.log('Platform Readiness:', checkEasySitePlatformReadiness());
    console.groupEnd();
  }
};

// EasySite platform initialization
export const initializeEasySitePlatform = () => {
  if (typeof window !== 'undefined') {
    // Log platform info
    logDeploymentInfo();

    // Check platform readiness
    const readiness = checkEasySitePlatformReadiness();

    if (readiness.allReady) {
      console.log('✅ EasySite Platform Ready - DFS Manager Portal');
    } else {
      console.warn('⚠️ EasySite Platform Not Fully Ready:', readiness.checks);
    }

    return readiness;
  }

  return null;
};

export default deploymentConfig;