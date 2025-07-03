#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🐳 Checking Docker status...');

try {
  // Check if Docker is running
  execSync('docker info', { stdio: 'pipe' });
  console.log('✅ Docker is running');
  
  // Check if docker-compose is available
  try {
    execSync('docker-compose --version', { stdio: 'pipe' });
    console.log('✅ Docker Compose is available');
  } catch (err) {
    console.log('⚠️  Docker Compose not found, trying "docker compose" (newer version)...');
    try {
      execSync('docker compose version', { stdio: 'pipe' });
      console.log('✅ Docker Compose (newer version) is available');
    } catch (err2) {
      console.error('❌ Docker Compose not available');
      console.error('   Please install Docker Compose or use Docker Desktop');
      process.exit(1);
    }
  }
  
} catch (error) {
  console.error('❌ Docker is not running or not installed');
  console.error('   Please start Docker Desktop or install Docker');
  console.error('   Visit: https://www.docker.com/products/docker-desktop');
  process.exit(1);
} 