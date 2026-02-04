$baseUrl = "http://localhost:5000"
$password = "TestPass123!"

Write-Host "=== Checking Multiple Candidates ===" -ForegroundColor Yellow

# Check first 5 candidates
for ($i = 0; $i -lt 5; $i++) {
    $candidateEmail = "scaletest_414134387_$i@test.com"
    
    Write-Host "`n--- Candidate $i ($candidateEmail) ---" -ForegroundColor Blue
    
    try {
        $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{
                email    = $candidateEmail
                password = $password
            } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        
        $token = $login.token
        
        # Get map settings
        $mapSettings = Invoke-RestMethod -Uri "$baseUrl/api/candidate/map-settings" -Method Get -Headers @{
            "Authorization" = "Bearer $token"
        } -ErrorAction Stop
        
        Write-Host "  Worker Map Enabled: $($mapSettings.workerMapEnabled)" -ForegroundColor $(if ($mapSettings.workerMapEnabled) { "Green" } else { "Red" })
        Write-Host "  Discoverable: $($mapSettings.discoverableByWorkplaces)" -ForegroundColor $(if ($mapSettings.discoverableByWorkplaces) { "Green" } else { "Red" })
        
        # Get work experiences
        $experiences = Invoke-RestMethod -Uri "$baseUrl/api/candidate/work-experiences" -Method Get -Headers @{
            "Authorization" = "Bearer $token"
        } -ErrorAction Stop
        
        Write-Host "  Work Experiences: $($experiences.Count)" -ForegroundColor Cyan
        foreach ($exp in $experiences) {
            $hasCoords = $exp.approximateLatitude -and $exp.approximateLongitude
            Write-Host "    - $($exp.employerName) | Map: $($exp.isMapEnabled) | Coords: $hasCoords | Visibility: $($exp.visibilityLevel)" -ForegroundColor Gray
        }
        
    }
    catch {
        Write-Host "  Candidate doesn't exist or error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "If all candidates show Discoverable: False, the seeding script" -ForegroundColor Yellow
Write-Host "did not properly set the discoverability flag." -ForegroundColor Yellow
