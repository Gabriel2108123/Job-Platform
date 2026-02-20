
# Start Backend
Start-Process -FilePath "dotnet" -ArgumentList "run --project src/HospitalityPlatform.Api/HospitalityPlatform.Api.csproj" -WorkingDirectory "backend" -NoNewWindow

# Wait for backend to be ready (naive wait)
Start-Sleep -Seconds 5

# Start Frontend
Set-Location "frontend"
npm run dev
