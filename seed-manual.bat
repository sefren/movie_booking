@echo off
chcp 65001 >nul
title Manual Database Seeder
cls

echo ========================================
echo   MANUAL MOVIE DATABASE SEEDER
echo   (No TMDB API Required)
echo ========================================
echo.

echo [*] This will seed 5 classic movies:
echo   1. The Dark Knight
echo   2. Inception
echo   3. Interstellar
echo   4. The Matrix
echo   5. Pulp Fiction
echo.

echo [*] Plus 5 cinema screens with showtimes
echo.

echo [!] Make sure MongoDB is running!
echo Press CTRL+C to cancel or
pause

echo.
echo [*] Starting manual database seed...
echo.

cd /d "%~dp0backend"
call npm run seed:manual

echo.
echo ========================================
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Database seeded successfully!
    echo.
    echo Now you can:
    echo 1. Start backend: cd backend ^&^& npm run dev
    echo 2. The frontend will connect automatically
) else (
    echo [ERROR] Database seeding failed!
    echo.
    echo Make sure MongoDB is running
)
echo.
pause

