#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting manual cleanup with detailed error handling...');

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Directory doesn't exist: ${dirPath}`);
    return true;
  }

  console.log(`🗑️  Attempting to remove: ${dirPath}`);
  
  try {
    // Try using rimraf first (more reliable on Windows)
    execSync(`npx rimraf "${dirPath}"`, { stdio: 'pipe' });
    console.log(`✅ Successfully removed: ${dirPath}`);
    return true;
  } catch (err) {
    console.log(`⚠️  rimraf failed for ${dirPath}: ${err.message}`);
    
    try {
      // Try platform-specific commands
      if (process.platform === 'win32') {
        execSync(`rd /s /q "${dirPath}"`, { stdio: 'pipe' });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
      }
      console.log(`✅ Successfully removed: ${dirPath}`);
      return true;
    } catch (platformErr) {
      console.log(`❌ Failed to remove ${dirPath}: ${platformErr.message}`);
      return false;
    }
  }
}

try {
  // Clean turbo cache
  console.log('📦 Cleaning turbo cache...');
  try {
    execSync('pnpm turbo clean', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  Turbo not available or clean failed, continuing...');
  }

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

  // Clean pnpm store
  console.log('🗑️  Cleaning pnpm store...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  pnpm store prune failed, trying manual store cleanup...');
    try {
      const storePath = execSync('pnpm store path', { encoding: 'utf8' }).trim();
      console.log(`📁 pnpm store path: ${storePath}`);
      if (fs.existsSync(storePath)) {
        removeDirectory(storePath);
      }
    } catch (storeErr) {
      console.log('⚠️  Could not access pnpm store path');
    }
  }

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

  // Stop Docker
  console.log('🐳 Stopping Docker containers...');
  try {
    execSync('docker-compose down -v', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  Docker-compose down failed');
  }

  if (failedRemovals.length > 0) {
    console.log('\n❌ Some directories could not be removed:');
    failedRemovals.forEach(dir => console.log(`  - ${dir}`));
    console.log('\n💡 Manual steps you can try:');
    console.log('1. Close any IDEs or terminals that might be using these directories');
    console.log('2. Restart your terminal/command prompt');
    console.log('3. Run this script again');
    console.log('4. If still failing, try restarting your computer');
  } else {
    console.log('\n✅ Manual cleanup completed successfully!');
  }

  console.log('\n💡 Next steps:');
  console.log('1. Run "pnpm install" to reinstall dependencies');
  console.log('2. Run "make setup" to start fresh');

} catch (error) {
  console.error('❌ Error during manual cleanup:', error.message);
  process.exit(1);
} 