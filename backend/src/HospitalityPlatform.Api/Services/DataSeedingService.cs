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
}
