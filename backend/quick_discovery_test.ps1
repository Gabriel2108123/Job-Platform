$baseUrl = "http://localhost:5000"
$password = "TestPass123!"

function Test-Endpoint {
    param ($Url, $Method, $Body, $Token, $Description, $ShowResponse = $false)
    Write-Host "`nTesting: $Description" -ForegroundColor Cyan
    try {
        $headers = @{}
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        
        $params = @{
            Uri         = $Url
            Method      = $Method
            Headers     = $headers
            ContentType = "application/json"
        }
        if ($Body) { 
            $jsonBody = ($Body | ConvertTo-Json -Depth 5)
            if ($ShowResponse) { Write-Host "  Request Body: $jsonBody" -ForegroundColor Gray }
            $params["Body"] = $jsonBody
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  Success" -ForegroundColor Green
        if ($ShowResponse) { 
            Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray 
        }
        return $response
    }
    catch {
        $msg = $_.Exception.Message
        if ($_.ErrorDetails) { $msg += " - $($_.ErrorDetails.Message)" }
        Write-Host "  Failed: $msg" -ForegroundColor Red
        return $null
    }
}

Write-Host "=== QUICK DISCOVERABILITY TEST ===" -ForegroundColor Yellow
Write-Host "Creating 3 test candidates with different settings`n" -ForegroundColor Gray

for ($i = 0; $i -lt 3; $i++) {
    $email = "quicktest_$i@test.com"
    $discoverable = ($i -ne 2)  # First 2 discoverable, last one not
    
    Write-Host "--- Candidate ${i}: $email (Should be discoverable: $discoverable) ---" -ForegroundColor Blue
    
    # Register
    $reg = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body @{
        email = $email; password = $password; fullName = "QuickTest-$i"; role = "Candidate"
    } -Description "Registering"
    if (!$reg) { continue }
    
    # Login
    $login = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body @{
        email = $email; password = $password
    } -Description "Logging in"
    $token = $login.token
    
    # Update Map Settings WITH LOGGING
    Write-Host "  Setting map settings..." -ForegroundColor Cyan
    $mapResult = Test-Endpoint -Url "$baseUrl/api/candidate/map-settings" -Method Put -Body @{
        workerMapEnabled         = $true
        discoverableByWorkplaces = $discoverable
    } -Token $token -Description "Updating Map Settings" -ShowResponse $true
    
    # Verify by reading back
    Write-Host "  Verifying settings..." -ForegroundColor Cyan
    $verify = Test-Endpoint -Url "$baseUrl/api/candidate/map-settings" -Method Get -Token $token -Description "Reading Map Settings Back" -ShowResponse $true
    
    if ($verify.discoverableByWorkplaces -eq $discoverable) {
        Write-Host "  VERIFIED: Discoverability correctly set!" -ForegroundColor Green
    }
    else {
        Write-Host "  ERROR: Expected $discoverable but got $($verify.discoverableByWorkplaces)" -ForegroundColor Red
    }
    
    # Add work experience in London
    Test-Endpoint -Url "$baseUrl/api/candidate/work-experiences" -Method Post -Body @{
        employerName    = "Test Restaurant $i"
        roleTitle       = "Test Role"
        locationText    = "London, UK"
        postalCode      = "W1J 7JX"
        city            = "London"
        description     = "Test experience"
        startDate       = "2022-01-01"
        endDate         = "2024-12-31"
        isMapEnabled    = $true
        visibilityLevel = "public"
    } -Token $token -Description "Adding Work Experience"
}

Write-Host "`n=== TESTING BUSINESS DISCOVERY ===" -ForegroundColor Yellow

# Create business
$bizEmail = "quicktest_biz@test.com"
$regBiz = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body @{
    email = $bizEmail; password = $password; fullName = "Test Business"; 
    role = "BusinessOwner"; organizationName = "QuickTest Corp"
} -Description "Registering Business"

$loginBiz = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body @{
    email = $bizEmail; password = $password
} -Description "Logging in as Business"
$bizToken = $loginBiz.token

# Create job
$job = Test-Endpoint -Url "$baseUrl/api/jobs" -Method Post -Body @{
    title = "Test Job"; description = "Testing"; location = "London"; postalCode = "W1J 7JX"
    roleType = 1; employmentType = 1; shiftPattern = 1; salaryMin = 15; salaryMax = 20
    salaryPeriod = 0; locationVisibility = 0; visibility = 0
} -Token $bizToken -Description "Creating Job"

Write-Host "`nSearching for candidates..." -ForegroundColor Cyan
$candidates = Test-Endpoint -Url "$baseUrl/api/business/discovery/nearby/$($job.id)?radiusKm=50" `
    -Method Get -Token $bizToken -Description "Finding Nearby Candidates" -ShowResponse $true

Write-Host "`n=== RESULTS ===" -ForegroundColor Green
Write-Host "Expected: 2 discoverable candidates" -ForegroundColor Yellow
Write-Host "Found: $($candidates.Count) candidates" -ForegroundColor Cyan

if ($candidates.Count -eq 2) {
    Write-Host "SUCCESS! Discovery is working correctly!" -ForegroundColor Green
}
elseif ($candidates.Count -eq 0) {
    Write-Host "ISSUE: No candidates found. Possible problems:" -ForegroundColor Red
    Write-Host "  1. Distance calculation not working" -ForegroundColor Gray
    Write-Host "  2. Work experiences don't have coordinates" -ForegroundColor Gray
    Write-Host "  3. Business discovery query has a bug" -ForegroundColor Gray
}
else {
    Write-Host "PARTIAL: Found $($candidates.Count) candidates (expected 2)" -ForegroundColor Yellow
}
