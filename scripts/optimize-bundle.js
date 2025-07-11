#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Bundle optimization script
 * This script helps optimize the bundle size by analyzing chunks and suggesting optimizations
 */

const CHUNK_SIZE_LIMIT = 300; // KB
const RECOMMENDED_CHUNK_SIZE = 200; // KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuildOutput(buildOutput) {
  const chunks = [];
  const lines = buildOutput.split('\n');
  
  for (const line of lines) {
    if (line.includes('│') && (line.includes('.js') || line.includes('.css'))) {
      const parts = line.split('│');
      if (parts.length >= 2) {
        const filename = parts[0].trim();
        const sizeMatch = parts[1].match(/([0-9.]+)\s*kB/);
        if (sizeMatch) {
          const size = parseFloat(sizeMatch[1]);
          chunks.push({ filename, size });
        }
      }
    }
  }
  
  return chunks;
}

function generateOptimizationReport(chunks) {
  const largeChunks = chunks.filter(chunk => chunk.size > CHUNK_SIZE_LIMIT);
  const mediumChunks = chunks.filter(chunk => chunk.size > RECOMMENDED_CHUNK_SIZE && chunk.size <= CHUNK_SIZE_LIMIT);
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  
  console.log('\n🔍 Bundle Analysis Report');
  console.log('========================\n');
  
  console.log(`📊 Total Bundle Size: ${formatBytes(totalSize * 1024)}`);
  console.log(`📦 Total Chunks: ${chunks.length}\n`);
  
  if (largeChunks.length > 0) {
    console.log('🚨 Large Chunks (> 300KB):');
    largeChunks.forEach(chunk => {
      console.log(`  ❌ ${chunk.filename}: ${chunk.size} KB`);
    });
    console.log();
  }
  
  if (mediumChunks.length > 0) {
    console.log('⚠️  Medium Chunks (200-300KB):');
    mediumChunks.forEach(chunk => {
      console.log(`  ⚡ ${chunk.filename}: ${chunk.size} KB`);
    });
    console.log();
  }
  
  // Optimization suggestions
  console.log('💡 Optimization Suggestions:');
  console.log('============================\n');
  
  if (largeChunks.some(chunk => chunk.filename.includes('index'))) {
    console.log('🔧 Main Bundle Optimization:');
    console.log('  - Implement route-based code splitting');
    console.log('  - Use React.lazy() for page components');
    console.log('  - Consider moving large libraries to separate chunks\n');
  }
  
  if (largeChunks.some(chunk => chunk.filename.includes('UserManagement'))) {
    console.log('🔧 User Management Optimization:');
    console.log('  - Split user management into smaller components');
    console.log('  - Use dynamic imports for heavy features');
    console.log('  - Consider lazy loading permission components\n');
  }
  
  if (largeChunks.some(chunk => chunk.filename.includes('SalesReport'))) {
    console.log('🔧 Sales Report Optimization:');
    console.log('  - Implement component-level code splitting');
    console.log('  - Use React.lazy() for report sections');
    console.log('  - Consider lazy loading chart components\n');
  }
  
  console.log('✅ General Recommendations:');
  console.log('  - Enable gzip compression on your server');
  console.log('  - Implement service worker for caching');
  console.log('  - Use bundle analyzer for detailed analysis');
  console.log('  - Consider using Web Workers for heavy computations\n');
  
  return { largeChunks, mediumChunks, totalSize };
}

function generateWebpackBundleAnalyzer() {
  console.log('📊 Generating bundle analyzer report...');
  try {
    execSync('npx vite-bundle-analyzer dist --analyze', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Bundle analyzer not available. Install with: npm install -g vite-bundle-analyzer');
  }
}

function main() {
  console.log('🚀 Starting bundle optimization analysis...\n');
  
  try {
    // Run build and capture output
    console.log('📦 Building project...');
    const buildOutput = execSync('npm run build', { encoding: 'utf8' });
    console.log('✅ Build completed successfully!\n');
    
    // Analyze the build output
    const chunks = analyzeBuildOutput(buildOutput);
    const analysis = generateOptimizationReport(chunks);
    
    // Generate optimization report
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: analysis.totalSize,
      chunksCount: chunks.length,
      largeChunks: analysis.largeChunks,
      mediumChunks: analysis.mediumChunks,
      optimization: {
        needsAttention: analysis.largeChunks.length > 0,
        suggestions: [
          'Implement route-based code splitting',
          'Use React.lazy() for heavy components',
          'Consider moving large libraries to separate chunks',
          'Enable gzip compression',
          'Implement service worker caching'
        ]
      }
    };
    
    // Save report
    writeFileSync('bundle-optimization-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Report saved to bundle-optimization-report.json\n');
    
    // Show final status
    if (analysis.largeChunks.length === 0) {
      console.log('🎉 All chunks are within optimal size limits!');
    } else {
      console.log(`⚠️  ${analysis.largeChunks.length} chunk(s) need optimization.`);
    }
    
  } catch (error) {
    console.error('❌ Error during bundle analysis:', error.message);
    process.exit(1);
  }
}

// Run the analysis
main();