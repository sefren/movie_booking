@echo off
echo ======================================
echo    Seeding Coming Soon Movies
echo ======================================
echo.

cd backend
node scripts/seedComingSoon.js

echo.
echo Press any key to exit...
pause >nul
