# Run development/production servers
# Usage: ./run.ps1 [-Backend] [-Frontend]

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Help
)

if ($Help -or (!$Backend -and !$Frontend)) {
    Write-Host @"
Usage: ./run.ps1 [options]

Options:
  -Backend           Start only the backend API
  -Frontend          Start only the frontend
  -Help              Show this help message

Examples:
  ./run.ps1 -Backend           # Start backend only
  ./run.ps1 -Frontend          # Start frontend only
  ./run.ps1 -Backend -Frontend # Start both

If no options specified, starts both services.
"@
    exit 0
}

# Default: run both if none specified
if (!$Backend -and !$Frontend) {
    $Backend = $true
    $Frontend = $true
}

Write-Host "================================================"
Write-Host "UK Hospitality Platform - Production Run"
Write-Host "================================================"
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "..\backend"
$frontendPath = Join-Path $PSScriptRoot "..\frontend"

# Start backend
if ($Backend) {
    Write-Host "[1/2] Starting Backend API..."
    Write-Host "      Location: $backendPath"
    Write-Host "      URL: http://localhost:5000"
    Write-Host ""
    
    if (Test-Path "$backendPath\src\HospitalityPlatform.Api") {
        Push-Location $backendPath
        dotnet run --project src/HospitalityPlatform.Api --configuration Release
        Pop-Location
    } else {
        Write-Host "ERROR: Backend project not found at $backendPath" -ForegroundColor Red
        exit 1
    }
}

# Start frontend
if ($Frontend) {
    Write-Host "[2/2] Starting Frontend (Next.js)..."
    Write-Host "      Location: $frontendPath"
    Write-Host "      URL: http://localhost:3000"
    Write-Host ""
    
    if (Test-Path "$frontendPath\package.json") {
        Push-Location $frontendPath
        npm start
        Pop-Location
    } else {
        Write-Host "ERROR: Frontend project not found at $frontendPath" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Application started. Press Ctrl+C to stop."
