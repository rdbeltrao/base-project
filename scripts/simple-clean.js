#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting simple cleanup (no turbo dependency)...');

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Directory doesn't exist: ${dirPath}`);
    return true;
  }

  console.log(`🗑️  Removing: ${dirPath}`);
  
  try {
    if (process.platform === 'win32') {
      execSync(`rd /s /q "${dirPath}"`, { stdio: 'pipe' });
    } else {
      execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
    }
    console.log(`✅ Removed: ${dirPath}`);
    return true;
  } catch (err) {
    console.log(`❌ Failed to remove ${dirPath}: ${err.message}`);
    return false;
  }
}

try {
  // Remove node_modules from all directories
  const directories = [
    '.',
    'apps/backend',
    'apps/app',
    'apps/auth', 
    'apps/backoffice',
    'apps/site',
    'packages/auth-shared',
    'packages/database',
    'packages/eslint-config',
    'packages/feature-flags',
    'packages/prettier-config',
    'packages/tailwind-config',
    'packages/ts-config',
    'packages/ui',
    'packages/utils'
  ];

  let failedRemovals = [];
  
  directories.forEach(dir => {
    const nodeModulesPath = path.join(dir, 'node_modules');
    if (!removeDirectory(nodeModulesPath)) {
      failedRemovals.push(nodeModulesPath);
    }
  });

  // Clean temporary files
  const tempFiles = [
    '.turbo',
    'dist',
    'build',
    '.next',
    'coverage',
    'pnpm-lock.yaml'
  ];

  tempFiles.forEach(file => {
    removeDirectory(file);
  });

  // Try to clean pnpm store
  console.log('🗑️  Cleaning pnpm store...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  pnpm store prune failed, continuing...');
  }

  if (failedRemovals.length > 0) {
    console.log('\n❌ Some directories could not be removed:');
    failedRemovals.forEach(dir => console.log(`  - ${dir}`));
  } else {
    console.log('\n✅ Simple cleanup completed successfully!');
  }

  console.log('\n💡 Next steps:');
  console.log('1. Run "pnpm install" to reinstall dependencies');

} catch (error) {
  console.error('❌ Error during simple cleanup:', error.message);
  process.exit(1);
} 