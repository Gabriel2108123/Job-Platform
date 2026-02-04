$baseUrl = "http://localhost:5000"

# Login as business
$bizLogin = @{
    email    = "business@testhospitality.com"
    password = "TestPass123!"
} | ConvertTo-Json -Compress

try {
    $bizResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $bizLogin -ContentType 'application/json'
    $token = $bizResp.token
    $headers = @{Authorization = "Bearer $token" }
    
    Write-Output "✓ Logged in as business user"
    
    # Get jobs
    $jobs = Invoke-RestMethod -Uri "$baseUrl/api/jobs" -Headers $headers
    $jobId = $jobs[0].id
    Write-Output "✓ Found job ID: $jobId"
    
    # Test discovery with large radius
    $nearby = Invoke-RestMethod -Uri "$baseUrl/api/discovery/jobs/$jobId/nearby?radiusKm=500" -Headers $headers
    
    Write-Output "`n========== DISCOVERY RESULTS =========="
    Write-Output "Total candidates found: $($nearby.Count)"
    Write-Output ""
    
    $nearby | ForEach-Object {
        Write-Output "Candidate: $($_.name)"
        Write-Output "  Role: $($_.currentRole)"
        Write-Output "  Employer: $($_.currentEmployer)"
        Write-Output "  Distance: $($_.distanceKm) km"
        Write-Output "  User ID: $($_.candidateUserId)"
        Write-Output ""
    }
    
    # Check for duplicates
    $uniqueIds = $nearby | Select-Object -ExpandProperty candidateUserId -Unique
    Write-Output "Unique candidate IDs: $($uniqueIds.Count)"
    
    if ($nearby.Count -ne $uniqueIds.Count) {
        Write-Output "⚠️ WARNING: Duplicate candidates detected!"
    }
    
}
catch {
    Write-Output "❌ Error: $_"
    Write-Output $_.Exception.Message
}
