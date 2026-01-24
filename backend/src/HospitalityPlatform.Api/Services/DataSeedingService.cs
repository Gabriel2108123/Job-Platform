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
        if (await _context.Jobs.AnyAsync())
        {
            return; // Already seeded
        }

        var businessUser = await _userManager.FindByEmailAsync("business@test.com");
        if (businessUser == null || !businessUser.OrganizationId.HasValue)
        {
            return;
        }

        var job = new Job
        {
            Title = "Head Chef",
            Description = "We are looking for an experienced Head Chef to lead our kitchen team. Must have 5+ years experience in fine dining.",
            OrganizationId = businessUser.OrganizationId.Value,
            CreatedByUserId = businessUser.Id.ToString(),
            RoleType = RoleType.Chef,
            EmploymentType = EmploymentType.FullTime,
            ShiftPattern = ShiftPattern.Rotating,
            SalaryMin = 45000,
            SalaryMax = 55000,
            SalaryCurrency = "GBP",
            SalaryPeriod = SalaryPeriod.Year,
            Location = "London",
            RequiredExperienceYears = 5,
            Status = JobStatus.Published,
            PublishedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            Visibility = JobVisibility.Public,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created sample job: {Title}", job.Title);
    }
}
