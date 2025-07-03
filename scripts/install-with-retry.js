#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting pnpm installation with retry logic...');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function killNodeProcesses() {
  console.log('🛑 Stopping any running Node.js processes...');
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /f /im node.exe 2>nul || echo No node processes to kill', { stdio: 'pipe' });
    } else {
      execSync('pkill -f node 2>/dev/null || echo No node processes to kill', { stdio: 'pipe' });
    }
    // Wait a moment for processes to fully terminate
    return true;
  } catch (err) {
    console.log('⚠️  Could not stop processes, continuing...');
    return false;
  }
}

function clearPnpmCache() {
  console.log('🗑️  Clearing pnpm cache...');
  try {
    execSync('pnpm store prune', { stdio: 'inherit' });
    return true;
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
        return true;
      }
    } catch (storeErr) {
      console.log('⚠️  Could not clear pnpm store');
    }
    return false;
  }
}

async function installWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Installation attempt ${attempt}/${maxRetries}...`);
    
    try {
      // Kill processes before each attempt
      killNodeProcesses();
      
      // Wait a moment for file system to settle
      await wait(2000);
      
      // Clear cache on first attempt
      if (attempt === 1) {
        clearPnpmCache();
      }
      
      // Try different installation strategies
      let installCommand;
      if (attempt === 1) {
        installCommand = 'pnpm install';
      } else if (attempt === 2) {
        installCommand = 'pnpm install --force';
      } else {
        installCommand = 'pnpm install --force --no-frozen-lockfile';
      }
      
      console.log(`📦 Running: ${installCommand}`);
      execSync(installCommand, { stdio: 'inherit' });
      
      console.log('✅ Installation completed successfully!');
      return true;
      
    } catch (err) {
      console.log(`❌ Installation attempt ${attempt} failed: ${err.message}`);
      
      if (attempt < maxRetries) {
        console.log('⏳ Waiting before retry...');
        await wait(5000); // Wait 5 seconds before retry
        
        // Clear cache again if we had permission errors
        if (err.message.includes('EACCES') || err.message.includes('permission denied')) {
          console.log('🔧 Clearing cache due to permission error...');
          clearPnpmCache();
          await wait(2000);
        }
      } else {
        console.log('\n❌ All installation attempts failed.');
        console.log('\n💡 Manual steps to try:');
        console.log('1. Close all IDEs, terminals, and applications');
        console.log('2. Restart your computer');
        console.log('3. Try running: pnpm install --force --no-frozen-lockfile');
        console.log('4. If still failing, try: npm install (as fallback)');
        return false;
      }
    }
  }
}

async function main() {
  try {
    const success = await installWithRetry();
    if (success) {
      console.log('\n🎉 Installation completed successfully!');
      console.log('💡 You can now run: make setup');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

main(); 