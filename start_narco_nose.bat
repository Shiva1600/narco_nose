@echo off
cd /d "%~dp0"
title Narco Nose Dashboard

echo ==========================================================
echo    Narco Nose - Real-Time Chemical Threat Detection
echo ==========================================================
echo Project Directory: %~dp0
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in system PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check and install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [SETUP] Installing required packages...
    call npm.cmd install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 3. Check and build frontend if dist folder is missing
if not exist "dist\index.html" (
    echo [BUILD] Building frontend bundle...
    call npm.cmd run build
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
)

:: 4. Launch browser after a brief delay
start "" cmd /c "timeout /t 2 /nobreak >nul & explorer http://localhost:5000"

:: 5. Launch Full-Stack Server
echo.
echo [RUNNING] Server listening on http://localhost:5000
echo [INFO] Close this window to stop the application.
echo ==========================================================
echo.
node server/index.js

pause
