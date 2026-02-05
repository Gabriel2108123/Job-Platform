-- Seed Job Roles for Hospitality Platform
-- Generated: 2026-02-05
-- 19 Departments, 150+ Roles

INSERT INTO "JobRoles" ("Id", "Name", "Department", "DisplayOrder", "IsActive", "CreatedAt", "UpdatedAt", "IsDeleted")
VALUES
-- 1. EXECUTIVE & SENIOR MANAGEMENT
(gen_random_uuid(), 'Chairman', 'Executive & Senior Management', 1, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Chief Executive Officer (CEO)', 'Executive & Senior Management', 2, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Managing Director', 'Executive & Senior Management', 3, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Director', 'Executive & Senior Management', 4, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Operations Director', 'Executive & Senior Management', 5, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Technical Director', 'Executive & Senior Management', 6, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Finance Director', 'Executive & Senior Management', 7, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Chief Financial Officer (CFO)', 'Executive & Senior Management', 8, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Group Financial Controller', 'Executive & Senior Management', 9, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Corporate Development Manager', 'Executive & Senior Management', 10, true, NOW(), NOW(), false),

-- 2. GENERAL MANAGEMENT & OPERATIONS
(gen_random_uuid(), 'General Manager', 'General Management & Operations', 11, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Assistant General Manager', 'General Management & Operations', 12, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Operations Manager', 'General Management & Operations', 13, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Operational Manager', 'General Management & Operations', 14, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Duty Manager', 'General Management & Operations', 15, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Deputy Manager', 'General Management & Operations', 16, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Night Manager', 'General Management & Operations', 17, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Venue Manager', 'General Management & Operations', 18, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Marina Manager', 'General Management & Operations', 19, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Household / Estate Manager', 'General Management & Operations', 20, true, NOW(), NOW(), false),

-- 3. FINANCE, ACCOUNTS & PAYROLL
(gen_random_uuid(), 'Finance Manager', 'Finance, Accounts & Payroll', 21, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Financial Controller', 'Finance, Accounts & Payroll', 22, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Financial Analyst', 'Finance, Accounts & Payroll', 23, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Accountant', 'Finance, Accounts & Payroll', 24, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Accounts Administrator', 'Finance, Accounts & Payroll', 25, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Payroll Officer', 'Finance, Accounts & Payroll', 26, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Payroll & Crew Payroll Manager', 'Finance, Accounts & Payroll', 27, true, NOW(), NOW(), false),

-- 4. HUMAN RESOURCES & RECRUITMENT
(gen_random_uuid(), 'Human Resources Manager', 'Human Resources & Recruitment', 28, true, NOW(), NOW(), false),
(gen_random_uuid(), 'HR Administrator', 'Human Resources & Recruitment', 29, true, NOW(), NOW(), false),
(gen_random_uuid(), 'HR Assistant', 'Human Resources & Recruitment', 30, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Recruitment Consultant', 'Human Resources & Recruitment', 31, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Crew Manager', 'Human Resources & Recruitment', 32, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Crew Administrator', 'Human Resources & Recruitment', 33, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Training Manager', 'Human Resources & Recruitment', 34, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Training Coordinator', 'Human Resources & Recruitment', 35, true, NOW(), NOW(), false),

-- 5. SALES, BUSINESS DEVELOPMENT & CLIENT RELATIONS
(gen_random_uuid(), 'Sales Manager', 'Sales, Business Development & Client Relations', 36, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Senior Sales Executive', 'Sales, Business Development & Client Relations', 37, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Sales Executive', 'Sales, Business Development & Client Relations', 38, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Business Development Manager', 'Sales, Business Development & Client Relations', 39, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Client Relations Manager', 'Sales, Business Development & Client Relations', 40, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Partnerships Manager', 'Sales, Business Development & Client Relations', 41, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Listings Manager', 'Sales, Business Development & Client Relations', 42, true, NOW(), NOW(), false),

-- 6. MARKETING, BRAND & DIGITAL
(gen_random_uuid(), 'Marketing Manager', 'Marketing, Brand & Digital', 43, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Marketing Executive', 'Marketing, Brand & Digital', 44, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Marketing Assistant', 'Marketing, Brand & Digital', 45, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Digital Marketer / SEO', 'Marketing, Brand & Digital', 46, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Social Media Manager', 'Marketing, Brand & Digital', 47, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Content Writer', 'Marketing, Brand & Digital', 48, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Graphic Designer', 'Marketing, Brand & Digital', 49, true, NOW(), NOW(), false),
(gen_random_uuid(), 'PR & Communications Officer', 'Marketing, Brand & Digital', 50, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Videographer', 'Marketing, Brand & Digital', 51, true, NOW(), NOW(), false),

-- 7. FRONT OFFICE, GUEST SERVICES & TRAVEL
(gen_random_uuid(), 'Front Office Manager', 'Front Office, Guest Services & Travel', 52, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Assistant Front Office Manager', 'Front Office, Guest Services & Travel', 53, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Receptionist / Front Desk Agent', 'Front Office, Guest Services & Travel', 54, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Concierge', 'Front Office, Guest Services & Travel', 55, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Guest Relations Officer', 'Front Office, Guest Services & Travel', 56, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Reservation Agent', 'Front Office, Guest Services & Travel', 57, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Customer Service Agent', 'Front Office, Guest Services & Travel', 58, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Travel Agent', 'Front Office, Guest Services & Travel', 59, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Lounge Manager', 'Front Office, Guest Services & Travel', 60, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Lounge Attendant', 'Front Office, Guest Services & Travel', 61, true, NOW(), NOW(), false),

-- 8. FOOD & BEVERAGE - SERVICE
(gen_random_uuid(), 'Food & Beverage Manager', 'Food & Beverage - Service', 62, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Restaurant Manager', 'Food & Beverage - Service', 63, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Assistant Restaurant Manager', 'Food & Beverage - Service', 64, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Banquet Manager', 'Food & Beverage - Service', 65, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Banquet Supervisor', 'Food & Beverage - Service', 66, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Banquet Server', 'Food & Beverage - Service', 67, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Head Waiter / Maitre d''', 'Food & Beverage - Service', 68, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Waiter / Waitress', 'Food & Beverage - Service', 69, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Host / Hostess', 'Food & Beverage - Service', 70, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Sommelier', 'Food & Beverage - Service', 71, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Bar Manager', 'Food & Beverage - Service', 72, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Head Bartender', 'Food & Beverage - Service', 73, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Bartender', 'Food & Beverage - Service', 74, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Mixologist', 'Food & Beverage - Service', 75, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Barback', 'Food & Beverage - Service', 76, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Mini-Bar Attendant', 'Food & Beverage - Service', 77, true, NOW(), NOW(), false),

-- 9. CULINARY & KITCHEN
(gen_random_uuid(), 'Executive Chef', 'Culinary & Kitchen', 78, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Head Chef', 'Culinary & Kitchen', 79, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Senior Sous Chef', 'Culinary & Kitchen', 80, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Sous Chef', 'Culinary & Kitchen', 81, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Junior Sous Chef', 'Culinary & Kitchen', 82, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Senior Chef De Partie', 'Culinary & Kitchen', 83, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Chef de Partie', 'Culinary & Kitchen', 84, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Junior Chef De Partie', 'Culinary & Kitchen', 85, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Commis Chef', 'Culinary & Kitchen', 86, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Line Cook', 'Culinary & Kitchen', 87, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Prep Cook', 'Culinary & Kitchen', 88, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Pastry Chef', 'Culinary & Kitchen', 89, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Baker', 'Culinary & Kitchen', 90, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Butcher', 'Culinary & Kitchen', 91, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Kitchen Porter', 'Culinary & Kitchen', 92, true, NOW(), NOW(), false),

-- 10. HOUSEKEEPING & INTERIOR
(gen_random_uuid(), 'Executive Housekeeper', 'Housekeeping & Interior', 93, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Head of Housekeeping', 'Housekeeping & Interior', 94, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Housekeeping Supervisor', 'Housekeeping & Interior', 95, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Room Attendant / Chambermaid', 'Housekeeping & Interior', 96, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Public Area Cleaner', 'Housekeeping & Interior', 97, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Laundry Manager', 'Housekeeping & Interior', 98, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Laundry Attendant', 'Housekeeping & Interior', 99, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Linen Room Attendant', 'Housekeeping & Interior', 100, true, NOW(), NOW(), false),

-- 11. SPA, WELLNESS & LEISURE
(gen_random_uuid(), 'Spa Manager', 'Spa, Wellness & Leisure', 101, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Spa Therapist', 'Spa, Wellness & Leisure', 102, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Massage Therapist', 'Spa, Wellness & Leisure', 103, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Personal Trainer', 'Spa, Wellness & Leisure', 104, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Fitness Instructor', 'Spa, Wellness & Leisure', 105, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Yoga / Pilates Instructor', 'Spa, Wellness & Leisure', 106, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Lifeguard', 'Spa, Wellness & Leisure', 107, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Pool Attendant', 'Spa, Wellness & Leisure', 108, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Kids Club Attendant', 'Spa, Wellness & Leisure', 109, true, NOW(), NOW(), false),

-- 12. ENTERTAINMENT, EVENTS & ACTIVITIES
(gen_random_uuid(), 'Entertainment Director', 'Entertainment, Events & Activities', 110, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Cruise Director', 'Entertainment, Events & Activities', 111, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Activities Coordinator', 'Entertainment, Events & Activities', 112, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Event Planner', 'Entertainment, Events & Activities', 113, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Event Coordinator', 'Entertainment, Events & Activities', 114, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Wedding Planner', 'Entertainment, Events & Activities', 115, true, NOW(), NOW(), false),
(gen_random_uuid(), 'DJ', 'Entertainment, Events & Activities', 116, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Live Musician', 'Entertainment, Events & Activities', 117, true, NOW(), NOW(), false),
(gen_random_uuid(), 'AV Technician', 'Entertainment, Events & Activities', 118, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Tour Guide', 'Entertainment, Events & Activities', 119, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Tour Manager', 'Entertainment, Events & Activities', 120, true, NOW(), NOW(), false),

-- 13. SECURITY & SAFETY
(gen_random_uuid(), 'Security Manager', 'Security & Safety', 121, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Security Officer', 'Security & Safety', 122, true, NOW(), NOW(), false),
(gen_random_uuid(), 'CCTV Operator', 'Security & Safety', 123, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Surveillance Operator', 'Security & Safety', 124, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Close Protection Officer', 'Security & Safety', 125, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Ship / Venue Security Officer', 'Security & Safety', 126, true, NOW(), NOW(), false),

-- 14. MARITIME & CRUISE OPERATIONS
(gen_random_uuid(), 'Captain', 'Maritime & Cruise Operations', 127, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Chief Officer / First Mate', 'Maritime & Cruise Operations', 128, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Deck Officer', 'Maritime & Cruise Operations', 129, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Bosun', 'Maritime & Cruise Operations', 130, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Deckhand', 'Maritime & Cruise Operations', 131, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Able Seaman', 'Maritime & Cruise Operations', 132, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Ordinary Seaman', 'Maritime & Cruise Operations', 133, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Purser', 'Maritime & Cruise Operations', 134, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Assistant Purser', 'Maritime & Cruise Operations', 135, true, NOW(), NOW(), false),

-- 15. ENGINEERING & TECHNICAL
(gen_random_uuid(), 'Chief Engineer', 'Engineering & Technical', 136, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Engineer', 'Engineering & Technical', 137, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Maintenance Technician', 'Engineering & Technical', 138, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Electrician', 'Engineering & Technical', 139, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Plumber', 'Engineering & Technical', 140, true, NOW(), NOW(), false),
(gen_random_uuid(), 'HVAC Technician', 'Engineering & Technical', 141, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Mechanic', 'Engineering & Technical', 142, true, NOW(), NOW(), false),

-- 16. IT & SYSTEMS
(gen_random_uuid(), 'IT Manager', 'IT & Systems', 143, true, NOW(), NOW(), false),
(gen_random_uuid(), 'IT Officer', 'IT & Systems', 144, true, NOW(), NOW(), false),
(gen_random_uuid(), 'IT Support Technician', 'IT & Systems', 145, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Systems Administrator', 'IT & Systems', 146, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Web Developer', 'IT & Systems', 147, true, NOW(), NOW(), false),

-- 17. PROCUREMENT, STORES & LOGISTICS
(gen_random_uuid(), 'Procurement Manager', 'Procurement, Stores & Logistics', 148, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Purchasing Manager', 'Procurement, Stores & Logistics', 149, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Storekeeper', 'Procurement, Stores & Logistics', 150, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Supply Chain Manager', 'Procurement, Stores & Logistics', 151, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Logistics Coordinator', 'Procurement, Stores & Logistics', 152, true, NOW(), NOW(), false),

-- 18. AVIATION & TRANSPORT (HOSPITALITY SUPPORT)
(gen_random_uuid(), 'Flight Attendant / Cabin Crew', 'Aviation & Transport', 153, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Helicopter Pilot', 'Aviation & Transport', 154, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Helicopter Mechanic', 'Aviation & Transport', 155, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Chauffeur / Private Driver', 'Aviation & Transport', 156, true, NOW(), NOW(), false),

-- 19. ADMINISTRATION & OFFICE SUPPORT
(gen_random_uuid(), 'Office Manager', 'Administration & Office Support', 157, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Administrator', 'Administration & Office Support', 158, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Office Assistant', 'Administration & Office Support', 159, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Personal Assistant (PA)', 'Administration & Office Support', 160, true, NOW(), NOW(), false),
(gen_random_uuid(), 'Executive Assistant (EA)', 'Administration & Office Support', 161, true, NOW(), NOW(), false);
