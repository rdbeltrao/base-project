# Scripts Directory

This directory contains cross-platform Node.js scripts that automate common development tasks.

## Scripts Overview

### `ensure-env.js`
**Purpose**: Ensures `.env` files exist in all app directories
**What it does**:
- Checks if `.env` files exist in `apps/backend`, `apps/app`, `apps/auth`, `apps/backoffice`, `apps/site`
- If `.env.example` exists, copies it to `.env`
- If no `.env.example` exists, creates a basic `.env` template with common variables
- Provides user feedback for each action

**Usage**: `pnpm run env:ensure`

### `wait-for-db.js`
**Purpose**: Waits for the PostgreSQL database to be ready before running migrations
**What it does**:
- Attempts to connect to PostgreSQL on `localhost:5432`
- Retries up to 30 times with 1-second intervals
- Provides real-time feedback on connection attempts
- Exits with error if database doesn't start within timeout

**Usage**: `pnpm run wait:db`

### `clean-all.js`
**Purpose**: Comprehensive cleanup of all build artifacts, dependencies, and Docker resources
**What it does**:
- Cleans Turbo cache and build artifacts
- Removes `node_modules` from all packages and apps
- Stops Docker containers and removes volumes
- Cleans temporary files (`.turbo`, `dist`, `build`, `.next`, `coverage`)
- Provides detailed feedback for each cleanup step

**Usage**: `pnpm run clean:all`

### `check-docker.js`
**Purpose**: Verifies Docker is running and Docker Compose is available
**What it does**:
- Checks if Docker daemon is running
- Verifies Docker Compose availability (tries both `docker-compose` and `docker compose`)
- Provides helpful error messages if Docker is not available
- Exits with error if requirements are not met

**Usage**: `pnpm run check:docker`

### `setup-db.js`
**Purpose**: Handles database setup with proper error handling
**What it does**:
- Changes to the database package directory
- Runs database migrations (`pnpm migrate:up`)
- Runs database seeds (`pnpm seed:all`)
- Provides clear error messages if setup fails
- Ensures proper working directory context

**Usage**: `pnpm run setup:db`

## Integration with Makefile

These scripts are integrated into the Makefile targets:

- `make check` - Runs Docker check and environment setup
- `make setup` - Full setup including all scripts
- `make clean:all` - Comprehensive cleanup
- `make db:setup` - Database setup only

## Cross-Platform Compatibility

All scripts are written in Node.js to ensure they work on:
- Windows (PowerShell, CMD)
- macOS (Terminal, zsh)
- Linux (bash, zsh)

## Error Handling

Each script includes:
- Proper error messages with emojis for visual feedback
- Exit codes for automation integration
- Helpful suggestions when things go wrong
- Graceful handling of missing files/directories

## Adding New Scripts

When adding new scripts:
1. Make them executable: `chmod +x scripts/your-script.js`
2. Add them to `package.json` scripts section
3. Update this README with documentation
4. Consider adding them to relevant Makefile targets 