@echo off
chcp 65001 >nul
title Database Seeder
cls

echo ========================================
echo      MOVIE DATABASE SEEDER
echo ========================================
echo.

echo [*] Checking MongoDB...
echo Connecting to: mongodb://localhost:27017/movie-booking
echo.

echo [!] Make sure MongoDB is running!
echo Press CTRL+C to cancel or
pause

echo.
echo [*] Starting database seed process...
echo This will:
echo   - Fetch 100 movies from TMDB
echo   - Create 5 cinema screens
echo   - Generate showtimes for 14 days
echo.

cd /d "%~dp0backend"
call npm run seed

echo.
echo ========================================
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Database seeded successfully!
    echo.
    echo You can now start the backend server.
) else (
    echo [ERROR] Database seeding failed!
    echo.
    echo Common issues:
    echo - MongoDB is not running
    echo - TMDB API key is invalid
    echo - Network connection issues
)
echo.
pause

