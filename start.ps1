# MovieCloud - Start Both Servers
# Run this script to start frontend + backend together

Write-Host "========================================" -ForegroundColor Green
Write-Host "   MovieCloud - Starting Both Servers" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Kill any existing node processes
Write-Host "Stopping any existing servers..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend server
Write-Host "[1/2] Starting Backend Server (port 3001)..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "G:\AI Projects\Movies\moviecloud\server" -PassThru -WindowStyle Minimized
Write-Host "  Backend PID: $($backend.Id)" -ForegroundColor Gray

# Wait for backend to be ready
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "[2/2] Starting Frontend Server (port 3000)..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath "npx" -ArgumentList "next dev -p 3000" -WorkingDirectory "G:\AI Projects\Movies\moviecloud\client" -PassThru -WindowStyle Minimized
Write-Host "  Frontend PID: $($frontend.Id)" -ForegroundColor Gray

# Wait for servers to start
Write-Host ""
Write-Host "Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if servers are running
try {
    $backendStatus = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/movies/featured" -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] Backend is running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Backend may still be starting..." -ForegroundColor Yellow
}

try {
    $frontendStatus = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] Frontend is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Frontend may still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Both servers are running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers, or close this window." -ForegroundColor Yellow
Write-Host ""

# Keep script running and watch for Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if servers are still running
        $backendRunning = Get-Process -Id $backend.Id -ErrorAction SilentlyContinue
        $frontendRunning = Get-Process -Id $frontend.Id -ErrorAction SilentlyContinue
        
        if (-not $backendRunning) {
            Write-Host "[ERROR] Backend stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if (-not $frontendRunning) {
            Write-Host "[ERROR] Frontend stopped unexpectedly!" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Servers stopped." -ForegroundColor Green
}
