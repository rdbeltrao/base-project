@echo off
echo 🧹 Starting Windows force cleanup (handles permission errors)...

echo 🛑 Stopping potential file-locking processes...
taskkill /f /im node.exe 2>nul || echo No node processes to kill

echo 📦 Cleaning turbo cache and build artifacts...
call pnpm turbo clean 2>nul || echo ⚠️  Turbo not available, skipping turbo clean...

echo 🗑️ Force removing node_modules directories...
for /d /r . %%d in (node_modules) do @if exist "%%d" (
    echo Removing %%d
    rmdir /s /q "%%d" 2>nul || (
        echo ⚠️  Standard removal failed, trying alternative...
        rd /s /q "%%d" 2>nul || echo ❌ Failed to remove %%d
    )
)

echo 🗑️ Force cleaning pnpm cache...
call pnpm store prune 2>nul || echo ⚠️  pnpm store prune failed

echo 🗂️ Force cleaning temporary files...
if exist .turbo rmdir /s /q .turbo 2>nul
if exist dist rmdir /s /q dist 2>nul
if exist build rmdir /s /q build 2>nul
if exist .next rmdir /s /q .next 2>nul
if exist coverage rmdir /s /q coverage 2>nul

echo 🗑️ Force removing lock files...
if exist pnpm-lock.yaml del /f /q pnpm-lock.yaml 2>nul
if exist package-lock.json del /f /q package-lock.json 2>nul
if exist yarn.lock del /f /q yarn.lock 2>nul

echo 🐳 Stopping Docker containers...
docker-compose down -v 2>nul || echo ⚠️  Docker-compose down failed

echo ✅ Windows force cleanup complete!
echo 💡 Run "pnpm install --force" to reinstall dependencies 