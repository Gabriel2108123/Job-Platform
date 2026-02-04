$baseUrl = "http://localhost:5000"
$password = "TestPass123!"

function Test-Endpoint {
    param ($Url, $Method, $Body, $Token, $Description)
    Write-Host "Testing: $Description" -ForegroundColor Cyan
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
        Write-Host "  Success" -ForegroundColor Green
        return $response
    }
    catch {
        $msg = $_.Exception.Message
        if ($_.Exception.InnerException) { $msg += " ($($_.Exception.InnerException.Message))" }
        Write-Host "  Failed: $msg" -ForegroundColor Red
        return $null
    }
}

# 1. Register 20 Candidates across UK cities with diverse experiences
$locations = @(
    @{ City = "London"; PC = "EC1A 1BB"; Role = "Head Chef"; Emp = "The Ritz"; Exp2 = @{ Role = "Sous Chef"; Emp = "Gordon Ramsay" } },
    @{ City = "London"; PC = "W1J 7JX"; Role = "Sous Chef"; Emp = "Claridge's"; Exp2 = @{ Role = "Chef de Partie"; Emp = "The Savoy" } },
    @{ City = "London"; PC = "SE1 9SG"; Role = "Waiter"; Emp = "The Shard"; Exp2 = @{ Role = "Bartender"; Emp = "Aqua Shard" } },
    @{ City = "London"; PC = "SW1A 1AA"; Role = "Concierge"; Emp = "The Dorchester"; Exp2 = $null },
    @{ City = "Manchester"; PC = "M1 1AG"; Role = "Bar Manager"; Emp = "Albert's Schloss"; Exp2 = @{ Role = "Head Bartender"; Emp = "Cloud 23" } },
    @{ City = "Manchester"; PC = "M4 3AB"; Role = "Mixologist"; Emp = "The Alchemist"; Exp2 = $null },
    @{ City = "Manchester"; PC = "M2 5DB"; Role = "Restaurant Manager"; Emp = "Hawksmoor"; Exp2 = @{ Role = "Assistant Manager"; Emp = "Dishoom" } },
    @{ City = "Birmingham"; PC = "B1 1BB"; Role = "Concierge"; Emp = "The Grand Hotel"; Exp2 = $null },
    @{ City = "Birmingham"; PC = "B15 1TR"; Role = "Receptionist"; Emp = "Edgbaston Park"; Exp2 = @{ Role = "Front Desk"; Emp = "Hyatt Regency" } },
    @{ City = "Edinburgh"; PC = "EH1 1RE"; Role = "Sommelier"; Emp = "The Witchery"; Exp2 = @{ Role = "Wine Specialist"; Emp = "The Kitchin" } },
    @{ City = "Edinburgh"; PC = "EH2 4BA"; Role = "Executive Chef"; Emp = "The Balmoral"; Exp2 = $null },
    @{ City = "Glasgow"; PC = "G1 2LL"; Role = "Chef de Partie"; Emp = "Gamba"; Exp2 = @{ Role = "Commis Chef"; Emp = "Ubiquitous Chip" } },
    @{ City = "Glasgow"; PC = "G2 4JR"; Role = "Hotel Manager"; Emp = "Blythswood Square"; Exp2 = $null },
    @{ City = "Bristol"; PC = "BS1 1HT"; Role = "General Manager"; Emp = "The Bristol"; Exp2 = @{ Role = "Operations Manager"; Emp = "Hotel du Vin" } },
    @{ City = "Bristol"; PC = "BS8 1TG"; Role = "Event Coordinator"; Emp = "Clifton Observatory"; Exp2 = $null },
    @{ City = "Liverpool"; PC = "L1 8JQ"; Role = "Pastry Chef"; Emp = "Hope Street Hotel"; Exp2 = @{ Role = "Bakery Chef"; Emp = "The Art School" } },
    @{ City = "Liverpool"; PC = "L2 8TD"; Role = "Banquet Manager"; Emp = "Titanic Hotel"; Exp2 = $null },
    @{ City = "Leeds"; PC = "LS1 2HT"; Role = "Housekeeping"; Emp = "The Queens Hotel"; Exp2 = @{ Role = "Room Attendant"; Emp = "Dakota Leeds" } },
    @{ City = "Leeds"; PC = "LS1 5JG"; Role = "Spa Manager"; Emp = "Malmaison Leeds"; Exp2 = $null },
    @{ City = "Brighton"; PC = "BN1 1AE"; Role = "Beach Bar Manager"; Emp = "The Grand Brighton"; Exp2 = @{ Role = "Bartender"; Emp = "Bohemia" } }
)

Write-Host "--- Seeding Candidates ---" -ForegroundColor Blue

for ($i = 0; $i -lt $locations.Count; $i++) {
    $loc = $locations[$i]
    $email = "scaletest_$(Get-Random)_$($i)@test.com"
    $name = "Worker-$($i)"
    
    # Register
    $reg = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body @{
        email = $email; password = $password; fullName = $name; role = "Candidate"
    } -Description "Registering $email"
    if (!$reg) { continue }
    
    # Login
    $login = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body @{
        email = $email; password = $password
    } -Description "Logging in $email"
    $token = $login.token
    
    # Update Map Settings (Varied discoverability - 80% discoverable, 20% private)
    $discoverable = ($i % 5 -ne 0) # 4/5 are discoverable
    Test-Endpoint -Url "$baseUrl/api/candidate/map-settings" -Method Put -Body @{
        workerMapEnabled = $true; discoverableByWorkplaces = $discoverable
    } -Token $token -Description "Setting Discoverable=$discoverable"
    
    # Add Primary Work Experience with varied visibility
    # Rotates through: public, applied_only, private, public, applied_only...
    $visibilityLevels = @("public", "applied_only", "private")
    $visibility = $visibilityLevels[$i % 3]
    
    Test-Endpoint -Url "$baseUrl/api/candidate/work-experiences" -Method Post -Body @{
        employerName = $loc.Emp; roleTitle = $loc.Role; locationText = "$($loc.City), UK"; 
        postalCode = $loc.PC; city = $loc.City; description = "Scale test: $($loc.Role) at $($loc.Emp)";
        startDate = "2022-01-01"; endDate = "2024-12-31"; isMapEnabled = $true; visibilityLevel = $visibility
    } -Token $token -Description "Adding Experience at $($loc.Emp) (Visibility: $visibility)"
    
    # Add Second Work Experience if defined
    if ($loc.Exp2) {
        $exp2Visibility = $visibilityLevels[($i + 1) % 3] # Different visibility for variety
        Test-Endpoint -Url "$baseUrl/api/candidate/work-experiences" -Method Post -Body @{
            employerName = $loc.Exp2.Emp; roleTitle = $loc.Exp2.Role; locationText = "$($loc.City), UK"; 
            postalCode = $loc.PC; city = $loc.City; description = "Previous role at $($loc.Exp2.Emp)";
            startDate = "2020-01-01"; endDate = "2021-12-31"; isMapEnabled = $true; visibilityLevel = $exp2Visibility
        } -Token $token -Description "Adding 2nd Experience at $($loc.Exp2.Emp) (Visibility: $exp2Visibility)"
    }
}

# 2. Register Business & Create Job in London
Write-Host "--- Seeding Business ---" -ForegroundColor Blue
$runId = Get-Random
$bizEmail = "scale_biz_$runId@test.com"
$bizOrg = "ScaleRecruitment_$runId"

$regBiz = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method Post -Body @{
    email = $bizEmail; password = $password; fullName = "Scale Business"; role = "BusinessOwner"; organizationName = $bizOrg
} -Description "Registering Business ($bizOrg)"

$loginBiz = Test-Endpoint -Url "$baseUrl/api/auth/login" -Method Post -Body @{
    email = $bizEmail; password = $password
} -Description "Logging in Business"
$bizToken = $loginBiz.token

# Create Job with all required fields
$job = Test-Endpoint -Url "$baseUrl/api/jobs" -Method Post -Body @{
    title              = "Luxury Event Staff ($runId)"; 
    description        = "We are looking for hospitality professionals to join our network for upcoming events in Central London.";
    location           = "Mayfair, London"; 
    postalCode         = "W1J 7JX"; 
    roleType           = 1; # FrontOfHouse
    employmentType     = 1; # Permanent
    shiftPattern       = 1; # Day
    salaryMin          = 15; 
    salaryMax          = 20; 
    salaryPeriod       = 0; # Hour
    locationVisibility = 0; # PrivateApprox
    visibility         = 0; # Public
} -Token $bizToken -Description "Creating Job in London"

Write-Host "`nSeeding Complete." -ForegroundColor Green
if ($job) {
    Write-Host "Job ID: $($job.id)" -ForegroundColor Yellow
    Write-Host "Test your map at: http://localhost:3000/jobs/$($job.id)" -ForegroundColor Cyan
}
