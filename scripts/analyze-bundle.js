#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple bundle analyzer to check chunk sizes
function analyzeBundleSize() {
  const distPath = path.join(__dirname, '..', 'dist', 'assets');

  if (!fs.existsSync(distPath)) {
    console.log('❌ No dist/assets directory found. Please run "npm run build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(distPath);
  const chunks = [];

  files.forEach((file) => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeInKB = Math.round(stats.size / 1024);

    if (file.endsWith('.js')) {
      chunks.push({ file, size: sizeInKB, type: 'JavaScript' });
    } else if (file.endsWith('.css')) {
      chunks.push({ file, size: sizeInKB, type: 'CSS' });
    }
  });

  chunks.sort((a, b) => b.size - a.size);

  console.log('📊 Bundle Analysis Report\n');
  console.log('File\t\t\t\tSize\tType');
  console.log('─'.repeat(60));

  chunks.forEach((chunk) => {
    const fileName = chunk.file.length > 30 ? chunk.file.substring(0, 27) + '...' : chunk.file;
    const sizeStr = chunk.size > 500 ? `🔴 ${chunk.size}KB` : chunk.size > 250 ? `🟡 ${chunk.size}KB` : `🟢 ${chunk.size}KB`;
    console.log(`${fileName.padEnd(32)}\t${sizeStr}\t${chunk.type}`);
  });

  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const jsSize = chunks.filter((c) => c.type === 'JavaScript').reduce((sum, chunk) => sum + chunk.size, 0);
  const cssSize = chunks.filter((c) => c.type === 'CSS').reduce((sum, chunk) => sum + chunk.size, 0);

  console.log('\n📈 Summary:');
  console.log(`Total Size: ${totalSize}KB`);
  console.log(`JavaScript: ${jsSize}KB`);
  console.log(`CSS: ${cssSize}KB`);

  const largeChunks = chunks.filter((c) => c.size > 500);
  if (largeChunks.length > 0) {
    console.log(`\n⚠️  Large Chunks (>500KB): ${largeChunks.length}`);
    largeChunks.forEach((chunk) => {
      console.log(`  - ${chunk.file}: ${chunk.size}KB`);
    });
  }

  console.log('\n🎯 Performance Recommendations:');
  if (jsSize > 1000) {
    console.log('  - Consider further code splitting for JavaScript bundles');
  }
  if (largeChunks.length > 0) {
    console.log('  - Break down large chunks using dynamic imports');
  }
  console.log('  - Use compression (gzip/brotli) on your server');
  console.log('  - Consider using a CDN for static assets');
}

analyzeBundleSize();