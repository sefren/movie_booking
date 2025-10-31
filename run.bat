@echo off
title Movie Booking System

cls
echo.
echo ========================================================================
echo.
echo            🎬  MOVIE BOOKING SYSTEM  🎬
echo.
echo ========================================================================
echo.

echo Starting Backend Server...
start "Backend API - Port 5000" cmd /k "cd backend && npm run dev"
timeout /t 2 >nul

echo Starting Frontend Server...
start "Frontend App - Port 5173" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo ========================================================================
echo.
echo   ✅ SERVERS STARTED!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo   Press any key to open in browser...
echo.
echo ========================================================================
pause >nul

start http://localhost:5173

exit
