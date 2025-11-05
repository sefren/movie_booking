@echo off
chcp 65001 >nul
title Prepare Project for Deployment
cls

echo ============================================
echo   CINEMA APP - DEPLOYMENT PREPARATION
echo ============================================
echo.

:: Colors for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%[STEP 1/6] Checking Git status...%RESET%
echo.
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERROR] Git not found. Please install Git first.%RESET%
    pause
    exit /b 1
)
echo %GREEN%[OK] Git is installed%RESET%
echo.

:: Check if git repo exists
if not exist ".git" (
    echo %YELLOW%[!] No Git repository found. Initializing...%RESET%
    git init
    echo %GREEN%[OK] Git repository initialized%RESET%
) else (
    echo %GREEN%[OK] Git repository exists%RESET%
)
echo.

echo %BLUE%[STEP 2/6] Checking .gitignore...%RESET%
echo.
if exist ".gitignore" (
    echo %GREEN%[OK] .gitignore exists%RESET%
) else (
    echo %YELLOW%[!] Creating .gitignore...%RESET%
    echo # Dependencies > .gitignore
    echo node_modules >> .gitignore
    echo backend/node_modules >> .gitignore
    echo. >> .gitignore
    echo # Environment variables >> .gitignore
    echo .env >> .gitignore
    echo .env.local >> .gitignore
    echo backend/.env >> .gitignore
    echo. >> .gitignore
    echo # Build outputs >> .gitignore
    echo dist >> .gitignore
    echo dist-ssr >> .gitignore
    echo. >> .gitignore
    echo # IDE >> .gitignore
    echo .idea >> .gitignore
    echo .vscode >> .gitignore
    echo %GREEN%[OK] .gitignore created%RESET%
)
echo.

echo %BLUE%[STEP 3/6] Checking sensitive files...%RESET%
echo.
set "has_env_files=0"
if exist ".env" (
    echo %YELLOW%[!] Found .env file%RESET%
    set "has_env_files=1"
)
if exist "backend\.env" (
    echo %YELLOW%[!] Found backend/.env file%RESET%
    set "has_env_files=1"
)

if "%has_env_files%"=="1" (
    echo.
    echo %YELLOW%WARNING: Environment files found!%RESET%
    echo These files contain secrets and should NOT be committed.
    echo They are already in .gitignore, but be careful!
    echo.
) else (
    echo %GREEN%[OK] No .env files in root (this is good for deployment)%RESET%
)
echo.

echo %BLUE%[STEP 4/6] Checking required files...%RESET%
echo.
set "missing_files=0"

if not exist "package.json" (
    echo %RED%[ERROR] package.json not found%RESET%
    set "missing_files=1"
) else (
    echo %GREEN%[OK] package.json exists%RESET%
)

if not exist "backend\package.json" (
    echo %RED%[ERROR] backend/package.json not found%RESET%
    set "missing_files=1"
) else (
    echo %GREEN%[OK] backend/package.json exists%RESET%
)

if not exist "README.md" (
    echo %YELLOW%[!] README.md not found (optional but recommended)%RESET%
) else (
    echo %GREEN%[OK] README.md exists%RESET%
)

if not exist ".env.example" (
    echo %YELLOW%[!] .env.example not found (optional but recommended)%RESET%
) else (
    echo %GREEN%[OK] .env.example exists%RESET%
)

if "%missing_files%"=="1" (
    echo.
    echo %RED%[ERROR] Missing required files. Cannot proceed.%RESET%
    pause
    exit /b 1
)
echo.

echo %BLUE%[STEP 5/6] Git status check...%RESET%
echo.
git status --short
echo.

echo %BLUE%[STEP 6/6] Ready to commit?%RESET%
echo.
echo Files that will be committed:
echo - All source code (src/, backend/)
echo - Configuration files
echo - .env.example (template only)
echo - README.md, DEPLOYMENT.md
echo.
echo Files that will NOT be committed:
echo - node_modules/
echo - .env files (secrets)
echo - dist/ (build output)
echo - .idea/ (IDE settings)
echo.

set /p "confirm=Do you want to commit these files? (y/n): "
if /i not "%confirm%"=="y" (
    echo %YELLOW%[!] Aborted by user%RESET%
    pause
    exit /b 0
)

echo.
echo %BLUE%Adding files to Git...%RESET%
git add .
echo %GREEN%[OK] Files added%RESET%
echo.

set /p "commit_msg=Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set "commit_msg=Prepare for deployment"

echo.
echo %BLUE%Committing files...%RESET%
git commit -m "%commit_msg%"
if %errorlevel% equ 0 (
    echo %GREEN%[OK] Files committed successfully%RESET%
) else (
    echo %YELLOW%[!] No changes to commit or commit failed%RESET%
)
echo.

echo %BLUE%Checking remote repository...%RESET%
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%[!] No remote repository configured%RESET%
    echo.
    echo To push to GitHub:
    echo 1. Create a new repository on GitHub
    echo 2. Run: git remote add origin https://github.com/yourusername/your-repo.git
    echo 3. Run: git branch -M main
    echo 4. Run: git push -u origin main
) else (
    echo %GREEN%[OK] Remote repository configured%RESET%
    echo.
    set /p "push=Do you want to push to remote? (y/n): "
    if /i "%push%"=="y" (
        echo.
        echo %BLUE%Pushing to remote...%RESET%
        git push
        if %errorlevel% equ 0 (
            echo %GREEN%[OK] Pushed successfully%RESET%
        ) else (
            echo %RED%[ERROR] Push failed. You may need to set up remote or resolve conflicts.%RESET%
        )
    )
)

echo.
echo ============================================
echo   DEPLOYMENT PREPARATION COMPLETE!
echo ============================================
echo.
echo %GREEN%Next Steps:%RESET%
echo.
echo %YELLOW%1. BACKEND DEPLOYMENT (Render):%RESET%
echo    - Go to https://render.com
echo    - Create new Web Service from your GitHub repo
echo    - Root Directory: backend
echo    - Build: npm install
echo    - Start: npm start
echo    - Add environment variables (see DEPLOYMENT.md)
echo.
echo %YELLOW%2. FRONTEND DEPLOYMENT (Netlify):%RESET%
echo    - Go to https://netlify.com
echo    - Import your GitHub repo
echo    - Build command: npm run build
echo    - Publish directory: dist
echo    - Add environment variables (see DEPLOYMENT.md)
echo.
echo %YELLOW%3. READ DEPLOYMENT.md for detailed instructions!%RESET%
echo.
echo %BLUE%Your repository is ready for deployment!%RESET%
echo.

pause

