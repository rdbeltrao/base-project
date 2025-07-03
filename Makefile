.PHONY: build setup dev test lint lint-fix clean help db-setup db-reset down start check fresh-install

# Default target
help:
	@echo "🚀 Available commands:"
	@echo "  setup      - Install dependencies, check Docker, start services, setup DB"
	@echo "  build      - Build all packages"
	@echo "  dev        - Start development servers"
	@echo "  test       - Run tests"
	@echo "  lint       - Run linting"
	@echo "  lint-fix   - Fix linting issues"
	@echo "  clean      - Clean build artifacts and node_modules"
	@echo "  clean-all  - Comprehensive cleanup (all artifacts, Docker volumes)"
	@echo "  fresh-install - Delete all node_modules, clear pnpm cache, and reinstall"
	@echo "  db-setup   - Setup database (migrations + seeds)"
	@echo "  db-reset   - Reset database (undo, migrate, seed)"
	@echo "  down       - Stop Docker services"
	@echo "  start      - Full local dev environment (setup + dev)"
	@echo "  check      - Check Docker and environment status"

# Check environment and Docker status
check:
	@echo "🔍 Checking environment..."
	pnpm run check:docker
	pnpm run env:ensure
	@echo "✅ Environment check complete!"

# Install dependencies and start services
setup: check
	@echo "📦 Installing dependencies..."
	pnpm install
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "⏳ Waiting for database to be ready..."
	pnpm run wait:db
	@echo "🗄️  Setting up database..."
	pnpm run setup:db
	@echo "🎉 Setup complete!"

# Build all packages
build:
	@echo "🔨 Building all packages..."
	pnpm turbo build

# Start development servers
dev:
	@echo "🚀 Starting development servers..."
	pnpm turbo dev

# Run tests
test:
	@echo "🧪 Running tests..."
	pnpm turbo test

# Run linting
lint:
	@echo "🔍 Running linting..."
	pnpm turbo lint

# Fix linting issues
lint-fix:
	@echo "🔧 Fixing linting issues..."
	pnpm turbo lint:fix

# Clean build artifacts and node_modules
clean:
	@echo "🧹 Cleaning build artifacts..."
	pnpm turbo clean
	@echo "🗑️  Removing node_modules..."
	rm -rf node_modules
	@echo "✅ Clean complete!"

# Fresh install - delete all node_modules, clear pnpm cache, and reinstall
fresh-install:
	@echo "🧹 Starting fresh install..."
	@echo "🗑️  Running comprehensive cleanup first..."
	@pnpm run clean:all || pnpm run clean:simple || pnpm run clean:force
	@echo "📦 Installing dependencies with retry logic..."
	pnpm run install:retry
	@echo "✅ Fresh install complete!"

# Comprehensive cleanup
clean-all:
	@echo "🧹 Starting comprehensive cleanup..."
	pnpm run clean:all

# Setup database (migrations + seeds)
db-setup:
	@echo "🗄️  Setting up database..."
	pnpm run setup:db

# Stop Docker services
down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

# Reset database (migrations down + up + seeds)
db-reset:
	@echo "🔄 Resetting database..."
	cd packages/database && pnpm db:reset
	@echo "✅ Database reset complete!"

# Full local development environment
start: setup dev
