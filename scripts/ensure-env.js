#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appPaths = [
  'apps/backend',
  'apps/app', 
  'apps/auth',
  'apps/backoffice',
  'apps/site'
];

console.log('🔧 Ensuring .env files exist...');

appPaths.forEach(dir => {
  const envPath = path.join(dir, '.env');
  const examplePath = path.join(dir, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log(`✅ Copied ${examplePath} to ${envPath}`);
    } else {
      // Create a basic .env file with common variables
      const basicEnvContent = `# Environment variables for ${dir}
# Add your environment-specific variables here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_pod_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
`;
      
      fs.writeFileSync(envPath, basicEnvContent);
      console.log(`📝 Created ${envPath} with basic template`);
    }
  } else {
    console.log(`✅ ${envPath} already exists`);
  }
});

console.log('🎉 Environment files check complete!'); 