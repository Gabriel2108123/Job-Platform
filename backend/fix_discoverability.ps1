$baseUrl = "http://localhost:5000"
$password = "TestPass123!"

function Update-CandidateDiscoverability {
    param($Email, $MakeDiscoverable)
    
    Write-Host "`nProcessing: $Email" -ForegroundColor Cyan
    
    try {
        # Login
        $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{
                email    = $Email
                password = $password
            } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        
        $token = $login.token
        
        # Update map settings
        $body = @{
            workerMapEnabled         = $true
            discoverableByWorkplaces = $MakeDiscoverable
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/api/candidate/map-settings" -Method Put `
            -Headers @{ "Authorization" = "Bearer $token" } `
            -Body $body -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "  Success! Discoverable: $($result.discoverableByWorkplaces)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "=== Fixing Candidate Discoverability ===" -ForegroundColor Yellow
Write-Host "This script will enable discoverability for recently seeded candidates.`n" -ForegroundColor Gray

# We need to figure out which candidates exist
# Since we don't know the random IDs, let's try a range based on common patterns

$fixed = 0
$failed = 0

# Try various patterns of email addresses
# Pattern 1: scaletest_*_N@test.com where N is 0-19
for ($i = 0; $i -lt 20; $i++) {
    # Try a few random number variations
    foreach ($randNum in @(414134387, 123456789, 987654321)) {
        $email = "scaletest_${randNum}_$i@test.com"
        $makeDiscoverable = ($i % 5 -ne 0)  # Same logic as seeding script
        
        if (Update-CandidateDiscoverability -Email $email -MakeDiscoverable $makeDiscoverable) {
            $fixed++
            break  # Found the right pattern, move to next candidate
        }
        else {
            $failed++
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "Successfully fixed: $fixed candidates" -ForegroundColor Cyan
Write-Host "Failed attempts: $failed" -ForegroundColor Yellow

if ($fixed -eq 0) {
    Write-Host "`nNo candidates were fixed. This likely means:" -ForegroundColor Red
    Write-Host "  1. The Email pattern doesn't match the seeded candidates" -ForegroundColor Gray
    Write-Host "  2. The candidates don't exist in the database" -ForegroundColor Gray
    Write-Host "  3. The password is incorrect" -ForegroundColor Gray
    Write-Host "`nRecommendation: Re-run the seeding script fresh." -ForegroundColor Yellow
}
