/**
 * Bundle Optimization Utilities
 * Tools for optimizing bundle size and performance
 */

export interface BundleMetrics {
  bundleSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  recommendations: string[];
}

export interface OptimizationResult {
  before: BundleMetrics;
  after: BundleMetrics;
  improvements: {
    sizeSaved: number;
    percentageReduction: number;
    loadTimeImprovement: number;
  };
}

/**
 * Analyze current bundle metrics
 */
export const analyzeBundleMetrics = async (): Promise<BundleMetrics> => {
  // In a real implementation, this would analyze the actual build output
  // For now, we'll use the data from your build output
  
  const totalSize = 1200; // Approximate total size in KB
  const gzippedSize = 350; // Approximate gzipped size in KB
  
  return {
    bundleSize: totalSize,
    gzippedSize: gzippedSize,
    chunkCount: 85,
    largestChunks: [
      { name: 'index-SAuXO1wW.js', size: 475, percentage: 39.6 },
      { name: 'proxy-BMcXcMsq.js', size: 112, percentage: 9.3 },
      { name: 'UserManagement-DqnqESgn.js', size: 108, percentage: 9.0 },
      { name: 'SalesReportForm-m41HUJ7-.js', size: 99, percentage: 8.3 },
      { name: 'OverflowTestingPage-DS_wpYeH.js', size: 84, percentage: 7.0 }
    ],
    recommendations: [
      'Split the main bundle (475KB) into smaller chunks',
      'Optimize CSS bundle size (105KB)',
      'Implement better tree shaking for vendor libraries',
      'Use dynamic imports for rarely accessed features',
      'Consider removing unused dependencies'
    ]
  };
};

/**
 * Calculate load time impact
 */
export const calculateLoadTimeImpact = (bundleSize: number, connection: 'fast' | 'slow' = 'fast'): number => {
  // Simplified calculation based on typical connection speeds
  const speeds = {
    fast: 1000, // KB/s (typical 4G)
    slow: 200   // KB/s (typical 3G)
  };
  
  return bundleSize / speeds[connection];
};

/**
 * Generate optimization suggestions
 */
export const generateOptimizationSuggestions = (metrics: BundleMetrics): string[] => {
  const suggestions: string[] = [];
  
  // Main bundle size check
  if (metrics.bundleSize > 300) {
    suggestions.push('Consider splitting your main bundle - current size exceeds recommended 300KB limit');
  }
  
  // Large chunk detection
  const largeChunks = metrics.largestChunks.filter(chunk => chunk.size > 100);
  if (largeChunks.length > 0) {
    suggestions.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`);
  }
  
  // Compression ratio check
  const compressionRatio = metrics.gzippedSize / metrics.bundleSize;
  if (compressionRatio > 0.35) {
    suggestions.push('Poor compression ratio - consider optimizing assets and removing redundant code');
  }
  
  // Chunk count optimization
  if (metrics.chunkCount > 100) {
    suggestions.push('Too many chunks may hurt performance - consider consolidating smaller chunks');
  } else if (metrics.chunkCount < 10) {
    suggestions.push('Consider more aggressive code splitting for better caching');
  }
  
  return suggestions;
};

/**
 * Estimate optimization potential
 */
export const estimateOptimizationPotential = (metrics: BundleMetrics): OptimizationResult => {
  // Conservative estimates based on common optimization techniques
  const treeshakingReduction = 0.15; // 15% reduction from tree shaking
  const codeSpittingReduction = 0.10; // 10% reduction from better code splitting
  const assetOptimizationReduction = 0.08; // 8% reduction from asset optimization
  
  const totalReduction = treeshakingReduction + codeSpittingReduction + assetOptimizationReduction;
  const newSize = metrics.bundleSize * (1 - totalReduction);
  const newGzippedSize = metrics.gzippedSize * (1 - totalReduction * 0.8); // Gzipped benefits less
  
  const beforeLoadTime = calculateLoadTimeImpact(metrics.bundleSize);
  const afterLoadTime = calculateLoadTimeImpact(newSize);
  
  return {
    before: metrics,
    after: {
      ...metrics,
      bundleSize: newSize,
      gzippedSize: newGzippedSize,
      recommendations: ['Bundle optimized!', 'Performance improved', 'Load times reduced']
    },
    improvements: {
      sizeSaved: metrics.bundleSize - newSize,
      percentageReduction: totalReduction * 100,
      loadTimeImprovement: ((beforeLoadTime - afterLoadTime) / beforeLoadTime) * 100
    }
  };
};

/**
 * Bundle size categories and their recommendations
 */
export const getBundleSizeCategory = (sizeKB: number): {
  category: 'excellent' | 'good' | 'warning' | 'critical';
  color: string;
  recommendation: string;
} => {
  if (sizeKB <= 100) {
    return {
      category: 'excellent',
      color: 'green',
      recommendation: 'Excellent bundle size! Your app will load very quickly.'
    };
  } else if (sizeKB <= 250) {
    return {
      category: 'good',
      color: 'blue',
      recommendation: 'Good bundle size. Consider minor optimizations for even better performance.'
    };
  } else if (sizeKB <= 500) {
    return {
      category: 'warning',
      color: 'yellow',
      recommendation: 'Bundle size is getting large. Consider code splitting and optimization.'
    };
  } else {
    return {
      category: 'critical',
      color: 'red',
      recommendation: 'Bundle size is too large! Immediate optimization required for good user experience.'
    };
  }
};

/**
 * Performance budget checker
 */
export const checkPerformanceBudget = (metrics: BundleMetrics) => {
  const budgets = {
    totalBundle: 300, // KB
    mainChunk: 150,   // KB
    vendorChunk: 200, // KB
    cssBundle: 50     // KB
  };
  
  const violations: string[] = [];
  
  if (metrics.bundleSize > budgets.totalBundle) {
    violations.push(`Total bundle (${metrics.bundleSize}KB) exceeds budget (${budgets.totalBundle}KB)`);
  }
  
  const mainChunk = metrics.largestChunks.find(chunk => chunk.name.includes('index'));
  if (mainChunk && mainChunk.size > budgets.mainChunk) {
    violations.push(`Main chunk (${mainChunk.size}KB) exceeds budget (${budgets.mainChunk}KB)`);
  }
  
  return {
    passed: violations.length === 0,
    violations,
    score: Math.max(0, 100 - (violations.length * 20))
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (sizeKB: number): string => {
  if (sizeKB >= 1024) {
    return `${(sizeKB / 1024).toFixed(1)}MB`;
  }
  return `${Math.round(sizeKB)}KB`;
};

/**
 * Calculate compression efficiency
 */
export const calculateCompressionEfficiency = (original: number, compressed: number): number => {
  return ((original - compressed) / original) * 100;
};

export default {
  analyzeBundleMetrics,
  calculateLoadTimeImpact,
  generateOptimizationSuggestions,
  estimateOptimizationPotential,
  getBundleSizeCategory,
  checkPerformanceBudget,
  formatFileSize,
  calculateCompressionEfficiency
};