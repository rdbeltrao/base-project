# Cross-Platform Automation System

This project now includes a comprehensive, cross-platform automation system that works on Windows, macOS, and Linux.

## Quick Start

### On Windows (PowerShell/CMD)
```bash
# Show all available commands
.\make.bat help

# Full setup (install deps, start Docker, setup DB)
.\make.bat setup

# Start development servers
.\make.bat dev

# Full development environment (setup + dev)
.\make.bat start
```

### On macOS/Linux (with Make)
```bash
# Show all available commands
make help

# Full setup (install deps, start Docker, setup DB)
make setup

# Start development servers
make dev

# Full development environment (setup + dev)
make start
```

### Using pnpm directly
```bash
# Check environment and Docker
pnpm run check:docker
pnpm run env:ensure

# Setup database
pnpm run setup:db

# Comprehensive cleanup
pnpm run clean:all
```

## Available Commands

| Command | Description | Cross-Platform |
|---------|-------------|----------------|
| `setup` | Install dependencies, check Docker, start services, setup DB | ✅ |
| `build` | Build all packages | ✅ |
| `dev` | Start development servers | ✅ |
| `test` | Run tests | ✅ |
| `lint` | Run linting | ✅ |
| `lint:fix` | Fix linting issues | ✅ |
| `clean` | Clean build artifacts and node_modules | ✅ |
| `clean:all` | Comprehensive cleanup (all artifacts, Docker volumes) | ✅ |
| `db:setup` | Setup database (migrations + seeds) | ✅ |
| `db:reset` | Reset database (undo, migrate, seed) | ✅ |
| `down` | Stop Docker services | ✅ |
| `start` | Full local dev environment (setup + dev) | ✅ |
| `check` | Check Docker and environment status | ✅ |

## What's New

### 🔧 Cross-Platform Scripts
- **Node.js scripts** in `scripts/` directory for complex operations
- **PowerShell script** (`scripts/make.ps1`) for Windows users
- **Batch file** (`make.bat`) for easy Windows usage
- **Makefile** for Unix-based systems

### 🚀 Enhanced Automation
- **Environment validation** - Checks Docker status and creates `.env` files
- **Database readiness** - Waits for PostgreSQL to be ready before migrations
- **Comprehensive cleanup** - Removes all artifacts, dependencies, and Docker volumes
- **Error handling** - Clear error messages and helpful suggestions
- **Visual feedback** - Emojis and colors for better user experience

### 🛡️ Robust Error Handling
- Docker availability checks
- Database connection validation
- Graceful handling of missing files
- Clear error messages with suggestions

## Scripts Overview

### Core Scripts (`scripts/` directory)

#### `ensure-env.js`
- Creates `.env` files in all app directories
- Copies from `.env.example` if available
- Creates basic template if no example exists
- Provides user feedback for each action

#### `wait-for-db.js`
- Waits for PostgreSQL to be ready on port 5432
- Retries up to 30 times with 1-second intervals
- Provides real-time connection feedback
- Exits with error if database doesn't start

#### `clean-all.js`
- Comprehensive cleanup of all build artifacts
- Removes `node_modules` from all packages
- Stops Docker containers and removes volumes
- Cleans temporary files (`.turbo`, `dist`, `.next`, etc.)

#### `check-docker.js`
- Verifies Docker daemon is running
- Checks Docker Compose availability
- Provides helpful error messages
- Supports both `docker-compose` and `docker compose`

#### `setup-db.js`
- Handles database migrations and seeding
- Proper working directory management
- Clear error messages for database issues
- Integrated with the setup workflow

## Environment Setup

The automation system automatically handles:

1. **Docker Validation** - Ensures Docker is running and accessible
2. **Environment Files** - Creates `.env` files with basic templates
3. **Database Setup** - Waits for DB and runs migrations/seeds
4. **Dependency Installation** - Installs all packages with pnpm

## Troubleshooting

### Common Issues

#### Docker not running
```bash
# Check Docker status
pnpm run check:docker

# Start Docker Desktop (Windows/macOS)
# Or start Docker service (Linux)
```

#### Database connection issues
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

#### Permission issues (Linux/macOS)
```bash
# Make scripts executable
chmod +x scripts/*.js
chmod +x scripts/make.ps1
```

#### PowerShell execution policy (Windows)
```bash
# Run with bypass (already handled by make.bat)
powershell -ExecutionPolicy Bypass -File scripts/make.ps1 help

# Or set execution policy permanently (requires admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Development Workflow

### First Time Setup
```bash
# On Windows
.\make.bat setup

# On macOS/Linux
make setup
```

### Daily Development
```bash
# Start development servers
.\make.bat dev  # Windows
make dev        # macOS/Linux

# Or full environment
.\make.bat start  # Windows
make start        # macOS/Linux
```

### Testing
```bash
# Run tests
.\make.bat test  # Windows
make test        # macOS/Linux
```

### Cleanup
```bash
# Basic cleanup
.\make.bat clean  # Windows
make clean        # macOS/Linux

# Full cleanup (including Docker volumes)
.\make.bat clean:all  # Windows
make clean:all        # macOS/Linux
```

## Customization

### Adding New Scripts
1. Create script in `scripts/` directory
2. Add to `package.json` scripts section
3. Update `scripts/README.md`
4. Add to Makefile and PowerShell script if needed

### Modifying Environment Templates
Edit `scripts/ensure-env.js` to customize the basic `.env` template that gets created.

### Database Configuration
Modify `scripts/wait-for-db.js` to change database connection parameters.

## Benefits

✅ **Cross-Platform** - Works on Windows, macOS, and Linux  
✅ **Automated** - Handles complex setup steps automatically  
✅ **Robust** - Comprehensive error handling and validation  
✅ **User-Friendly** - Clear feedback and helpful error messages  
✅ **Maintainable** - Modular scripts that are easy to modify  
✅ **Consistent** - Same commands work across all platforms  

This automation system significantly reduces setup time and eliminates common configuration issues across different development environments. 