$baseUrl = "http://localhost:5205"
$email = "functional_" + (Get-Random) + "@test.com"
$password = "TestPass123!"

function Test-Endpoint {
    param ($Url, $Method, $Body, $Token, $Description)
    Write-Host "Testing: $Description" -ForegroundColor Cyan
    try {
        $headers = @{}
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            ContentType = "application/json"
        }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        
        $response = Invoke-RestMethod @params
        Write-Host "  Success" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "  Failed: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
            Write-Host "  Details: $($reader.ReadToEnd())" -ForegroundColor DarkRed
        }
        return $null
    }
}

# 1. Health Check
$health = Test-Endpoint -Url "$baseUrl/health" -Method Get -Description "Health Check"
if (!$health) { return }

# 2. Register
$regBody = @{
    email = $email
    password = $password
    firstName = "Func"
    lastName = "Test"
    accountType = 0 # Candidate
}
$reg = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body $regBody -Description "Register User"

# 3. Login
$loginBody = @{ email = $email; password = $password }
$login = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body $loginBody -Description "Login"
$token = $login.token
if (!$token) { Write-Error "No token returned"; return }

# 4. Ratings Test
$ratedEntityId = [Guid]::NewGuid()
$ratingBody = @{
    ratedEntityId = $ratedEntityId
    score = 5
    comment = "Functional Test Rating"
}
$rating = Test-Endpoint -Url "$baseUrl/api/ratings" -Method Post -Body $ratingBody -Token $token -Description "Create Rating"

# Verify Average
$avg = Test-Endpoint -Url "$baseUrl/api/ratings/$ratedEntityId/average" -Method Get -Token $token -Description "Get Average Rating"
Write-Host "  Average Rating: $avg" -ForegroundColor Yellow

# 5. Job Visibility Test
# Need Business Account for creating jobs? Let's try as candidate (might fail if role restricted, usually candidates can't post)
# Register Business User
$bizEmail = "biz_" + (Get-Random) + "@test.com"
$bizRegBody = @{
    email = $bizEmail
    password = $password
    firstName = "Biz"
    lastName = "Owner"
    accountType = 1 # Business
    organizationName = "TestOrg"
}
Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body $bizRegBody -Description "Register Business User"
$bizLogin = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body @{ email = $bizEmail; password = $password } -Description "Login Business User"
$bizToken = $bizLogin.token

if ($bizToken) {
    # Create Private Job
    $jobBody = @{
        title = "Secret Job"
        description = "This is a private job"
        location = "Remote"
        salaryRange = "100k-120k"
        contactEmail = "hr@test.com"
        jobType = 0
        visibility = 1 # Private
    }
    $job = Test-Endpoint -Url "$baseUrl/api/jobs" -Method Post -Body $jobBody -Token $bizToken -Description "Create Private Job"
    
    # Search Jobs (as Candidate)
    $jobs = Test-Endpoint -Url "$baseUrl/api/jobs" -Method Get -Token $token -Description "Search Jobs (as Candidate)"
    
    $foundJob = $jobs.items | Where-Object { $_.title -eq "Secret Job" }
    if ($foundJob) {
        Write-Host "  Found Private Job in Search" -ForegroundColor Green
        if (-not $foundJob.organizationId) {
             Write-Host "  OrganizationId is Masked (Correct)" -ForegroundColor Green
        } else {
             Write-Host "  OrganizationId is Visible: $($foundJob.organizationId) (Warning)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Private Job NOT found in search (Valid if filtering logic hides it, check requirement)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping Job Test due to auth failure" -ForegroundColor Red
}

Write-Host "Functional Testing Completed" -ForegroundColor Cyan
