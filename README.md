# Test Pod - Development Guide

## Overview

This is a monorepo project managed with PNPM and Turborepo, containing the following main components:

- **Backend**: Main API (Node.js/Express)
- **Auth**: Authentication service (functions as an SSO, all applications use a shared cookie on the domain)
- **App**: Main application (user portal)
- **Backoffice**: Administrative interface (administration panel)

## Prerequisites

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- Google Cloud Platform account

## Development Environment Setup

### 1. Cloning the Repository

```bash
git clone https://github.com/your-user/test-pod.git
cd test-pod
```

### 2. Installing Dependencies

```bash
pnpm install
```

### 3. Configuring Environment Variables

Copy the example environment variable files for each application:

```bash
# For the backend
cp apps/backend/.env.example apps/backend/.env

# For the app
cp apps/app/.env.example apps/app/.env

# For the auth
cp apps/auth/.env.example apps/auth/.env

# For the backoffice
cp apps/backoffice/.env.example apps/backoffice/.env
```

Adjust the environment variables as needed.

### 4. Ensure a database exists or start one using docker-compose

```bash
docker-compose up -d
```

This command will start a PostgreSQL container with the following settings:

- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: test_pod_db

### 5. Configuring Redis

Redis is used for caching in the backend. There are two options to configure it:

#### Option 1: Using Docker Compose (Recommended)

Execute:

```bash
docker-compose up -d
```

#### Option 2: Local Installation

Alternatively, you can install Redis locally.

#### Configuration in .env

Note that there is a `REDIS_URL` environment variable in the backend's `.env.example` file:

```
REDIS_URL=redis://localhost:6379
```

You can adjust the URL as needed.

### 6. Configuring Google Integration

Google integration is necessary to add events to users' calendars and also for login. Follow the steps below to configure:

1. Access the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. In the side menu, go to "APIs & Services" > "Library"
4. Search for and enable the following APIs:
   - Google Calendar API
   - Google OAuth 2.0
5. In the side menu, go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "OAuth client ID"
7. Configure the OAuth consent screen:
   - Choose the user type (External or Internal)
   - Add your email as a test user
8. Create an OAuth client ID:
   - Select "Web application" as the type
   - Give your application a name
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
9. Note the "Client ID" and "Client Secret"

#### Configuration in .env

Add the following variables to the backend's `.env` file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**IMPORTANT**: Google Calendar integration will not work without these credentials configured correctly, however the system will function without them.

### 7. Running Migrations and Seeds

```bash
# Run all pending migrations
cd packages/database
pnpm migrate:up

# Populate the database with initial data
pnpm seed:all
```

### 8. Starting the Development Environment

```bash
# In the project root
turbo dev
```

This command will start all services in development mode:

- **Backend**: http://localhost:3000
- **App**: http://localhost:3001
- **Auth**: http://localhost:3002
- **Backoffice**: http://localhost:3003

## Project Structure

```
.
├── apps/                 # Applications
│   ├── app/              # Main application
│   ├── auth/             # Authentication service
│   ├── backend/          # Main API
│   ├── backoffice/       # Administrative interface
└── packages/             # Shared libraries
    ├── database/         # Database configuration, models, and migrations
    └── ...               # Other shared libraries
```

## Tests

```bash
# Run all tests
turbo test

# Run specific tests for a package
cd apps/backend
pnpm test
```

## Useful Commands

```bash
# Build all packages
turbo build

# Check for lint issues
turbo lint

# Fix lint issues
turbo lint:fix

# Format the code
turbo format

# Clean caches and node_modules
turbo clean
```

## About System Operation

User registration on the registration screen adds the user to the `user` group (Created in migrations, if it doesn't exist it won't work).
The macro permission system works as follows:

- a user with the `user` role can access the app
- a user with the `admin` role can access the backoffice

This means that to access the user portal (app) it is necessary to be in the `user` group.
