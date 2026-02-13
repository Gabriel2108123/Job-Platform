using HospitalityPlatform.Database;
using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Api.Services;

public class DataSeedingService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DataSeedingService> _logger;

    public DataSeedingService(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ApplicationDbContext context,
        ILogger<DataSeedingService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await SeedRolesAsync();
            await SeedUsersAsync();
            await SeedJobsAsync();
            await SeedWorkExperiencesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        string[] roles = { "Candidate", "BusinessOwner", "Staff", "Admin", "Support" };
        foreach (var roleName in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = roleName });
                _logger.LogInformation("Created role: {Role}", roleName);
            }
        }
    }

    private async Task SeedUsersAsync()
    {
        // 1. Seed Candidate
        var candidateEmail = "candidate@test.com";
        if (await _userManager.FindByEmailAsync(candidateEmail) == null)
        {
            var user = new ApplicationUser
            {
                UserName = candidateEmail,
                Email = candidateEmail,
                FirstName = "Test",
                LastName = "Candidate",
                EmailConfirmed = true,
                IsActive = true
            };
            var result = await _userManager.CreateAsync(user, "Test1234!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Candidate");
                _logger.LogInformation("Created user: {Email}", candidateEmail);
            }
        }

        // 2. Seed Business Owner
        var businessEmail = "business@test.com";
        if (await _userManager.FindByEmailAsync(businessEmail) == null)
        {
            // Create Organization
            var org = new Organization
            {
                Name = "Test Hotel & Spa",
                IsActive = true
            };
            _context.Organizations.Add(org);
            await _context.SaveChangesAsync();

            var user = new ApplicationUser
            {
                UserName = businessEmail,
                Email = businessEmail,
                FirstName = "Test",
                LastName = "BusinessOwner",
                EmailConfirmed = true,
                IsActive = true,
                OrganizationId = org.Id
            };
            var result = await _userManager.CreateAsync(user, "Test1234!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "BusinessOwner");
                _logger.LogInformation("Created user: {Email}", businessEmail);
            }
        }

        // 3. Seed Admin
        var adminEmail = "admin@test.com";
        if (await _userManager.FindByEmailAsync(adminEmail) == null)
        {
            var user = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Test",
                LastName = "Admin",
                EmailConfirmed = true,
                IsActive = true
            };
            var result = await _userManager.CreateAsync(user, "Test1234!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Admin");
                _logger.LogInformation("Created user: {Email}", adminEmail);
            }
        }
    }

    private async Task SeedJobsAsync()
    {
        if (await _context.Jobs.CountAsync() >= 5)
        {
            return; // Already has enough data
        }

        var businessUser = await _userManager.FindByEmailAsync("business@test.com");
        if (businessUser == null || !businessUser.OrganizationId.HasValue)
        {
            return;
        }

        var jobs = new List<Job>
        {
            new Job
            {
                Title = "Head Barista",
                Description = "Experienced barista needed for busy cafe in central London. Must know latte art.",
                OrganizationId = businessUser.OrganizationId.Value,
                CreatedByUserId = businessUser.Id.ToString(),
                RoleType = RoleType.Barista,
                EmploymentType = EmploymentType.FullTime,
                ShiftPattern = ShiftPattern.Days,
                SalaryMin = 28000,
                SalaryMax = 32000,
                SalaryCurrency = "GBP",
                SalaryPeriod = SalaryPeriod.Year,
                Location = "London",
                RequiredExperienceYears = 2,
                Status = JobStatus.Published,
                PublishedAt = DateTime.UtcNow,
                Visibility = JobVisibility.Public,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Job
            {
                Title = "Sous Chef",
                Description = "Join our award-winning kitchen team. Passion for local produce required.",
                OrganizationId = businessUser.OrganizationId.Value,
                CreatedByUserId = businessUser.Id.ToString(),
                RoleType = RoleType.SousChef,
                EmploymentType = EmploymentType.FullTime,
                ShiftPattern = ShiftPattern.Rotating,
                SalaryMin = 35000,
                SalaryMax = 40000,
                SalaryCurrency = "GBP",
                SalaryPeriod = SalaryPeriod.Year,
                Location = "Manchester",
                RequiredExperienceYears = 4,
                Status = JobStatus.Published,
                PublishedAt = DateTime.UtcNow,
                Visibility = JobVisibility.Public,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Job
            {
                Title = "Hotel Receptionist",
                Description = "Luxury hotel requires front desk staff. Night shifts included.",
                OrganizationId = businessUser.OrganizationId.Value,
                CreatedByUserId = businessUser.Id.ToString(),
                RoleType = RoleType.HotelReceptionist,
                EmploymentType = EmploymentType.FullTime,
                ShiftPattern = ShiftPattern.Rotating,
                SalaryMin = 24000,
                SalaryMax = 26000,
                SalaryCurrency = "GBP",
                SalaryPeriod = SalaryPeriod.Year,
                Location = "Edinburgh",
                RequiredExperienceYears = 1,
                Status = JobStatus.Published,
                PublishedAt = DateTime.UtcNow,
                Visibility = JobVisibility.Public,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Job
            {
                Title = "Bartender",
                Description = "Cocktail experience preferred for our speakeasy bar.",
                OrganizationId = businessUser.OrganizationId.Value,
                CreatedByUserId = businessUser.Id.ToString(),
                RoleType = RoleType.Bartender,
                EmploymentType = EmploymentType.PartTime,
                ShiftPattern = ShiftPattern.Nights,
                SalaryMin = 12.50m,
                SalaryMax = 15.00m,
                SalaryCurrency = "GBP",
                SalaryPeriod = SalaryPeriod.Hour,
                Location = "Bristol",
                RequiredExperienceYears = 1,
                Status = JobStatus.Published,
                PublishedAt = DateTime.UtcNow,
                Visibility = JobVisibility.Public,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Job
            {
                Title = "Waiter / Waitress",
                Description = "Seasonal staff for seafront restaurant. Immediate start.",
                OrganizationId = businessUser.OrganizationId.Value,
                CreatedByUserId = businessUser.Id.ToString(),
                RoleType = RoleType.Waiter,
                EmploymentType = EmploymentType.Temporary,
                ShiftPattern = ShiftPattern.Flexible,
                SalaryMin = 11.50m,
                SalaryMax = 13.00m,
                SalaryCurrency = "GBP",
                SalaryPeriod = SalaryPeriod.Hour,
                Location = "Brighton",
                RequiredExperienceYears = 0,
                Status = JobStatus.Published,
                PublishedAt = DateTime.UtcNow,
                Visibility = JobVisibility.Public,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        _context.Jobs.AddRange(jobs);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} new jobs.", jobs.Count);
    }

    private async Task SeedWorkExperiencesAsync()
    {
        // Check if any work experiences exist
        // Note: We need to cast DbContext to IQueryable if accessing generic set, or use Set<WorkExperience>()
        // But ApplicationDbContext should have WorkExperiences DbSet if integrated correctly.
        // Let's assume _context.WorkExperiences exists (via connection to CandidatesDbContext logic in ApplicationDbContext)
        
        // Since ApplicationDbContext combines all contexts usually, let's check.
        // If not, we might need to inject ICandidatesDbContext.
        // But DataSeedingService uses ApplicationDbContext directly.
        
        // To be safe, let's access via Set<HospitalityPlatform.Candidates.Entities.WorkExperience>() if proper property not visible
        var count = await _context.Set<HospitalityPlatform.Candidates.Entities.WorkExperience>().CountAsync();
        if (count > 0) return;

        var candidate = await _userManager.FindByEmailAsync("candidate@test.com");
        if (candidate == null) return;

        var experiences = new List<HospitalityPlatform.Candidates.Entities.WorkExperience>
        {
            new HospitalityPlatform.Candidates.Entities.WorkExperience
            {
                Id = Guid.NewGuid(),
                CandidateUserId = candidate.Id,
                EmployerName = "The Grand Hotel",
                LocationText = "Brighton",
                City = "Brighton",
                PostalCode = "BN1 2FW",
                RoleTitle = "Concierge",
                StartDate = DateTime.UtcNow.AddYears(-2),
                EndDate = DateTime.UtcNow.AddYears(-1),
                VisibilityLevel = "public", // or whatever valid level
                IsMapEnabled = true,
                LatApprox = 50.8225m,
                LngApprox = -0.1372m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new HospitalityPlatform.Candidates.Entities.WorkExperience
            {
                Id = Guid.NewGuid(),
                CandidateUserId = candidate.Id,
                EmployerName = "London Cafe",
                LocationText = "London",
                City = "London",
                PostalCode = "SW1A 1AA",
                RoleTitle = "Barista",
                StartDate = DateTime.UtcNow.AddYears(-1),
                EndDate = null, // Current
                VisibilityLevel = "public",
                IsMapEnabled = true,
                LatApprox = 51.5074m,
                LngApprox = -0.1278m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await _context.Set<HospitalityPlatform.Candidates.Entities.WorkExperience>().AddRangeAsync(experiences);
        
        // Also ensure Map Settings are enabled for this candidate
        var mapSettings = await _context.Set<HospitalityPlatform.Candidates.Entities.CandidateMapSettings>()
            .FirstOrDefaultAsync(s => s.CandidateUserId == candidate.Id);
            
        if (mapSettings == null)
        {
            await _context.Set<HospitalityPlatform.Candidates.Entities.CandidateMapSettings>().AddAsync(
                new HospitalityPlatform.Candidates.Entities.CandidateMapSettings
                {
                    CandidateUserId = candidate.Id,
                    WorkerMapEnabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
        }
        else if (!mapSettings.WorkerMapEnabled)
        {
            mapSettings.WorkerMapEnabled = true;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} work experiences for candidate.", experiences.Count);
    }
}
