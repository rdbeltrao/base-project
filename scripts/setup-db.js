#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🗄️  Setting up database...');

try {
  // Change to database package directory
  const dbPath = path.join(__dirname, '..', 'packages', 'database');
  process.chdir(dbPath);
  
  console.log('📊 Running database migrations...');
  execSync('pnpm migrate:up', { stdio: 'inherit' });
  
  console.log('🌱 Running database seeds...');
  execSync('pnpm seed:all', { stdio: 'inherit' });
  
  console.log('✅ Database setup complete!');
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.error('   Make sure the database is running and accessible');
  console.error('   Check your .env file configuration');
  process.exit(1);
} 