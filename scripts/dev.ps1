# Development mode with auto-reload/watch
# Usage: ./dev.ps1

Write-Host @"
================================================
UK Hospitality Platform - Development Mode
================================================

Starting both services with auto-reload enabled:
  - Backend API (watch mode): http://localhost:5000
  - Frontend (next dev): http://localhost:3000

Press Ctrl+C in either terminal to stop.
Run each in a separate terminal for best results:
  Terminal 1: cd backend; dotnet watch run --project src/HospitalityPlatform.Api
  Terminal 2: cd frontend; npm run dev

"@

# Check if backend directory exists
$backendPath = Join-Path $PSScriptRoot "..\backend"
if (!(Test-Path "$backendPath\src\HospitalityPlatform.Api")) {
    Write-Host "ERROR: Backend project not found at $backendPath" -ForegroundColor Red
    exit 1
}

# Check if frontend directory exists
$frontendPath = Join-Path $PSScriptRoot "..\frontend"
if (!(Test-Path "$frontendPath\package.json")) {
    Write-Host "ERROR: Frontend project not found at $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

# Start backend in new window with watch mode
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend starting in watch mode...'; dotnet watch run --project src/HospitalityPlatform.Api" -WindowStyle Normal

# Start frontend in new window
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend starting...'; npm run dev" -WindowStyle Normal

Write-Host "Both services launched in separate windows."
Write-Host "Check each window for status."
Write-Host ""
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
