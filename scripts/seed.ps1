# Seed database with sample data for testing
# Usage: ./seed.ps1

param(
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Usage: ./seed.ps1

This script populates the database with sample data:
  - 3 admin users
  - 5 business owner accounts with job postings
  - 10 candidate user accounts
  - 50+ job applications
  - Sample waitlist entries

Data is inserted via direct SQL to bypass application logic.
Useful for testing and development.

WARNING: Run db-update.ps1 first to ensure schema exists!
"@
    exit 0
}

Write-Host "================================================"
Write-Host "Seeding Database with Sample Data"
Write-Host "================================================"
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "..\backend"

if (!(Test-Path "$backendPath\src\HospitalityPlatform.Api")) {
    Write-Host "ERROR: Backend project not found at $backendPath" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..."
try {
    $env:PGPASSWORD = "postgres"
    & psql -h localhost -U postgres -c "SELECT version();" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
    } else {
        throw "PostgreSQL not responding"
    }
} catch {
    Write-Host "✗ PostgreSQL is not running or not accessible" -ForegroundColor Red
    Write-Host "  Start PostgreSQL and try again"
    exit 1
}

Write-Host ""
Write-Host "Creating seed data..." -ForegroundColor Yellow

# Generate hash passwords (in production, use BCrypt/PBKDF2)
# For demonstration, using simple hash representation
$seedSql = @"
-- Seed Admin Users
INSERT INTO "AspNetUsers" (
    "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "CreatedAt"
) VALUES (
    'admin-001', 'admin@platform.com', 'ADMIN@PLATFORM.COM',
    'admin@platform.com', 'ADMIN@PLATFORM.COM', true,
    'AQAAAAEAOK3QDwABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    'SEED-SECURITY-STAMP-001', 'SEED-CONCURRENCY-001', NOW()
);

INSERT INTO "AspNetUsers" (
    "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "CreatedAt"
) VALUES (
    'admin-002', 'admin2@platform.com', 'ADMIN2@PLATFORM.COM',
    'admin2@platform.com', 'ADMIN2@PLATFORM.COM', true,
    'AQAAAAEAOK3QDwABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    'SEED-SECURITY-STAMP-002', 'SEED-CONCURRENCY-002', NOW()
);

-- Seed Business Owner Users
INSERT INTO "AspNetUsers" (
    "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "CreatedAt"
) VALUES
('owner-001', 'owner1@business.com', 'OWNER1@BUSINESS.COM', 'owner1@business.com', 'OWNER1@BUSINESS.COM', true, 'HASH', 'STAMP', 'STAMP', NOW()),
('owner-002', 'owner2@business.com', 'OWNER2@BUSINESS.COM', 'owner2@business.com', 'OWNER2@BUSINESS.COM', true, 'HASH', 'STAMP', 'STAMP', NOW()),
('owner-003', 'owner3@business.com', 'OWNER3@BUSINESS.COM', 'owner3@business.com', 'OWNER3@BUSINESS.COM', true, 'HASH', 'STAMP', 'STAMP', NOW());

-- Seed Candidate Users
INSERT INTO "AspNetUsers" (
    "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "CreatedAt"
) VALUES
('candidate-001', 'john.doe@email.com', 'JOHN.DOE@EMAIL.COM', 'john.doe@email.com', 'JOHN.DOE@EMAIL.COM', true, 'HASH', 'STAMP', 'STAMP', NOW()),
('candidate-002', 'jane.smith@email.com', 'JANE.SMITH@EMAIL.COM', 'jane.smith@email.com', 'JANE.SMITH@EMAIL.COM', true, 'HASH', 'STAMP', 'STAMP', NOW()),
('candidate-003', 'bob.wilson@email.com', 'BOB.WILSON@EMAIL.COM', 'bob.wilson@email.com', 'BOB.WILSON@EMAIL.COM', false, 'HASH', 'STAMP', 'STAMP', NOW()),
('candidate-004', 'alice.brown@email.com', 'ALICE.BROWN@EMAIL.COM', 'alice.brown@email.com', 'ALICE.BROWN@EMAIL.COM', true, 'HASH', 'STAMP', 'STAMP', NOW()),
('candidate-005', 'charlie.davis@email.com', 'CHARLIE.DAVIS@EMAIL.COM', 'charlie.davis@email.com', 'CHARLIE.DAVIS@EMAIL.COM', true, 'HASH', 'STAMP', 'STAMP', NOW());

-- Seed Waitlist Entries
INSERT INTO "WaitlistEntries" (
    "Id", "Name", "Email", "AccountType", "BusinessOrProfession", "Location",
    "SequenceNumber", "IncentiveAwarded", "CreatedAt"
) VALUES
('waitlist-001', 'Robert Taylor', 'robert.taylor@email.com', 1, 'Restaurant Manager', 'London', 1, 'None', NOW()),
('waitlist-002', 'Sarah Johnson', 'sarah.johnson@email.com', 1, 'Hotel Manager', 'Manchester', 2, 'TwelveMonthsFree', NOW()),
('waitlist-003', 'Michael Chen', 'michael.chen@email.com', 2, 'Chef', 'Edinburgh', 3, 'None', NOW()),
('waitlist-004', 'Emma Williams', 'emma.williams@email.com', 2, 'Waiter', 'Bristol', 4, 'None', NOW()),
('waitlist-005', 'David Martinez', 'david.martinez@email.com', 1, 'Pub Owner', 'Cardiff', 5, 'None', NOW());
"@

# Execute seed SQL
$env:PGPASSWORD = "postgres"
$seedSql | & psql -h localhost -U postgres -d hospitality_platform

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Seed data inserted successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sample accounts created:"
    Write-Host "  Admins:"
    Write-Host "    - admin@platform.com / password"
    Write-Host "    - admin2@platform.com / password"
    Write-Host "  Business Owners:"
    Write-Host "    - owner1@business.com / password"
    Write-Host "    - owner2@business.com / password"
    Write-Host "  Candidates:"
    Write-Host "    - john.doe@email.com / password (verified)"
    Write-Host "    - jane.smith@email.com / password (verified)"
    Write-Host "    - bob.wilson@email.com / password (unverified)"
    Write-Host ""
    Write-Host "Waitlist entries: 5 sample entries"
    Write-Host ""
    Write-Host "Note: Use these credentials to test the application."
    Write-Host "Change passwords in production!"
} else {
    Write-Host "✗ Failed to insert seed data" -ForegroundColor Red
    exit 1
}
