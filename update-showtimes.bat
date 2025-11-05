@echo off
echo ========================================
echo   UPDATE SHOWTIMES ONLY
echo   (Keeps existing movies intact)
echo ========================================
echo.

echo This will:
echo  - Keep all existing movies and screens
echo  - DELETE all old showtimes
echo  - Generate NEW realistic showtimes:
echo    * 60 days (2 months)
echo    * 1-3 times per day per movie
echo    * Random schedule patterns
echo.
pause

cd /d "%~dp0backend"
call npm run update:showtimes

echo.
echo ========================================
if %errorlevel% equ 0 (
    echo [SUCCESS] Showtimes updated!
    echo.
    echo Now restart backend: cd backend ^&^& npm run dev
) else (
    echo [ERROR] Update failed!
)
echo.
pause

