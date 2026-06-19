@echo off
title MovieCloud Server
color 0A
cls

echo.
echo  ╔════════════════════════════════════════════════╗
echo  ║         MovieCloud - Starting Servers          ║
echo  ╚════════════════════════════════════════════════╝
echo.

:: Kill any existing node processes
echo  [1/3] Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo       ✓ Old servers stopped
echo.

:: Start backend server
echo  [2/3] Starting Backend (port 3001)...
start "MC-Backend" /MIN cmd /c "cd /d "%~dp0server" && node server.js"
timeout /t 3 /nobreak >nul
echo       ✓ Backend started
echo.

:: Start frontend server  
echo  [3/3] Starting Frontend (port 3000)...
start "MC-Frontend" /MIN cmd /c "cd /d "%~dp0client" && npx next dev -p 3000"
timeout /t 10 /nobreak >nul
echo       ✓ Frontend started
echo.

echo  ╔════════════════════════════════════════════════╗
echo  ║           Both Servers Running!                ║
echo  ╠════════════════════════════════════════════════╣
echo  ║  Frontend:  http://localhost:3000              ║
echo  ║  Backend:   http://localhost:3001              ║
echo  ╚════════════════════════════════════════════════╝
echo.
echo  Press any key to open browser...
pause >nul

start http://localhost:3000

echo.
echo  Browser opened! Keep this window open.
echo  Close this window to stop all servers.
echo.
pause
