#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting comprehensive cleanup...');

try {
  // Clean turbo cache and build artifacts
  console.log('📦 Cleaning turbo cache and build artifacts...');
  try {
    execSync('pnpm turbo clean', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  Turbo not available, skipping turbo clean...');
  }
  
  // Remove node_modules from root and all packages
  console.log('🗑️  Removing node_modules...');
  const directories = [
    '.',
    'apps/backend',
    'apps/app',
    'apps/auth', 
    'apps/backoffice',
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
  
  directories.forEach(dir => {
    const nodeModulesPath = path.join(dir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      try {
        // Use rimraf for better cross-platform support
        if (process.platform === 'win32') {
          execSync(`npx rimraf "${nodeModulesPath}"`, { stdio: 'pipe' });
        } else {
          execSync(`rm -rf "${nodeModulesPath}"`, { stdio: 'pipe' });
        }
        console.log(`✅ Removed ${nodeModulesPath}`);
      } catch (err) {
        console.log(`⚠️  Could not remove ${nodeModulesPath} (may be in use): ${err.message}`);
        // Try alternative approach for Windows
        if (process.platform === 'win32') {
          try {
            execSync(`rd /s /q "${nodeModulesPath}"`, { stdio: 'pipe' });
            console.log(`✅ Removed ${nodeModulesPath} using Windows command`);
          } catch (winErr) {
            console.log(`❌ Failed to remove ${nodeModulesPath} even with Windows command`);
          }
        }
      }
    }
  });
  
  // Stop and remove Docker containers and volumes
  console.log('🐳 Stopping Docker containers and removing volumes...');
  try {
    execSync('docker-compose down -v', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  Docker-compose down failed (containers may not be running)');
  }
  
  // Remove any remaining Docker volumes
  try {
    execSync('docker volume prune -f', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  Docker volume prune failed');
  }
  
  // Clean pnpm cache and store
  console.log('🗑️  Cleaning pnpm cache...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  pnpm store prune failed, trying alternative...');
    try {
      execSync('pnpm store path', { stdio: 'pipe' });
      const storePath = execSync('pnpm store path', { encoding: 'utf8' }).trim();
      if (fs.existsSync(storePath)) {
        execSync(`rm -rf "${storePath}"`, { stdio: 'pipe' });
        console.log('✅ Manually cleared pnpm store');
      }
    } catch (storeErr) {
      console.log('⚠️  Could not clear pnpm store');
    }
  }

  // Clean any temporary files
  console.log('🗂️  Cleaning temporary files...');
  const tempFiles = [
    '.turbo',
    'dist',
    'build',
    '.next',
    'coverage',
    'pnpm-lock.yaml'
  ];
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        execSync(`rm -rf "${file}"`, { stdio: 'pipe' });
        console.log(`✅ Removed ${file}`);
      } catch (err) {
        console.log(`⚠️  Could not remove ${file}`);
      }
    }
  });
  
  console.log('🎉 Comprehensive cleanup complete!');
  console.log('💡 Run "pnpm install" to reinstall dependencies');
  console.log('💡 Run "make setup" to start fresh');
  
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
} 