@echo off
title HotelPro Launcher
echo ========================================================
echo        Starting HotelPro Hospitality Platform...
echo ========================================================
echo.

:: Start Backend Server in a minimized window
echo [1/2] Starting Node.js / Express Backend (Port 5000)...
start "HotelPro Backend" /min cmd /c "cd /d %~dp0backend && npm run dev"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

:: Start Frontend Server and open in default browser
echo [2/2] Starting React / Vite Frontend (Port 5173)...
start "HotelPro Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

:: Open browser automatically
timeout /t 3 /nobreak >nul
echo Launching browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo   HotelPro is now running! 
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo ========================================================
