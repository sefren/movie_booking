@echo off
echo ================================
echo Backend Server Startup Test
echo ================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking MongoDB connection...
echo MONGODB_URI: mongodb://localhost:27017/movie-booking
echo.

echo [2/3] Starting backend server...
echo.
node server.js

pause

