using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using HospitalityPlatform.Database;
using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Identity.Entities;
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection.Extensions;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Enums;
using HospitalityPlatform.Messaging.Controllers;
using HospitalityPlatform.Messaging.DTOs;

namespace HospitalityPlatform.Api.Tests;

/// <summary>
/// Integration tests for critical security and business logic gates.
/// Uses WebApplicationFactory to test the entire request pipeline.
/// </summary>
public class IntegrationTests : IAsyncLifetime
{
    private WebApplicationFactory<Program> _factory = default!;
    private HttpClient _client = default!;
    private IServiceScope _scope = default!;
    private ApplicationDbContext _context = default!;

    public async Task InitializeAsync()
    {
        var dbName = "test_db_" + Guid.NewGuid();
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string>
                    {
                        { "Waitlist:DisableRateLimit", "true" }
                    });
                });

                builder.ConfigureServices(services =>
                {
                    services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
                    services.RemoveAll(typeof(ApplicationDbContext));
                    services.RemoveAll(typeof(DbContext));

                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase(dbName);
                    });

                    services.AddScoped<DbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
                });
            });
        _client = _factory.CreateClient();

        _scope = _factory.Services.CreateScope();
        _context = _scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await _context.Database.EnsureCreatedAsync();
        await SeedTestData();
    }

    public async Task DisposeAsync()
    {
        if (_context != null) await _context.DisposeAsync();
        _scope?.Dispose();
        _client?.Dispose();
        _factory?.Dispose();
    }

    private async Task SeedTestData()
    {
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure roles exist
        var roles = new[] { "Admin", "Candidate" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new ApplicationRole { Name = role });
            }
        }

        // Create organizations
        var adminOrg = new Organization { Name = "Admin Org", IsActive = true };
        var candidateOrg = new Organization { Name = "Candidate Org", IsActive = true };
        context.Organizations.AddRange(adminOrg, candidateOrg);

        // Create a job for applications
        var testJob = new Job
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Title = "Test Hospitality Job",
            Description = "A great job in hospitality.",
            Location = "London",
            OrganizationId = adminOrg.Id,
            Status = JobStatus.Published,
            EmploymentType = EmploymentType.FullTime,
            CreatedAt = DateTime.UtcNow
        };
        context.Jobs.Add(testJob);

        await context.SaveChangesAsync();

        // Seed test users
        var userSpecs = new[]
        {
            new { Email = "admin@test.com", IsUnverified = false, Role = "Admin", OrgId = adminOrg.Id },
            new { Email = "candidate@test.com", IsUnverified = false, Role = "Candidate", OrgId = candidateOrg.Id },
            new { Email = "unverified@test.com", IsUnverified = true, Role = "Candidate", OrgId = candidateOrg.Id }
        };

        foreach (var spec in userSpecs)
        {
            var user = new ApplicationUser
            {
                UserName = spec.Email,
                Email = spec.Email,
                EmailConfirmed = !spec.IsUnverified,
                OrganizationId = spec.OrgId
            };

            var result = await userManager.CreateAsync(user, "TestPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, spec.Role);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to seed user {spec.Email}: {errors}");
            }
        }
    }

    [Fact]
    public async Task WaitlistJoin_DuplicateEmail_Returns400BadRequest()
    {
        var payload = new { email = "candidate@test.com", accountType = 1 };
        
        await _client.PostAsJsonAsync("/api/waitlist", payload);

        var secondResponse = await _client.PostAsJsonAsync("/api/waitlist", payload);

        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
        var responseBody = await secondResponse.Content.ReadAsStringAsync();
        Assert.Contains("Email already on waitlist", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task WaitlistJoin_RateLimitExceeded_Returns429()
    {
        using var rateLimitFactory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "Waitlist:DisableRateLimit", "false" }
                });
            });
        });
        using var rateLimitClient = rateLimitFactory.CreateClient();

        var requestCount = 6;
        var responses = new List<HttpResponseMessage>();

        for (int i = 0; i < requestCount; i++)
        {
            var payload = new { email = $"rate{i}_{Guid.NewGuid()}@test.com", accountType = 1 };
            var response = await rateLimitClient.PostAsJsonAsync("/api/waitlist", payload);
            responses.Add(response);
        }

        var rateLimitedResponse = responses.FirstOrDefault(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        Assert.NotNull(rateLimitedResponse);
    }

    [Fact]
    public async Task JobApplication_UnverifiedEmail_Returns403()
    {
        var token = await GetAuthTokenForUser("unverified@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var jobId = "00000000-0000-0000-0000-000000000001";
        var payload = new { jobId, coverLetter = "I am interested." };
        
        var response = await _client.PostAsJsonAsync($"/api/applications/jobs/{jobId}/apply", payload);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.Contains("verify your email", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task JobApplication_VerifiedEmail_Returns201()
    {
        var token = await GetAuthTokenForUser("candidate@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var jobId = "00000000-0000-0000-0000-000000000001";
        var payload = new { jobId, coverLetter = "I am very interested." };
        
        var response = await _client.PostAsJsonAsync($"/api/applications/jobs/{jobId}/apply", payload);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.Created,
            $"Expected 200 or 201, got {response.StatusCode}");
    }

    [Fact]
    public async Task Messaging_UnverifiedUser_Returns403()
    {
        var token = await GetAuthTokenForUser("unverified@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var payload = new CreateConversationDto 
        { 
            Subject = "Premium Conversation",
            ParticipantUserIds = new List<string> { Guid.NewGuid().ToString() }
        };
        
        var response = await _client.PostAsJsonAsync("/api/messaging/conversations", payload);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.Contains("verify your email", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Messaging_UnsubscribedUser_Returns403()
    {
        var token = await GetAuthTokenForUser("candidate@test.com"); // Verified but no subscription
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var payload = new CreateConversationDto 
        { 
            Subject = "Test Conversation",
            ParticipantUserIds = new List<string> { Guid.NewGuid().ToString() }
        };
        
        var response = await _client.PostAsJsonAsync("/api/messaging/conversations", payload);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.Contains("premium subscription", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ProtectedEndpoint_NoToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;
        var response = await _client.GetAsync("/api/jobs/organization");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_InvalidToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid.token");
        var response = await _client.GetAsync("/api/jobs/organization");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_AdminUser_Returns200()
    {
        var token = await GetAuthTokenForUser("admin@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/admin/metrics");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_NonAdminUser_Returns403()
    {
        var token = await GetAuthTokenForUser("candidate@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/admin/metrics");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task<string> GetAuthTokenForUser(string email)
    {
        var payload = new { email, password = "TestPassword123!" };
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);
        response.EnsureSuccessStatusCode();

        var responseBody = await response.Content.ReadAsStringAsync();
        var json = System.Text.Json.JsonDocument.Parse(responseBody);
        return json.RootElement.GetProperty("token").GetString()!;
    }
}
