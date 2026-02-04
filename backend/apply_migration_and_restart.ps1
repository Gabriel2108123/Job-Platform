# Apply Business Profile Migration and Restart Backend
# This script stops the backend, applies the database migration, and restarts it

Write-Host "=== Business Profile Migration Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Find and stop the running dotnet process
Write-Host "Step 1: Stopping running backend..." -ForegroundColor Yellow
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*HospitalityPlatform*" }
if ($dotnetProcesses) {
    $dotnetProcesses | Stop-Process -Force
    Write-Host "✓ Backend stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
}
else {
    Write-Host "! No backend process found (may already be stopped)" -ForegroundColor Yellow
}

# Step 2: Create and apply migration
Write-Host ""
Write-Host "Step 2: Creating database migration..." -ForegroundColor Yellow
Set-Location "d:\projects\antigravity\Job-Platform\backend"

$migrationOutput = dotnet ef migrations add AddBusinessProfileFields --project src/HospitalityPlatform.Api/HospitalityPlatform.Api.csproj --context ApplicationDbContext 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration created successfully" -ForegroundColor Green
}
else {
    Write-Host "! Migration creation result: $migrationOutput" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Applying migration to database..." -ForegroundColor Yellow
$updateOutput = dotnet ef database update --project src/HospitalityPlatform.Api/HospitalityPlatform.Api.csproj --context ApplicationDbContext 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database updated successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Database update failed: $updateOutput" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error above and fix any issues before proceeding." -ForegroundColor Yellow
    exit 1
}

# Step 4: Restart backend
Write-Host ""
Write-Host "Step 4: Restarting backend..." -ForegroundColor Yellow
Write-Host "Starting dotnet run in background..." -ForegroundColor Cyan
Write-Host ""

# Start the backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\projects\antigravity\Job-Platform\backend\src\HospitalityPlatform.Api; dotnet run"

Write-Host "✓ Backend started in new window" -ForegroundColor Green
Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "The backend is now running with the new business profile endpoints." -ForegroundColor Green
Write-Host "You can now test the business profile at: http://localhost:3000/business/profile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait about 10 seconds for the backend to fully start, then refresh your browser." -ForegroundColor Yellow
