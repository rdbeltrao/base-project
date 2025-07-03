#!/usr/bin/env pwsh

param(
    [Parameter(Position=0)]
    [string]$Target = "help"
)

function Show-Help {
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  setup      - Install dependencies, check Docker, start services, setup DB" -ForegroundColor White
    Write-Host "  build      - Build all packages" -ForegroundColor White
    Write-Host "  dev        - Start development servers" -ForegroundColor White
    Write-Host "  test       - Run tests" -ForegroundColor White
    Write-Host "  lint       - Run linting" -ForegroundColor White
    Write-Host "  lint:fix   - Fix linting issues" -ForegroundColor White
    Write-Host "  clean      - Clean build artifacts and node_modules" -ForegroundColor White
    Write-Host "  clean:all  - Comprehensive cleanup (all artifacts, Docker volumes)" -ForegroundColor White
    Write-Host "  db:setup   - Setup database (migrations + seeds)" -ForegroundColor White
    Write-Host "  db:reset   - Reset database (undo, migrate, seed)" -ForegroundColor White
    Write-Host "  down       - Stop Docker services" -ForegroundColor White
    Write-Host "  start      - Full local dev environment (setup + dev)" -ForegroundColor White
    Write-Host "  check      - Check Docker and environment status" -ForegroundColor White
}

function Invoke-Setup {
    Write-Host "Checking environment..." -ForegroundColor Yellow
    pnpm run check:docker
    pnpm run env:ensure
    Write-Host "Environment check complete!" -ForegroundColor Green
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    
    Write-Host "Starting Docker services..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
    pnpm run wait:db
    
    Write-Host "Setting up database..." -ForegroundColor Yellow
    pnpm run setup:db
    
    Write-Host "Setup complete!" -ForegroundColor Green
}

function Invoke-Build {
    Write-Host "Building all packages..." -ForegroundColor Yellow
    pnpm turbo build
}

function Invoke-Dev {
    Write-Host "Starting development servers..." -ForegroundColor Yellow
    pnpm turbo dev
}

function Invoke-Test {
    Write-Host "Running tests..." -ForegroundColor Yellow
    pnpm turbo test
}

function Invoke-Lint {
    Write-Host "Running linting..." -ForegroundColor Yellow
    pnpm turbo lint
}

function Invoke-LintFix {
    Write-Host "Fixing linting issues..." -ForegroundColor Yellow
    pnpm turbo lint:fix
}

function Invoke-Clean {
    Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
    pnpm turbo clean
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "Clean complete!" -ForegroundColor Green
}

function Invoke-CleanAll {
    Write-Host "Starting comprehensive cleanup..." -ForegroundColor Yellow
    pnpm run clean:all
}

function Invoke-DbSetup {
    Write-Host "Setting up database..." -ForegroundColor Yellow
    pnpm run setup:db
}

function Invoke-DbReset {
    Write-Host "Resetting database..." -ForegroundColor Yellow
    Set-Location packages/database
    pnpm db:reset
    Set-Location ../..
    Write-Host "Database reset complete!" -ForegroundColor Green
}

function Invoke-Down {
    Write-Host "Stopping Docker services..." -ForegroundColor Yellow
    docker-compose down
}

function Invoke-Start {
    Invoke-Setup
    Invoke-Dev
}

function Invoke-Check {
    Write-Host "Checking environment..." -ForegroundColor Yellow
    pnpm run check:docker
    pnpm run env:ensure
    Write-Host "Environment check complete!" -ForegroundColor Green
}

# Main execution
switch ($Target.ToLower()) {
    "help" { Show-Help }
    "setup" { Invoke-Setup }
    "build" { Invoke-Build }
    "dev" { Invoke-Dev }
    "test" { Invoke-Test }
    "lint" { Invoke-Lint }
    "lint:fix" { Invoke-LintFix }
    "clean" { Invoke-Clean }
    "clean:all" { Invoke-CleanAll }
    "db:setup" { Invoke-DbSetup }
    "db:reset" { Invoke-DbReset }
    "down" { Invoke-Down }
    "start" { Invoke-Start }
    "check" { Invoke-Check }
    default {
        Write-Host "Unknown target: $Target" -ForegroundColor Red
        Show-Help
        exit 1
    }
} 