#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing esbuild permission issues...');

function removeEsbuildDirectories() {
  const esbuildPatterns = [
    'node_modules/.pnpm/esbuild-*',
    'node_modules/.pnpm/@esbuild-*',
    'node_modules/esbuild-*',
    'node_modules/@esbuild-*'
  ];

  console.log('🗑️  Removing esbuild-related directories...');
  
  esbuildPatterns.forEach(pattern => {
    try {
      if (process.platform === 'win32') {
        // Use Windows dir command to find matching directories
        const result = execSync(`dir /b /s "${pattern}" 2>nul`, { encoding: 'utf8' });
        const dirs = result.split('\n').filter(line => line.trim());
        
        dirs.forEach(dir => {
          if (fs.existsSync(dir)) {
            console.log(`Removing: ${dir}`);
            try {
              execSync(`rd /s /q "${dir}"`, { stdio: 'pipe' });
            } catch (err) {
              console.log(`⚠️  Could not remove ${dir}`);
            }
          }
        });
      } else {
        // Use find command on Unix systems
        execSync(`find . -path "${pattern}" -type d -exec rm -rf {} + 2>/dev/null || true`, { stdio: 'pipe' });
      }
    } catch (err) {
      // Pattern not found, continue
    }
  });
}

function clearPnpmCache() {
  console.log('🗑️  Clearing pnpm cache...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
  } catch (err) {
    console.log('⚠️  pnpm store prune failed, trying manual cleanup...');
    try {
      const storePath = execSync('pnpm store path', { encoding: 'utf8' }).trim();
      if (fs.existsSync(storePath)) {
        if (process.platform === 'win32') {
          execSync(`rd /s /q "${storePath}"`, { stdio: 'pipe' });
        } else {
          execSync(`rm -rf "${storePath}"`, { stdio: 'pipe' });
        }
        console.log('✅ Manually cleared pnpm store');
      }
    } catch (storeErr) {
      console.log('⚠️  Could not clear pnpm store');
    }
  }
}

function killNodeProcesses() {
  console.log('🛑 Stopping Node.js processes...');
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /f /im node.exe 2>nul || echo No node processes to kill', { stdio: 'pipe' });
    } else {
      execSync('pkill -f node 2>/dev/null || echo No node processes to kill', { stdio: 'pipe' });
    }
  } catch (err) {
    console.log('⚠️  Could not stop processes');
  }
}

try {
  // Kill any running processes
  killNodeProcesses();
  
  // Remove esbuild directories
  removeEsbuildDirectories();
  
  // Clear pnpm cache
  clearPnpmCache();
  
  console.log('✅ Esbuild permission fix completed!');
  console.log('💡 Now try: pnpm install --force');
  
} catch (error) {
  console.error('❌ Error during esbuild fix:', error.message);
  process.exit(1);
} 