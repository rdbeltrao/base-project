@echo off
echo 🧹 Starting Windows-specific cleanup...

echo 📦 Cleaning turbo cache and build artifacts...
call pnpm turbo clean 2>nul || echo ⚠️  Turbo not available, skipping turbo clean...

echo 🗑️ Removing node_modules directories...
for /d /r . %%d in (node_modules) do @if exist "%%d" (
    echo Removing %%d
    rmdir /s /q "%%d" 2>nul
)

echo 🗑️ Cleaning pnpm cache...
call pnpm store prune

echo 🗂️ Cleaning temporary files...
if exist .turbo rmdir /s /q .turbo
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
if exist .next rmdir /s /q .next
if exist coverage rmdir /s /q coverage
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo 🐳 Stopping Docker containers...
docker-compose down -v 2>nul

echo ✅ Windows cleanup complete!
echo 💡 Run "pnpm install" to reinstall dependencies 