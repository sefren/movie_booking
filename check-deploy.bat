@echo off
chcp 65001 >nul
title Quick Deployment Check
cls

echo ============================================
echo   DEPLOYMENT READINESS CHECK
echo ============================================
echo.

:: Check Node.js
echo [1] Checking Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('node -v') do echo    [OK] Node.js %%v
) else (
    echo    [X] Node.js not found
)

:: Check npm
echo [2] Checking npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('npm -v') do echo    [OK] npm v%%v
) else (
    echo    [X] npm not found
)

:: Check Git
echo [3] Checking Git...
where git >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('git --version') do echo    [OK] %%v
) else (
    echo    [X] Git not found
)

echo.
echo ============================================
echo   FILE STRUCTURE CHECK
echo ============================================
echo.

:: Check important files
if exist "package.json" (echo [OK] package.json) else (echo [X] package.json MISSING)
if exist "backend\package.json" (echo [OK] backend/package.json) else (echo [X] backend/package.json MISSING)
if exist "backend\server.js" (echo [OK] backend/server.js) else (echo [X] backend/server.js MISSING)
if exist "src\main.jsx" (echo [OK] src/main.jsx) else (echo [X] src/main.jsx MISSING)
if exist "vite.config.js" (echo [OK] vite.config.js) else (echo [X] vite.config.js MISSING)
if exist ".gitignore" (echo [OK] .gitignore) else (echo [!] .gitignore missing - create it!)
if exist ".env.example" (echo [OK] .env.example) else (echo [!] .env.example - optional)
if exist "README.md" (echo [OK] README.md) else (echo [!] README.md - optional)
if exist "DEPLOYMENT.md" (echo [OK] DEPLOYMENT.md) else (echo [!] DEPLOYMENT.md - optional)
if exist "netlify.toml" (echo [OK] netlify.toml) else (echo [!] netlify.toml missing)

echo.
echo ============================================
echo   SECURITY CHECK
echo ============================================
echo.

:: Check for sensitive files
set "has_issues=0"
if exist ".env" (
    echo [!] .env file found - make sure it's in .gitignore!
    set "has_issues=1"
)
if exist "backend\.env" (
    echo [!] backend/.env file found - make sure it's in .gitignore!
    set "has_issues=1"
)
if exist "node_modules" (
    echo [!] node_modules folder found - should be in .gitignore!
    set "has_issues=1"
)
if exist "backend\node_modules" (
    echo [!] backend/node_modules folder found - should be in .gitignore!
    set "has_issues=1"
)

if "%has_issues%"=="0" (
    echo [OK] No sensitive files in root
)

echo.
echo ============================================
echo   GIT STATUS
echo ============================================
echo.

if exist ".git" (
    echo Git repository: YES
    echo.
    echo Current branch:
    git branch --show-current 2>nul
    echo.
    echo Remote status:
    git remote -v 2>nul
    if %errorlevel% neq 0 (
        echo [!] No remote repository configured
    )
) else (
    echo [!] Not a Git repository yet
    echo    Run: git init
)

echo.
echo ============================================
echo   RECOMMENDATION
echo ============================================
echo.

if not exist ".git" (
    echo 1. Run: prepare-deploy.bat
    echo    This will set up Git and prepare for deployment
) else (
    echo 1. Commit your changes: prepare-deploy.bat
    echo 2. Push to GitHub
    echo 3. Deploy backend to Render
    echo 4. Deploy frontend to Netlify
    echo.
    echo See DEPLOYMENT.md for detailed instructions
)

echo.
pause

