#!/usr/bin/env node

const net = require('net');

const DB_PORT = 5432;
const DB_HOST = 'localhost';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000; // 1 second

let retries = MAX_RETRIES;

console.log('⏳ Waiting for database to be ready...');

function checkDatabase() {
  const socket = new net.Socket();
  
  socket.setTimeout(5000); // 5 second timeout
  
  socket.connect(DB_PORT, DB_HOST, () => {
    console.log('✅ Database is ready!');
    socket.destroy();
    process.exit(0);
  });
  
  socket.on('error', (err) => {
    socket.destroy();
    
    if (retries > 0) {
      retries--;
      console.log(`⏳ Database not ready yet... (${retries} retries left)`);
      setTimeout(checkDatabase, RETRY_INTERVAL);
    } else {
      console.error('❌ Database did not start within the expected time.');
      console.error('   Please check if Docker is running and containers are up.');
      process.exit(1);
    }
  });
  
  socket.on('timeout', () => {
    socket.destroy();
    if (retries > 0) {
      retries--;
      console.log(`⏳ Database connection timeout... (${retries} retries left)`);
      setTimeout(checkDatabase, RETRY_INTERVAL);
    } else {
      console.error('❌ Database connection timeout after maximum retries.');
      process.exit(1);
    }
  });
}

// Start checking
checkDatabase(); 