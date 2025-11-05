@echo off
chcp 65001 >nul
title SEFREN Dev Environment
cls

echo [*] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Node.js %%v

echo [*] Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do echo [OK] npm v%%v

echo.
echo [*] Installing dependencies...
if not exist "node_modules\" (
    echo [*] Installing frontend packages...
    call npm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend install failed!
        pause
        exit /b 1
    )
    echo [OK] Frontend installed
) else (
    echo [OK] Frontend already installed
)

if not exist "backend\node_modules\" (
    echo [*] Installing backend packages...
    cd backend
    call npm install >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Backend install failed!
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Backend installed
) else (
    echo [OK] Backend already installed
)

echo.
echo [*] Starting servers...
start "Backend - Port 5000" cmd /k "title SEFREN Backend && cd backend && npm run dev"
timeout /t 2 >nul
start "Frontend - Port 5173" cmd /k "title SEFREN Frontend && npm run dev -- --host"
timeout /t 2 >nul

echo.
echo [OK] Servers started!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:5173
exit
