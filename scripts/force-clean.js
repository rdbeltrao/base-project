#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting force cleanup (handles permission errors)...');

function forceRemoveDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Directory doesn't exist: ${dirPath}`);
    return true;
  }

  console.log(`🗑️  Force removing: ${dirPath}`);
  
  try {
    // Try multiple approaches for Windows/WSL
    if (process.platform === 'win32') {
      // Try Windows commands first
      try {
        execSync(`rd /s /q "${dirPath}"`, { stdio: 'pipe' });
        console.log(`✅ Removed with Windows command: ${dirPath}`);
        return true;
      } catch (err) {
        console.log(`⚠️  Windows command failed, trying alternative...`);
      }
      
      // Try with force flag
      try {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'pipe' });
        console.log(`✅ Removed with rmdir: ${dirPath}`);
        return true;
      } catch (err) {
        console.log(`⚠️  rmdir failed, trying rimraf...`);
      }
    }
    
    // Try rimraf (handles permission issues better)
    try {
      execSync(`npx rimraf "${dirPath}"`, { stdio: 'pipe' });
      console.log(`✅ Removed with rimraf: ${dirPath}`);
      return true;
    } catch (err) {
      console.log(`⚠️  rimraf failed: ${err.message}`);
    }
    
    // Try Unix command as last resort
    try {
      execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
      console.log(`✅ Removed with rm -rf: ${dirPath}`);
      return true;
    } catch (err) {
      console.log(`❌ All removal methods failed for ${dirPath}: ${err.message}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Failed to remove ${dirPath}: ${err.message}`);
    return false;
  }
}

function removeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return true;
  }

  console.log(`🗑️  Removing file: ${filePath}`);
  
  try {
    if (process.platform === 'win32') {
      execSync(`del /f /q "${filePath}"`, { stdio: 'pipe' });
    } else {
      execSync(`rm -f "${filePath}"`, { stdio: 'pipe' });
    }
    console.log(`✅ Removed file: ${filePath}`);
    return true;
  } catch (err) {
    console.log(`❌ Failed to remove file ${filePath}: ${err.message}`);
    return false;
  }
}

try {
  // Stop any running processes that might lock files
  console.log('🛑 Stopping potential file-locking processes...');
  try {
    if (process.platform === 'win32') {
      // Kill any node processes that might be locking files
      execSync('taskkill /f /im node.exe 2>nul || echo No node processes to kill', { stdio: 'pipe' });
    } else {
      // Kill any node processes that might be locking files
      execSync('pkill -f node 2>/dev/null || echo No node processes to kill', { stdio: 'pipe' });
    }
  } catch (err) {
    console.log('⚠️  Could not stop processes, continuing...');
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
    if (!forceRemoveDirectory(nodeModulesPath)) {
      failedRemovals.push(nodeModulesPath);
    }
  });

  // Clean temporary files
  const tempFiles = [
    '.turbo',
    'dist',
    'build',
    '.next',
    'coverage'
  ];

  tempFiles.forEach(file => {
    forceRemoveDirectory(file);
  });

  // Remove lock files
  const lockFiles = [
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock'
  ];

  lockFiles.forEach(file => {
    removeFile(file);
  });

  // Try to clean pnpm store with force
  console.log('🗑️  Force cleaning pnpm store...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  pnpm store prune failed, trying manual store cleanup...');
    try {
      const storePath = execSync('pnpm store path', { encoding: 'utf8' }).trim();
      console.log(`📁 pnpm store path: ${storePath}`);
      if (fs.existsSync(storePath)) {
        forceRemoveDirectory(storePath);
      }
    } catch (storeErr) {
      console.log('⚠️  Could not access pnpm store path');
    }
  }

  // Stop Docker containers
  console.log('🐳 Stopping Docker containers...');
  try {
    execSync('docker-compose down -v', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  Docker-compose down failed');
  }

  if (failedRemovals.length > 0) {
    console.log('\n❌ Some directories could not be removed:');
    failedRemovals.forEach(dir => console.log(`  - ${dir}`));
    console.log('\n💡 Manual steps to try:');
    console.log('1. Close all IDEs, terminals, and any applications using this project');
    console.log('2. Restart your computer');
    console.log('3. Try running this script again');
    console.log('4. If still failing, manually delete the directories in File Explorer');
  } else {
    console.log('\n✅ Force cleanup completed successfully!');
  }

  console.log('\n💡 Next steps:');
  console.log('1. Run "pnpm install" to reinstall dependencies');
  console.log('2. If installation fails, try "pnpm install --force"');

} catch (error) {
  console.error('❌ Error during force cleanup:', error.message);
  process.exit(1);
} 