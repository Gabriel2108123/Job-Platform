$baseUrl = "http://localhost:5000"

Write-Host "=== Simple Business Discovery Test ===" -ForegroundColor Yellow

# Use existing seeded business from the initial run
$bizEmail = Read-Host "Enter business email (or press Enter for scale_biz_@test.com pattern)"
if ([string]::IsNullOrWhiteSpace($bizEmail)) {
    Write-Host "Please check the seeding output for the exact business email created." -ForegroundColor Yellow
    Write-Host "Pattern is: scale_biz_RANDOMNUMBER@test.com" -ForegroundColor Gray
    exit 1
}

$password = "TestPass123!"

try {
    # Login
    Write-Host "`nLogging in as business..." -ForegroundColor Cyan
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{
            email    = $bizEmail
            password = $password
        } | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "Login successful!" -ForegroundColor Green
    $token = $login.token
    
    # Get jobs
    Write-Host "`nFetching jobs..." -ForegroundColor Cyan
    $jobs = Invoke-RestMethod -Uri "$baseUrl/api/jobs" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    if ($jobs.Count -eq 0) {
        Write-Host "No jobs found. Please create a job first." -ForegroundColor Red
        exit 1
    }
    
    $jobId = $jobs[0].id
    Write-Host "Using Job ID: $jobId" -ForegroundColor Cyan
    Write-Host "Job Title: $($jobs[0].title)" -ForegroundColor Gray
    Write-Host "Job Location: $($jobs[0].location), $($jobs[0].postalCode)" -ForegroundColor Gray
    
    # Test discovery endpoint
    Write-Host "`nTesting nearby candidates discovery..." -ForegroundColor Cyan
    $url = "$baseUrl/api/business/discovery/nearby/$jobId`?radiusKm=100"
    Write-Host "URL: $url" -ForegroundColor Gray
    
    $candidates = Invoke-RestMethod -Uri $url -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "`n=== DISCOVERY RESULTS ===" -ForegroundColor Green
    Write-Host "Candidates found: $($candidates.Count)" -ForegroundColor Cyan
    
    if ($candidates.Count -gt 0) {
        Write-Host "`nCandidate Details:" -ForegroundColor Yellow
        foreach ($c in $candidates) {
            Write-Host "  - Candidate ID: $($c.candidateId)" -ForegroundColor White
            Write-Host "    Distance: $($c.distanceKm) km" -ForegroundColor Gray
            Write-Host "    Network Score: $($c.networkVerificationScore)" -ForegroundColor Gray
            if ($c.approximateLocation) {
                Write-Host "    Location: $($c.approximateLocation)" -ForegroundColor Gray
            }
        }
        Write-Host "`nSUCCESS! Discovery feature is working!" -ForegroundColor Green
    }
    else {
        Write-Host "`nNo candidates found. This could mean:" -ForegroundColor Yellow
        Write-Host "  1. No candidates have discoverable map settings enabled" -ForegroundColor Gray
        Write-Host "  2. No candidates are within 100km of the job location" -ForegroundColor Gray
        Write-Host "  3. No candidates have work experience coordinates" -ForegroundColor Gray
    }
    
}
catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
