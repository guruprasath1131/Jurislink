@echo off
setlocal
title Jurislink - Multilingual Legal Platform

echo ==============================================================================
echo                      JURISLINK (न्याय सेतु) - ONE-CLICK LAUNCHER
echo    Multilingual Voice-First Legal Case and Telephony Platform for India
echo ==============================================================================
echo.

cd /d "%~dp0"

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Check and install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [INFO] First-time setup detected. Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install npm packages.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: 3. Start Backend (SQLite Database) & Frontend UI concurrently
call node server/runner.js
