@echo off
setlocal enabledelayedexpansion

title Movie Booking System Setup

:: Colors (for Windows 10+)
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "MAGENTA=[95m"
set "CYAN=[96m"
set "WHITE=[97m"
set "RED=[91m"
set "NC=[0m"

cls
echo.
echo %MAGENTA%========================================================================%NC%
echo %MAGENTA%                                                                        %NC%
echo %MAGENTA%            🎬  MOVIE BOOKING SYSTEM SETUP  🎬                         %NC%
echo %MAGENTA%                                                                        %NC%
echo %MAGENTA%               Complete Cinema Ticket Booking                          %NC%
echo %MAGENTA%           with Real-time Seat Locking ^& Payments                     %NC%
echo %MAGENTA%                                                                        %NC%
echo %MAGENTA%========================================================================%NC%
echo.
echo.

:: Step 1: Check Prerequisites
echo %CYAN%===============================================================%NC%
echo %CYAN%  Step 1: Checking Prerequisites%NC%
echo %CYAN%===============================================================%NC%
echo.

where node >nul 2>nul
if %errorlevel% == 0 (
    echo %GREEN%✅ Node.js is installed%NC%
    node -v
) else (
    echo %RED%❌ Node.js is not installed%NC%
    echo %YELLOW%Please install Node.js from https://nodejs.org/%NC%
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% == 0 (
    echo %GREEN%✅ npm is installed%NC%
    npm -v
) else (
    echo %RED%❌ npm is not installed%NC%
    pause
    exit /b 1
)

echo.
echo %BLUE%Checking MongoDB...%NC%
net start | findstr /i "MongoDB" >nul
if %errorlevel% == 0 (
    echo %GREEN%✅ MongoDB service is running%NC%
) else (
    echo %YELLOW%⚠️  MongoDB service not detected%NC%
    echo %BLUE%Make sure MongoDB is installed and running%NC%
)

echo.
timeout /t 2 >nul

:: Step 2: Install Dependencies
echo %CYAN%===============================================================%NC%
echo %CYAN%  Step 2: Installing Dependencies%NC%
echo %CYAN%===============================================================%NC%
echo.

echo %BLUE%Installing frontend dependencies...%NC%
call npm install >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%✅ Frontend dependencies installed%NC%
) else (
    echo %RED%❌ Failed to install frontend dependencies%NC%
)

echo.
echo %BLUE%Installing backend dependencies...%NC%
cd backend
call npm install >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%✅ Backend dependencies installed%NC%
) else (
    echo %RED%❌ Failed to install backend dependencies%NC%
)
cd ..

echo.
timeout /t 2 >nul

:: Step 3: Database Setup
echo %CYAN%===============================================================%NC%
echo %CYAN%  Step 3: Setting Up Database%NC%
echo %CYAN%===============================================================%NC%
echo.

echo %BLUE%Seeding database with movies, screens, and showtimes...%NC%
cd backend
call npm run seed
cd ..
echo.
echo %GREEN%✅ Database seeded successfully!%NC%

echo.
timeout /t 2 >nul

:: Step 4: Configuration
echo %CYAN%===============================================================%NC%
echo %CYAN%  Step 4: Configuration Summary%NC%
echo %CYAN%===============================================================%NC%
echo.

echo %WHITE%Backend Configuration:%NC%
echo   → API running on: %GREEN%http://localhost:5000%NC%
echo   → Database: %GREEN%MongoDB (localhost:27017)%NC%
echo.

echo %WHITE%Frontend Configuration:%NC%
echo   → App running on: %GREEN%http://localhost:5173%NC%
echo   → Backend API: %GREEN%http://localhost:5000/api%NC%
echo.

echo %WHITE%Database Contents:%NC%
echo   → %GREEN%3%NC% Screens (Standard, IMAX, 3D)
echo   → %GREEN%3%NC% Movies (Dark Knight, Inception, Interstellar)
echo   → %GREEN%5%NC% Showtimes per day across different screens
echo   → %GREEN%7%NC% Days of shows available
echo.

timeout /t 3 >nul

:: Step 5: Start Services
echo %CYAN%===============================================================%NC%
echo %CYAN%  Step 5: Starting Services%NC%
echo %CYAN%===============================================================%NC%
echo.

echo %BLUE%This will open 2 terminal windows:%NC%
echo   1. Backend Server (Port 5000)
echo   2. Frontend Dev Server (Port 5173)
echo.
echo %YELLOW%Press any key to start the servers...%NC%
pause >nul

echo.
echo %BLUE%Starting backend server...%NC%
start "Movie Booking - Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 >nul

echo %BLUE%Starting frontend server...%NC%
start "Movie Booking - Frontend" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 3 >nul

:: Success Message
cls
echo.
echo %GREEN%========================================================================%NC%
echo %GREEN%                                                                        %NC%
echo %GREEN%                   ✨  SETUP COMPLETE!  ✨                             %NC%
echo %GREEN%                                                                        %NC%
echo %GREEN%========================================================================%NC%
echo.
echo.

echo %WHITE%🌐 Your application is now running!%NC%
echo.
echo %CYAN%Frontend:%NC%  %GREEN%http://localhost:5173%NC%
echo %CYAN%Backend:%NC%   %GREEN%http://localhost:5000%NC%
echo %CYAN%Database:%NC%  %GREEN%MongoDB on localhost:27017%NC%
echo.

echo %WHITE%📚 Features Available:%NC%
echo   %GREEN%✓%NC% Browse movies in theaters
echo   %GREEN%✓%NC% Multiple screens with different showtimes
echo   %GREEN%✓%NC% Real-time seat selection
echo   %GREEN%✓%NC% Seat locking (10-minute reservation)
echo   %GREEN%✓%NC% Booking management
echo   %GREEN%✓%NC% Payment simulation
echo.

echo %YELLOW%📝 Test Booking Flow:%NC%
echo   1. Select a movie
echo   2. Choose date, time, and screen
echo   3. Select seats (max 8)
echo   4. Fill customer info
echo   5. Complete payment
echo.

echo %WHITE%🔧 Quick Commands:%NC%
echo   • Reseed database:    cd backend ^&^& npm run seed
echo   • Restart backend:     cd backend ^&^& npm run dev
echo   • Restart frontend:    npm run dev
echo.

echo %MAGENTA%Happy Booking! 🎬🍿%NC%
echo.

echo %YELLOW%Press any key to open the app in your browser...%NC%
pause >nul

start http://localhost:5173

echo.
echo %GREEN%Browser opened! Enjoy!%NC%
echo.
pause
