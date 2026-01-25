-- Seed Organizations (if not exists)
INSERT INTO "Organizations" (
    "Id", "Name", "OwnerId", "CreatedAt"
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hospitality Heroes', 'owner-001', NOW()
) ON CONFLICT ("Id") DO NOTHING;

-- Seed Jobs
INSERT INTO "Jobs" (
    "Id", "OrganizationId", "CreatedByUserId", "Title", "Description",
    "RoleType", "EmploymentType", "ShiftPattern", 
    "SalaryMin", "SalaryMax", "SalaryCurrency", "SalaryPeriod",
    "Location", "Status", "PublishedAt", "CreatedAt", "Visibility"
) VALUES 
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner-001', 
    'Head Barista', 'Experienced barista needed for busy cafe in central London.',
    1, 1, 1, -- FullTime, Day
    28000, 32000, 'GBP', 1, -- Annual
    'London', 2, NOW(), NOW(), 1 -- Published, Public
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner-001', 
    'Sous Chef', 'Join our award-winning kitchen team.',
    2, 1, 2, -- FullTime, Mixed
    35000, 40000, 'GBP', 1,
    'Manchester', 2, NOW(), NOW(), 1
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner-001', 
    'Hotel Receptionist', 'Luxury hotel requires front desk staff.',
    3, 1, 2, 
    24000, 26000, 'GBP', 1,
    'Edinburgh', 2, NOW(), NOW(), 1
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner-001', 
    'Bartender', 'Cocktail experience preferred.',
    1, 2, 3, -- PartTime, Night
    12.50, 15.00, 'GBP', 2, -- Hourly
    'Bristol', 2, NOW(), NOW(), 1
),
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner-001', 
    'Waiter / Waitress', 'Seasonal staff for seafront restaurant.',
    3, 4, 2, -- Temporary, Mixed
    11.50, 13.00, 'GBP', 2,
    'Brighton', 2, NOW(), NOW(), 1
)
ON CONFLICT ("Id") DO NOTHING;
