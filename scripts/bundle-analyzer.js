#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

/**
 * Enhanced Bundle Analyzer with detailed optimization recommendations
 */
class BundleAnalyzer {
  constructor() {
    this.reportPath = join(projectRoot, 'bundle-analysis-report.json');
    this.htmlReportPath = join(projectRoot, 'bundle-analysis-report.html');
    this.chunks = [];
    this.totalSize = 0;
    this.recommendations = [];
  }

  /**
   * Run build and analyze output
   */
  async analyze() {
    console.log('🔍 Starting Bundle Analysis...\n');
    
    try {
      // Run build
      console.log('📦 Building project...');
      const buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        cwd: projectRoot
      });
      
      // Parse build output
      this.chunks = this.parseBuildOutput(buildOutput);
      this.totalSize = this.chunks.reduce((sum, chunk) => sum + chunk.sizeKB, 0);
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Create reports
      this.generateJsonReport();
      this.generateHtmlReport();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Parse Vite build output
   */
  parseBuildOutput(output) {
    const chunks = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('│') && (line.includes('.js') || line.includes('.css'))) {
        const match = line.match(/^(.*?)│\s*([0-9.]+)\s*kB.*?│\s*gzip:\s*([0-9.]+)\s*kB/);
        if (match) {
          const [, filename, size, gzipSize] = match;
          chunks.push({
            filename: filename.trim(),
            sizeKB: parseFloat(size),
            gzipSizeKB: parseFloat(gzipSize),
            type: this.getChunkType(filename.trim())
          });
        }
      }
    }
    
    return chunks.sort((a, b) => b.sizeKB - a.sizeKB);
  }

  /**
   * Categorize chunk type
   */
  getChunkType(filename) {
    if (filename.includes('index') && filename.includes('.js')) return 'main';
    if (filename.includes('vendor')) return 'vendor';
    if (filename.includes('react')) return 'react';
    if (filename.includes('radix')) return 'ui';
    if (filename.includes('page-')) return 'page';
    if (filename.includes('comp-')) return 'component';
    if (filename.includes('.css')) return 'styles';
    return 'other';
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    this.recommendations = [];
    
    // Check for large main bundle
    const mainChunk = this.chunks.find(chunk => chunk.type === 'main');
    if (mainChunk && mainChunk.sizeKB > 500) {
      this.recommendations.push({
        type: 'critical',
        title: 'Main Bundle Too Large',
        description: `Main bundle is ${mainChunk.sizeKB}KB. Consider implementing more aggressive code splitting.`,
        solutions: [
          'Implement route-based code splitting',
          'Use React.lazy() for heavy components',
          'Move large dependencies to separate chunks'
        ]
      });
    }

    // Check for large vendor chunks
    const vendorChunks = this.chunks.filter(chunk => chunk.type === 'vendor' && chunk.sizeKB > 200);
    if (vendorChunks.length > 0) {
      this.recommendations.push({
        type: 'warning',
        title: 'Large Vendor Chunks',
        description: `Found ${vendorChunks.length} vendor chunks over 200KB.`,
        solutions: [
          'Split vendor libraries into smaller chunks',
          'Use dynamic imports for non-critical libraries',
          'Consider alternative lighter libraries'
        ]
      });
    }

    // Check for duplicate dependencies
    const potentialDuplicates = this.findPotentialDuplicates();
    if (potentialDuplicates.length > 0) {
      this.recommendations.push({
        type: 'info',
        title: 'Potential Duplicate Dependencies',
        description: `Found ${potentialDuplicates.length} potentially duplicate chunks.`,
        solutions: [
          'Review manual chunk configuration',
          'Consolidate similar dependencies',
          'Use bundle analyzer for detailed dependency analysis'
        ]
      });
    }

    // Check total bundle size
    if (this.totalSize > 2000) {
      this.recommendations.push({
        type: 'critical',
        title: 'Total Bundle Size Too Large',
        description: `Total bundle size is ${this.totalSize}KB. This may impact loading performance.`,
        solutions: [
          'Implement lazy loading for non-critical features',
          'Use tree shaking to remove unused code',
          'Consider progressive loading strategies'
        ]
      });
    }

    // Performance recommendations
    this.recommendations.push({
      type: 'info',
      title: 'Performance Optimization',
      description: 'Additional optimizations to consider.',
      solutions: [
        'Enable gzip/brotli compression on server',
        'Implement service worker caching',
        'Use CDN for static assets',
        'Implement preloading for critical routes'
      ]
    });
  }

  /**
   * Find potential duplicate chunks
   */
  findPotentialDuplicates() {
    const duplicates = [];
    const seen = new Set();
    
    for (const chunk of this.chunks) {
      const basename = chunk.filename.split('-')[0];
      if (seen.has(basename)) {
        duplicates.push(chunk);
      } else {
        seen.add(basename);
      }
    }
    
    return duplicates;
  }

  /**
   * Generate JSON report
   */
  generateJsonReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChunks: this.chunks.length,
        totalSizeKB: this.totalSize,
        totalSizeMB: Math.round(this.totalSize / 1024 * 100) / 100,
        averageChunkSizeKB: Math.round(this.totalSize / this.chunks.length * 100) / 100
      },
      chunks: this.chunks,
      recommendations: this.recommendations,
      analysis: {
        largeChunks: this.chunks.filter(chunk => chunk.sizeKB > 300),
        chunksByType: this.groupChunksByType(),
        compressionRatio: this.calculateCompressionRatio()
      }
    };

    writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
  }

  /**
   * Group chunks by type
   */
  groupChunksByType() {
    const grouped = {};
    for (const chunk of this.chunks) {
      if (!grouped[chunk.type]) {
        grouped[chunk.type] = [];
      }
      grouped[chunk.type].push(chunk);
    }
    return grouped;
  }

  /**
   * Calculate compression ratio
   */
  calculateCompressionRatio() {
    const totalGzipSize = this.chunks.reduce((sum, chunk) => sum + chunk.gzipSizeKB, 0);
    return Math.round((totalGzipSize / this.totalSize) * 100 * 100) / 100;
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .card { background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 0 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #6b7280; font-size: 0.9em; }
        .chart-container { position: relative; height: 400px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f9fafb; font-weight: 600; }
        .recommendation { margin: 16px 0; padding: 16px; border-radius: 6px; }
        .recommendation.critical { background: #fef2f2; border-left: 4px solid #ef4444; }
        .recommendation.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .recommendation.info { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .recommendation h4 { margin: 0 0 8px 0; }
        .recommendation ul { margin: 8px 0; padding-left: 20px; }
        .size-bar { height: 20px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .size-bar-fill { height: 100%; background: #3b82f6; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bundle Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="card">
            <h2>Summary</h2>
            <div class="metric">
                <div class="metric-value">${this.chunks.length}</div>
                <div class="metric-label">Total Chunks</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(this.totalSize)}KB</div>
                <div class="metric-label">Total Size</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(this.totalSize / 1024 * 100) / 100}MB</div>
                <div class="metric-label">Total Size (MB)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.calculateCompressionRatio()}%</div>
                <div class="metric-label">Compression Ratio</div>
            </div>
        </div>

        <div class="card">
            <h2>Chunk Size Distribution</h2>
            <div class="chart-container">
                <canvas id="sizeChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h2>Largest Chunks</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Size</th>
                        <th>Gzipped</th>
                        <th>Type</th>
                        <th>Visual</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.chunks.slice(0, 20).map(chunk => `
                        <tr>
                            <td>${chunk.filename}</td>
                            <td>${chunk.sizeKB}KB</td>
                            <td>${chunk.gzipSizeKB}KB</td>
                            <td>${chunk.type}</td>
                            <td>
                                <div class="size-bar">
                                    <div class="size-bar-fill" style="width: ${(chunk.sizeKB / Math.max(...this.chunks.map(c => c.sizeKB))) * 100}%"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Optimization Recommendations</h2>
            ${this.recommendations.map(rec => `
                <div class="recommendation ${rec.type}">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.solutions.map(solution => `<li>${solution}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        // Chart.js visualization
        const ctx = document.getElementById('sizeChart').getContext('2d');
        const chunks = ${JSON.stringify(this.chunks.slice(0, 10))};
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chunks.map(chunk => chunk.filename.split('/').pop().substring(0, 20)),
                datasets: [{
                    label: 'Size (KB)',
                    data: chunks.map(chunk => chunk.sizeKB),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }, {
                    label: 'Gzipped (KB)',
                    data: chunks.map(chunk => chunk.gzipSizeKB),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Size (KB)'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    writeFileSync(this.htmlReportPath, html);
  }

  /**
   * Display results in console
   */
  displayResults() {
    console.log('\n📊 Bundle Analysis Results');
    console.log('===========================\n');
    
    // Summary
    console.log(`📦 Total Chunks: ${this.chunks.length}`);
    console.log(`📏 Total Size: ${Math.round(this.totalSize)}KB (${Math.round(this.totalSize / 1024 * 100) / 100}MB)`);
    console.log(`🗜️  Compression Ratio: ${this.calculateCompressionRatio()}%\n`);
    
    // Large chunks
    const largeChunks = this.chunks.filter(chunk => chunk.sizeKB > 300);
    if (largeChunks.length > 0) {
      console.log('🚨 Large Chunks (>300KB):');
      largeChunks.forEach(chunk => {
        console.log(`  ❌ ${chunk.filename}: ${chunk.sizeKB}KB`);
      });
      console.log();
    }
    
    // Recommendations
    console.log('💡 Key Recommendations:');
    this.recommendations.slice(0, 3).forEach(rec => {
      const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : '💡';
      console.log(`  ${icon} ${rec.title}`);
      console.log(`     ${rec.description}`);
      console.log();
    });
    
    // Reports
    console.log('📄 Reports Generated:');
    console.log(`  📊 JSON Report: ${this.reportPath}`);
    console.log(`  🌐 HTML Report: ${this.htmlReportPath}`);
    console.log();
    
    // Status
    const criticalIssues = this.recommendations.filter(r => r.type === 'critical').length;
    if (criticalIssues > 0) {
      console.log(`⚠️  Found ${criticalIssues} critical optimization issue(s) that need attention.`);
    } else {
      console.log('✅ No critical bundle size issues detected!');
    }
  }
}

// Run the analyzer
const analyzer = new BundleAnalyzer();
analyzer.analyze().catch(console.error);