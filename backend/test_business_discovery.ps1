$baseUrl = "http://localhost:5000"
$password = "TestPass123!"

function Test-Endpoint {
    param ($Url, $Method, $Body, $Token, $Description)
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
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        
        $response = Invoke-RestMethod @params
        Write-Host "  Success - Response:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3 | Write-Host
        return $response
    }
    catch {
        $msg = $_.Exception.Message
        if ($_.ErrorDetails) { 
            Write-Host "  Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red 
        }
        Write-Host "  Failed: $msg" -ForegroundColor Red
        return $null
    }
}

Write-Host "=== Business Discovery Testing ===" -ForegroundColor Yellow

# 1. Find the most recent business user from the database by listing jobs
Write-Host "`n--- Step 1: Finding Business Account ---" -ForegroundColor Blue

# Try to get a job to extract business info (we need to login as business first)
# Let's register a new business for testing
$testBizEmail = "test_biz_discovery_$(Get-Random)@test.com"
$testBizOrg = "DiscoveryTest_$(Get-Random)"

Write-Host "Registering new business account for testing..." -ForegroundColor Cyan
$regBiz = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body @{
    email            = $testBizEmail
    password         = $password
    fullName         = "Discovery Test Business"
    role             = "BusinessOwner"
    organizationName = $testBizOrg
} -Description "Registering Test Business"

if (!$regBiz) {
    Write-Host "Failed to register business. Exiting." -ForegroundColor Red
    exit 1
}

# 2. Login as Business
$loginBiz = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body @{
    email    = $testBizEmail
    password = $password
} -Description "Logging in as Business"

if (!$loginBiz) {
    Write-Host "Failed to login. Exiting." -ForegroundColor Red
    exit 1
}

$bizToken = $loginBiz.token
Write-Host "`nBusiness Token obtained!" -ForegroundColor Green

# 3. Create a job in London to test proximity search
Write-Host "`n--- Step 2: Creating Job for Proximity Testing ---" -ForegroundColor Blue

$job = Test-Endpoint -Url "$baseUrl/api/jobs" -Method Post -Body @{
    title              = "Test Discovery Job"
    description        = "Testing candidate discovery on worker map"
    location           = "Central London"
    postalCode         = "W1J 7JX"  # Mayfair, London
    roleType           = 1  # FrontOfHouse
    employmentType     = 1  # Permanent
    shiftPattern       = 1  # Day
    salaryMin          = 15
    salaryMax          = 22
    salaryPeriod       = 0  # Hour
    locationVisibility = 0  # PrivateApprox
    visibility         = 0  # Public
} -Token $bizToken -Description "Creating Job in Central London"

if (!$job) {
    Write-Host "Failed to create job. Exiting." -ForegroundColor Red
    exit 1
}

$jobId = $job.id
Write-Host "`nJob Created! ID: $jobId" -ForegroundColor Green

# 4. Test Business Discovery - Find Nearby Candidates
Write-Host "`n--- Step 3: Testing Candidate Discovery ---" -ForegroundColor Blue

$discoveryUrl = "$baseUrl/api/business-discovery/nearby-candidates?jobId=$jobId&radiusKm=50&maxResults=20"
$candidates = Test-Endpoint -Url $discoveryUrl -Method Get -Token $bizToken -Description "Finding Nearby Candidates (50km radius)"

if ($candidates) {
    Write-Host "`n=== DISCOVERY RESULTS ===" -ForegroundColor Yellow
    Write-Host "Total candidates found: $($candidates.Count)" -ForegroundColor Cyan
    
    if ($candidates.Count -gt 0) {
        Write-Host "`nCandidate Breakdown:" -ForegroundColor Cyan
        foreach ($c in $candidates) {
            Write-Host "  - Candidate ID: $($c.candidateId)" -ForegroundColor White
            Write-Host "    Distance: $($c.distanceKm) km" -ForegroundColor Gray
            Write-Host "    Network Score: $($c.networkVerificationScore)" -ForegroundColor Gray
            Write-Host "    Location: $($c.approximateLocation)" -ForegroundColor Gray
            if ($c.workExperiences) {
                Write-Host "    Work Experiences: $($c.workExperiences.Count)" -ForegroundColor Gray
            }
        }
    }
    else {
        Write-Host "`nNo candidates found within 50km radius." -ForegroundColor Yellow
        Write-Host "This could mean:" -ForegroundColor Yellow
        Write-Host "  1. No candidates have set themselves as discoverable" -ForegroundColor Gray
        Write-Host "  2. No candidates are within the search radius" -ForegroundColor Gray
        Write-Host "  3. There may be an issue with the discovery logic" -ForegroundColor Gray
    }
}
else {
    Write-Host "Failed to fetch nearby candidates." -ForegroundColor Red
}

# 5. Test Outreach Credits
Write-Host "`n--- Step 4: Checking Outreach Credits ---" -ForegroundColor Blue
$credits = Test-Endpoint -Url "$baseUrl/api/business-discovery/credits" -Method Get -Token $bizToken -Description "Getting Outreach Credits"

if ($credits) {
    Write-Host "Available Credits: $($credits.availableCredits)" -ForegroundColor Cyan
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Business Account: $testBizEmail" -ForegroundColor Gray
Write-Host "  - Job ID: $jobId" -ForegroundColor Gray
Write-Host "  - Candidates Discovered: $($candidates.Count)" -ForegroundColor Gray
Write-Host "`nYou can test the UI at: http://localhost:3000" -ForegroundColor Cyan
