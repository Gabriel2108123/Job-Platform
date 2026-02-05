using HospitalityPlatform.Database;
using HospitalityPlatform.Jobs.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Api.Extensions;

public static class DatabaseSeedExtensions
{
    public static async Task SeedJobRolesAsync(this ApplicationDbContext context)
    {
        // Check if job roles already exist
        if (await context.JobRoles.AnyAsync())
        {
            return; // Already seeded
        }

        var jobRoles = GetJobRolesSeedData();
        
        await context.JobRoles.AddRangeAsync(jobRoles);
        await context.SaveChangesAsync();
    }

    private static List<JobRole> GetJobRolesSeedData()
    {
        return new List<JobRole>
        {
            // 1. EXECUTIVE & SENIOR MANAGEMENT
            new JobRole { Name = "Chairman", Department = "Executive & Senior Management", DisplayOrder = 1 },
            new JobRole { Name = "Chief Executive Officer (CEO)", Department = "Executive & Senior Management", DisplayOrder = 2 },
            new JobRole { Name = "Managing Director", Department = "Executive & Senior Management", DisplayOrder = 3 },
            new JobRole { Name = "Director", Department = "Executive & Senior Management", DisplayOrder = 4 },
            new JobRole { Name = "Operations Director", Department = "Executive & Senior Management", DisplayOrder = 5 },
            new JobRole { Name = "Technical Director", Department = "Executive & Senior Management", DisplayOrder = 6 },
            new JobRole { Name = "Finance Director", Department = "Executive & Senior Management", DisplayOrder = 7 },
            new JobRole { Name = "Chief Financial Officer (CFO)", Department = "Executive & Senior Management", DisplayOrder = 8 },
            new JobRole { Name = "Group Financial Controller", Department = "Executive & Senior Management", DisplayOrder = 9 },
            new JobRole { Name = "Corporate Development Manager", Department = "Executive & Senior Management", DisplayOrder = 10 },

            // 2. GENERAL MANAGEMENT & OPERATIONS
            new JobRole { Name = "General Manager", Department = "General Management & Operations", DisplayOrder = 11 },
            new JobRole { Name = "Assistant General Manager", Department = "General Management & Operations", DisplayOrder = 12 },
            new JobRole { Name = "Operations Manager", Department = "General Management & Operations", DisplayOrder = 13 },
            new JobRole { Name = "Operational Manager", Department = "General Management & Operations", DisplayOrder = 14 },
            new JobRole { Name = "Duty Manager", Department = "General Management & Operations", DisplayOrder = 15 },
            new JobRole { Name = "Deputy Manager", Department = "General Management & Operations", DisplayOrder = 16 },
            new JobRole { Name = "Night Manager", Department = "General Management & Operations", DisplayOrder = 17 },
            new JobRole { Name = "Venue Manager", Department = "General Management & Operations", DisplayOrder = 18 },
            new JobRole { Name = "Marina Manager", Department = "General Management & Operations", DisplayOrder = 19 },
            new JobRole { Name = "Household / Estate Manager", Department = "General Management & Operations", DisplayOrder = 20 },

            // 3. FINANCE, ACCOUNTS & PAYROLL
            new JobRole { Name = "Finance Manager", Department = "Finance, Accounts & Payroll", DisplayOrder = 21 },
            new JobRole { Name = "Financial Controller", Department = "Finance, Accounts & Payroll", DisplayOrder = 22 },
            new JobRole { Name = "Financial Analyst", Department = "Finance, Accounts & Payroll", DisplayOrder = 23 },
            new JobRole { Name = "Accountant", Department = "Finance, Accounts & Payroll", DisplayOrder = 24 },
            new JobRole { Name = "Accounts Administrator", Department = "Finance, Accounts & Payroll", DisplayOrder = 25 },
            new JobRole { Name = "Payroll Officer", Department = "Finance, Accounts & Payroll", DisplayOrder = 26 },
            new JobRole { Name = "Payroll & Crew Payroll Manager", Department = "Finance, Accounts & Payroll", DisplayOrder = 27 },

            // 4. HUMAN RESOURCES & RECRUITMENT
            new JobRole { Name = "Human Resources Manager", Department = "Human Resources & Recruitment", DisplayOrder = 28 },
            new JobRole { Name = "HR Administrator", Department = "Human Resources & Recruitment", DisplayOrder = 29 },
            new JobRole { Name = "HR Assistant", Department = "Human Resources & Recruitment", DisplayOrder = 30 },
            new JobRole { Name = "Recruitment Consultant", Department = "Human Resources & Recruitment", DisplayOrder = 31 },
            new JobRole { Name = "Crew Manager", Department = "Human Resources & Recruitment", DisplayOrder = 32 },
            new JobRole { Name = "Crew Administrator", Department = "Human Resources & Recruitment", DisplayOrder = 33 },
            new JobRole { Name = "Training Manager", Department = "Human Resources & Recruitment", DisplayOrder = 34 },
            new JobRole { Name = "Training Coordinator", Department = "Human Resources & Recruitment", DisplayOrder = 35 },

            // 5. SALES, BUSINESS DEVELOPMENT & CLIENT RELATIONS
            new JobRole { Name = "Sales Manager", Department = "Sales, Business Development & Client Relations", DisplayOrder = 36 },
            new JobRole { Name = "Senior Sales Executive", Department = "Sales, Business Development & Client Relations", DisplayOrder = 37 },
            new JobRole { Name = "Sales Executive", Department = "Sales, Business Development & Client Relations", DisplayOrder = 38 },
            new JobRole { Name = "Business Development Manager", Department = "Sales, Business Development & Client Relations", DisplayOrder = 39 },
            new JobRole { Name = "Client Relations Manager", Department = "Sales, Business Development & Client Relations", DisplayOrder = 40 },
            new JobRole { Name = "Partnerships Manager", Department = "Sales, Business Development & Client Relations", DisplayOrder = 41 },
            new JobRole { Name = "Listings Manager", Department = "Sales, Business Development & Client Relations", DisplayOrder = 42 },

            // 6. MARKETING, BRAND & DIGITAL
            new JobRole { Name = "Marketing Manager", Department = "Marketing, Brand & Digital", DisplayOrder = 43 },
            new JobRole { Name = "Marketing Executive", Department = "Marketing, Brand & Digital", DisplayOrder = 44 },
            new JobRole { Name = "Marketing Assistant", Department = "Marketing, Brand & Digital", DisplayOrder = 45 },
            new JobRole { Name = "Digital Marketer / SEO", Department = "Marketing, Brand & Digital", DisplayOrder = 46 },
            new JobRole { Name = "Social Media Manager", Department = "Marketing, Brand & Digital", DisplayOrder = 47 },
            new JobRole { Name = "Content Writer", Department = "Marketing, Brand & Digital", DisplayOrder = 48 },
            new JobRole { Name = "Graphic Designer", Department = "Marketing, Brand & Digital", DisplayOrder = 49 },
            new JobRole { Name = "PR & Communications Officer", Department = "Marketing, Brand & Digital", DisplayOrder = 50 },
            new JobRole { Name = "Videographer", Department = "Marketing, Brand & Digital", DisplayOrder = 51 },

            // 7. FRONT OFFICE, GUEST SERVICES & TRAVEL
            new JobRole { Name = "Front Office Manager", Department = "Front Office, Guest Services & Travel", DisplayOrder = 52 },
            new JobRole { Name = "Assistant Front Office Manager", Department = "Front Office, Guest Services & Travel", DisplayOrder = 53 },
            new JobRole { Name = "Receptionist / Front Desk Agent", Department = "Front Office, Guest Services & Travel", DisplayOrder = 54 },
            new JobRole { Name = "Concierge", Department = "Front Office, Guest Services & Travel", DisplayOrder = 55 },
            new JobRole { Name = "Guest Relations Officer", Department = "Front Office, Guest Services & Travel", DisplayOrder = 56 },
            new JobRole { Name = "Reservation Agent", Department = "Front Office, Guest Services & Travel", DisplayOrder = 57 },
            new JobRole { Name = "Customer Service Agent", Department = "Front Office, Guest Services & Travel", DisplayOrder = 58 },
            new JobRole { Name = "Travel Agent", Department = "Front Office, Guest Services & Travel", DisplayOrder = 59 },
            new JobRole { Name = "Lounge Manager", Department = "Front Office, Guest Services & Travel", DisplayOrder = 60 },
            new JobRole { Name = "Lounge Attendant", Department = "Front Office, Guest Services & Travel", DisplayOrder = 61 },

            // 8. FOOD & BEVERAGE - SERVICE
            new JobRole { Name = "Food & Beverage Manager", Department = "Food & Beverage - Service", DisplayOrder = 62 },
            new JobRole { Name = "Restaurant Manager", Department = "Food & Beverage - Service", DisplayOrder = 63 },
            new JobRole { Name = "Assistant Restaurant Manager", Department = "Food & Beverage - Service", DisplayOrder = 64 },
            new JobRole { Name = "Banquet Manager", Department = "Food & Beverage - Service", DisplayOrder = 65 },
            new JobRole { Name = "Banquet Supervisor", Department = "Food & Beverage - Service", DisplayOrder = 66 },
            new JobRole { Name = "Banquet Server", Department = "Food & Beverage - Service", DisplayOrder = 67 },
            new JobRole { Name = "Head Waiter / Maitre d'", Department = "Food & Beverage - Service", DisplayOrder = 68 },
            new JobRole { Name = "Waiter / Waitress", Department = "Food & Beverage - Service", DisplayOrder = 69 },
            new JobRole { Name = "Host / Hostess", Department = "Food & Beverage - Service", DisplayOrder = 70 },
            new JobRole { Name = "Sommelier", Department = "Food & Beverage - Service", DisplayOrder = 71 },
            new JobRole { Name = "Bar Manager", Department = "Food & Beverage - Service", DisplayOrder = 72 },
            new JobRole { Name = "Head Bartender", Department = "Food & Beverage - Service", DisplayOrder = 73 },
            new JobRole { Name = "Bartender", Department = "Food & Beverage - Service", DisplayOrder = 74 },
            new JobRole { Name = "Mixologist", Department = "Food & Beverage - Service", DisplayOrder = 75 },
            new JobRole { Name = "Barback", Department = "Food & Beverage - Service", DisplayOrder = 76 },
            new JobRole { Name = "Mini-Bar Attendant", Department = "Food & Beverage - Service", DisplayOrder = 77 },

            // 9. CULINARY & KITCHEN
            new JobRole { Name = "Executive Chef", Department = "Culinary & Kitchen", DisplayOrder = 78 },
            new JobRole { Name = "Head Chef", Department = "Culinary & Kitchen", DisplayOrder = 79 },
            new JobRole { Name = "Senior Sous Chef", Department = "Culinary & Kitchen", DisplayOrder = 80 },
            new JobRole { Name = "Sous Chef", Department = "Culinary & Kitchen", DisplayOrder = 81 },
            new JobRole { Name = "Junior Sous Chef", Department = "Culinary & Kitchen", DisplayOrder = 82 },
            new JobRole { Name = "Senior Chef De Partie", Department = "Culinary & Kitchen", DisplayOrder = 83 },
            new JobRole { Name = "Chef de Partie", Department = "Culinary & Kitchen", DisplayOrder = 84 },
            new JobRole { Name = "Junior Chef De Partie", Department = "Culinary & Kitchen", DisplayOrder = 85 },
            new JobRole { Name = "Commis Chef", Department = "Culinary & Kitchen", DisplayOrder = 86 },
            new JobRole { Name = "Line Cook", Department = "Culinary & Kitchen", DisplayOrder = 87 },
            new JobRole { Name = "Prep Cook", Department = "Culinary & Kitchen", DisplayOrder = 88 },
            new JobRole { Name = "Pastry Chef", Department = "Culinary & Kitchen", DisplayOrder = 89 },
            new JobRole { Name = "Baker", Department = "Culinary & Kitchen", DisplayOrder = 90 },
            new JobRole { Name = "Butcher", Department = "Culinary & Kitchen", DisplayOrder = 91 },
            new JobRole { Name = "Kitchen Porter", Department = "Culinary & Kitchen", DisplayOrder = 92 },

            // 10. HOUSEKEEPING & INTERIOR
            new JobRole { Name = "Executive Housekeeper", Department = "Housekeeping & Interior", DisplayOrder = 93 },
            new JobRole { Name = "Head of Housekeeping", Department = "Housekeeping & Interior", DisplayOrder = 94 },
            new JobRole { Name = "Housekeeping Supervisor", Department = "Housekeeping & Interior", DisplayOrder = 95 },
            new JobRole { Name = "Room Attendant / Chambermaid", Department = "Housekeeping & Interior", DisplayOrder = 96 },
            new JobRole { Name = "Public Area Cleaner", Department = "Housekeeping & Interior", DisplayOrder = 97 },
            new JobRole { Name = "Laundry Manager", Department = "Housekeeping & Interior", DisplayOrder = 98 },
            new JobRole { Name = "Laundry Attendant", Department = "Housekeeping & Interior", DisplayOrder = 99 },
            new JobRole { Name = "Linen Room Attendant", Department = "Housekeeping & Interior", DisplayOrder = 100 },

            // 11. SPA, WELLNESS & LEISURE
            new JobRole { Name = "Spa Manager", Department = "Spa, Wellness & Leisure", DisplayOrder = 101 },
            new JobRole { Name = "Spa Therapist", Department = "Spa, Wellness & Leisure", DisplayOrder = 102 },
            new JobRole { Name = "Massage Therapist", Department = "Spa, Wellness & Leisure", DisplayOrder = 103 },
            new JobRole { Name = "Personal Trainer", Department = "Spa, Wellness & Leisure", DisplayOrder = 104 },
            new JobRole { Name = "Fitness Instructor", Department = "Spa, Wellness & Leisure", DisplayOrder = 105 },
            new JobRole { Name = "Yoga / Pilates Instructor", Department = "Spa, Wellness & Leisure", DisplayOrder = 106 },
            new JobRole { Name = "Lifeguard", Department = "Spa, Wellness & Leisure", DisplayOrder = 107 },
            new JobRole { Name = "Pool Attendant", Department = "Spa, Wellness & Leisure", DisplayOrder = 108 },
            new JobRole { Name = "Kids Club Attendant", Department = "Spa, Wellness & Leisure", DisplayOrder = 109 },

            // 12. ENTERTAINMENT, EVENTS & ACTIVITIES
            new JobRole { Name = "Entertainment Director", Department = "Entertainment, Events & Activities", DisplayOrder = 110 },
            new JobRole { Name = "Cruise Director", Department = "Entertainment, Events & Activities", DisplayOrder = 111 },
            new JobRole { Name = "Activities Coordinator", Department = "Entertainment, Events & Activities", DisplayOrder = 112 },
            new JobRole { Name = "Event Planner", Department = "Entertainment, Events & Activities", DisplayOrder = 113 },
            new JobRole { Name = "Event Coordinator", Department = "Entertainment, Events & Activities", DisplayOrder = 114 },
            new JobRole { Name = "Wedding Planner", Department = "Entertainment, Events & Activities", DisplayOrder = 115 },
            new JobRole { Name = "DJ", Department = "Entertainment, Events & Activities", DisplayOrder = 116 },
            new JobRole { Name = "Live Musician", Department = "Entertainment, Events & Activities", DisplayOrder = 117 },
            new JobRole { Name = "AV Technician", Department = "Entertainment, Events & Activities", DisplayOrder = 118 },
            new JobRole { Name = "Tour Guide", Department = "Entertainment, Events & Activities", DisplayOrder = 119 },
            new JobRole { Name = "Tour Manager", Department = "Entertainment, Events & Activities", DisplayOrder = 120 },

            // 13. SECURITY & SAFETY
            new JobRole { Name = "Security Manager", Department = "Security & Safety", DisplayOrder = 121 },
            new JobRole { Name = "Security Officer", Department = "Security & Safety", DisplayOrder = 122 },
            new JobRole { Name = "CCTV Operator", Department = "Security & Safety", DisplayOrder = 123 },
            new JobRole { Name = "Surveillance Operator", Department = "Security & Safety", DisplayOrder = 124 },
            new JobRole { Name = "Close Protection Officer", Department = "Security & Safety", DisplayOrder = 125 },
            new JobRole { Name = "Ship / Venue Security Officer", Department = "Security & Safety", DisplayOrder = 126 },

            // 14. MARITIME & CRUISE OPERATIONS
            new JobRole { Name = "Captain", Department = "Maritime & Cruise Operations", DisplayOrder = 127 },
            new JobRole { Name = "Chief Officer / First Mate", Department = "Maritime & Cruise Operations", DisplayOrder = 128 },
            new JobRole { Name = "Deck Officer", Department = "Maritime & Cruise Operations", DisplayOrder = 129 },
            new JobRole { Name = "Bosun", Department = "Maritime & Cruise Operations", DisplayOrder = 130 },
            new JobRole { Name = "Deckhand", Department = "Maritime & Cruise Operations", DisplayOrder = 131 },
            new JobRole { Name = "Able Seaman", Department = "Maritime & Cruise Operations", DisplayOrder = 132 },
            new JobRole { Name = "Ordinary Seaman", Department = "Maritime & Cruise Operations", DisplayOrder = 133 },
            new JobRole { Name = "Purser", Department = "Maritime & Cruise Operations", DisplayOrder = 134 },
            new JobRole { Name = "Assistant Purser", Department = "Maritime & Cruise Operations", DisplayOrder = 135 },

            // 15. ENGINEERING & TECHNICAL
            new JobRole { Name = "Chief Engineer", Department = "Engineering & Technical", DisplayOrder = 136 },
            new JobRole { Name = "Engineer", Department = "Engineering & Technical", DisplayOrder = 137 },
            new JobRole { Name = "Maintenance Technician", Department = "Engineering & Technical", DisplayOrder = 138 },
            new JobRole { Name = "Electrician", Department = "Engineering & Technical", DisplayOrder = 139 },
            new JobRole { Name = "Plumber", Department = "Engineering & Technical", DisplayOrder = 140 },
            new JobRole { Name = "HVAC Technician", Department = "Engineering & Technical", DisplayOrder = 141 },
            new JobRole { Name = "Mechanic", Department = "Engineering & Technical", DisplayOrder = 142 },

            // 16. IT & SYSTEMS
            new JobRole { Name = "IT Manager", Department = "IT & Systems", DisplayOrder = 143 },
            new JobRole { Name = "IT Officer", Department = "IT & Systems", DisplayOrder = 144 },
            new JobRole { Name = "IT Support Technician", Department = "IT & Systems", DisplayOrder = 145 },
            new JobRole { Name = "Systems Administrator", Department = "IT & Systems", DisplayOrder = 146 },
            new JobRole { Name = "Web Developer", Department = "IT & Systems", DisplayOrder = 147 },

            // 17. PROCUREMENT, STORES & LOGISTICS
            new JobRole { Name = "Procurement Manager", Department = "Procurement, Stores & Logistics", DisplayOrder = 148 },
            new JobRole { Name = "Purchasing Manager", Department = "Procurement, Stores & Logistics", DisplayOrder = 149 },
            new JobRole { Name = "Storekeeper", Department = "Procurement, Stores & Logistics", DisplayOrder = 150 },
            new JobRole { Name = "Supply Chain Manager", Department = "Procurement, Stores & Logistics", DisplayOrder = 151 },
            new JobRole { Name = "Logistics Coordinator", Department = "Procurement, Stores & Logistics", DisplayOrder = 152 },

            // 18. AVIATION & TRANSPORT (HOSPITALITY SUPPORT)
            new JobRole { Name = "Flight Attendant / Cabin Crew", Department = "Aviation & Transport", DisplayOrder = 153 },
            new JobRole { Name = "Helicopter Pilot", Department = "Aviation & Transport", DisplayOrder = 154 },
            new JobRole { Name = "Helicopter Mechanic", Department = "Aviation & Transport", DisplayOrder = 155 },
            new JobRole { Name = "Chauffeur / Private Driver", Department = "Aviation & Transport", DisplayOrder = 156 },

            // 19. ADMINISTRATION & OFFICE SUPPORT
            new JobRole { Name = "Office Manager", Department = "Administration & Office Support", DisplayOrder = 157 },
            new JobRole { Name = "Administrator", Department = "Administration & Office Support", DisplayOrder = 158 },
            new JobRole { Name = "Office Assistant", Department = "Administration & Office Support", DisplayOrder = 159 },
            new JobRole { Name = "Personal Assistant (PA)", Department = "Administration & Office Support", DisplayOrder = 160 },
            new JobRole { Name = "Executive Assistant (EA)", Department = "Administration & Office Support", DisplayOrder = 161 }
        };
    }
}
