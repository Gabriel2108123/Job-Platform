$baseUrl = "http://localhost:5000"
$password = "TestPass123!"

Write-Host "=== Diagnosing Candidate Discovery Issue ===" -ForegroundColor Yellow

# 1. Login as one of the seeded candidates to check their map settings
$candidateEmail = "scaletest_414134387_0@test.com"  # First candidate from seeding

Write-Host "`n--- Checking Candidate Map Settings ---" -ForegroundColor Blue

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{
            email    = $candidateEmail
            password = $password
        } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "Logged in as: $candidateEmail" -ForegroundColor Green
    $token = $login.token
    
    # Get candidate's map settings
    Write-Host "`nFetching map settings..." -ForegroundColor Cyan
    $mapSettings = Invoke-RestMethod -Uri "$baseUrl/api/candidate/map-settings" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "Map Settings:" -ForegroundColor Cyan
    $mapSettings | ConvertTo-Json -Depth 2 | Write-Host
    
    # Get candidate's work experiences
    Write-Host "`nFetching work experiences..." -ForegroundColor Cyan
    $experiences = Invoke-RestMethod -Uri "$baseUrl/api/candidate/work-experiences" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "`nWork Experiences Count: $($experiences.Count)" -ForegroundColor Cyan
    foreach ($exp in $experiences) {
        Write-Host "  - $($exp.roleTitle) at $($exp.employerName)" -ForegroundColor White
        Write-Host "    Location: $($exp.city), $($exp.postalCode)" -ForegroundColor Gray
        Write-Host "    Map Enabled: $($exp.isMapEnabled)" -ForegroundColor Gray
        Write-Host "    Visibility: $($exp.visibilityLevel)" -ForegroundColor Gray
        Write-Host "    Lat/Lng: $($exp.approximateLatitude), $($exp.approximateLongitude)" -ForegroundColor Gray
    }
    
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Candidate may not exist or credentials are wrong" -ForegroundColor Yellow
}

# 2. Test with a known London-based search
Write-Host "`n--- Testing Direct Database Query ---" -ForegroundColor Blue
Write-Host "Note: This would require direct database access" -ForegroundColor Gray
Write-Host "The issue could be:" -ForegroundColor Yellow
Write-Host "  1. Candidates don't have lat/lng coordinates set" -ForegroundColor Gray
Write-Host "  2. DiscoverableByWorkplaces is false for all" -ForegroundColor Gray
Write-Host "  3. Distance calculation is not working" -ForegroundColor Gray
Write-Host "  4. The BusinessDiscovery service has a bug" -ForegroundColor Gray

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Green
