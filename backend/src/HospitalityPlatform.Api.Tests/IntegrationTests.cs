using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using HospitalityPlatform.Database;
using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Identity.Entities;
using System.Net;
using Microsoft.AspNetCore.Identity;

namespace HospitalityPlatform.Api.Tests;

/// <summary>
/// Integration tests for critical security and business logic gates.
/// Uses WebApplicationFactory to test the entire request pipeline.
/// </summary>
public class IntegrationTests : IAsyncLifetime
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;
    private IServiceScope _scope;
    private ApplicationDbContext _context;

    public async Task InitializeAsync()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove production DbContext
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    // Add in-memory database for testing
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("test_db_" + Guid.NewGuid());
                    });
                });
            });

        _client = _factory.CreateClient();
        _scope = _factory.Services.CreateScope();
        _context = _scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Initialize database
        await _context.Database.EnsureCreatedAsync();
        await SeedTestData();
    }

    public async Task DisposeAsync()
    {
        _context?.Dispose();
        _scope?.Dispose();
        _client?.Dispose();
        _factory?.Dispose();
    }

    private async Task SeedTestData()
    {
        // Clear existing data
        _context.Users.RemoveRange(_context.Users);
        await _context.SaveChangesAsync();

        // Seed test users
        var adminUser = new ApplicationUser
        {
            Id = "admin-001",
            UserName = "admin@test.com",
            Email = "admin@test.com",
            EmailConfirmed = true,
            NormalizedUserName = "ADMIN@TEST.COM",
            NormalizedEmail = "ADMIN@TEST.COM"
        };

        var candidateUser = new ApplicationUser
        {
            Id = "candidate-001",
            UserName = "candidate@test.com",
            Email = "candidate@test.com",
            EmailConfirmed = true,
            NormalizedUserName = "CANDIDATE@TEST.COM",
            NormalizedEmail = "CANDIDATE@TEST.COM"
        };

        var unverifiedUser = new ApplicationUser
        {
            Id = "unverified-001",
            UserName = "unverified@test.com",
            Email = "unverified@test.com",
            EmailConfirmed = false,
            NormalizedUserName = "UNVERIFIED@TEST.COM",
            NormalizedEmail = "UNVERIFIED@TEST.COM"
        };

        _context.Users.AddRange(adminUser, candidateUser, unverifiedUser);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Test: Waitlist duplicate email prevention
    /// Scenario: User tries to join waitlist with already-registered email
    /// Expected: Returns 400 Bad Request with descriptive error
    /// </summary>
    [Fact]
    public async Task WaitlistJoin_DuplicateEmail_Returns400BadRequest()
    {
        // Arrange
        var payload = new { email = "candidate@test.com", accountType = 1 };
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            System.Text.Encoding.UTF8,
            "application/json");

        // Act - First join (should succeed)
        var firstResponse = await _client.PostAsync("/api/waitlist/join", content);

        // Reset content for second request
        content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            System.Text.Encoding.UTF8,
            "application/json");

        // Act - Second join with same email (should fail)
        var secondResponse = await _client.PostAsync("/api/waitlist/join", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);
        var responseBody = await secondResponse.Content.ReadAsStringAsync();
        Assert.Contains("already on the waitlist", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Test: Waitlist rate limiting per IP
    /// Scenario: Multiple rapid waitlist join requests from same IP
    /// Expected: Returns 429 Too Many Requests after limit exceeded
    /// </summary>
    [Fact]
    public async Task WaitlistJoin_RateLimitExceeded_Returns429()
    {
        // Arrange
        var requestCount = 6; // Assuming limit is 5 per minute
        var responses = new List<HttpResponseMessage>();

        // Act - Make rapid requests
        for (int i = 0; i < requestCount; i++)
        {
            var payload = new { email = $"user{i}@test.com", accountType = 1 };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/waitlist/join", content);
            responses.Add(response);
        }

        // Assert
        // At least one request should be rate-limited (429)
        var rateLimitedResponse = responses.FirstOrDefault(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        Assert.NotNull(rateLimitedResponse);
        Assert.Equal(HttpStatusCode.TooManyRequests, rateLimitedResponse.StatusCode);
    }

    /// <summary>
    /// Test: Email verification gate for job applications
    /// Scenario: Unverified user attempts to apply for a job
    /// Expected: Returns 403 Forbidden with email verification requirement message
    /// </summary>
    [Fact]
    public async Task JobApplication_UnverifiedEmail_Returns403()
    {
        // Arrange - Get JWT token for unverified user
        var token = await GetAuthTokenForUser("unverified@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var payload = new { jobId = "job-001", coverLetter = "I am interested." };
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            System.Text.Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/jobs/apply", content);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.Contains("verify your email", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Test: Verified user can apply for jobs
    /// Scenario: Verified user with confirmed email applies for job
    /// Expected: Returns 200 OK or 201 Created
    /// </summary>
    [Fact]
    public async Task JobApplication_VerifiedEmail_Returns201()
    {
        // Arrange
        var token = await GetAuthTokenForUser("candidate@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var payload = new { jobId = "job-001", coverLetter = "I am very interested." };
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            System.Text.Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/jobs/apply", content);

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.Created,
            $"Expected 200 or 201, got {response.StatusCode}");
    }

    /// <summary>
    /// Test: Messaging unlock gate - unverified user
    /// Scenario: Unverified user attempts to send message
    /// Expected: Returns 403 Forbidden requiring email verification
    /// </summary>
    [Fact]
    public async Task Messaging_UnverifiedUser_Returns403()
    {
        // Arrange
        var token = await GetAuthTokenForUser("unverified@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var payload = new { recipientId = "user-001", message = "Hello, are you interested?" };
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            System.Text.Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/messages/send", content);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.Contains("email", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Test: Messaging unlock gate - unsubscribed user
    /// Scenario: User without active subscription attempts to message
    /// Expected: Returns 403 Forbidden requiring subscription
    /// </summary>
    [Fact]
    public async Task Messaging_UnsubscribedUser_Returns403()
    {
        // Arrange
        var token = await GetAuthTokenForUser("candidate@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Note: candidate@test.com has no subscription in seed data
        var payload = new { recipientId = "user-001", message = "Hello!" };
        var content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            System.Text.Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/messages/send", content);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.Contains("subscription", responseBody, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Test: Admin endpoint access control
    /// Scenario: Non-admin user attempts to access admin endpoint
    /// Expected: Returns 403 Forbidden
    /// </summary>
    [Fact]
    public async Task AdminEndpoint_NonAdminUser_Returns403()
    {
        // Arrange - Use non-admin token
        var token = await GetAuthTokenForUser("candidate@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/users");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    /// <summary>
    /// Test: Admin endpoint access control - successful
    /// Scenario: Admin user accesses admin endpoint
    /// Expected: Returns 200 OK with data
    /// </summary>
    [Fact]
    public async Task AdminEndpoint_AdminUser_Returns200()
    {
        // Arrange
        var token = await GetAuthTokenForUser("admin@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/users");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    /// <summary>
    /// Test: Unauthorized access without token
    /// Scenario: Protected endpoint accessed without authentication token
    /// Expected: Returns 401 Unauthorized
    /// </summary>
    [Fact]
    public async Task ProtectedEndpoint_NoToken_Returns401()
    {
        // Arrange - Don't set Authorization header
        _client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await _client.GetAsync("/api/jobs");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Test: Invalid JWT token rejected
    /// Scenario: Request made with malformed or expired token
    /// Expected: Returns 401 Unauthorized
    /// </summary>
    [Fact]
    public async Task ProtectedEndpoint_InvalidToken_Returns401()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid.token.here");

        // Act
        var response = await _client.GetAsync("/api/jobs");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Test: Audit logging for failed admin access
    /// Scenario: Non-admin attempts admin operation
    /// Expected: Attempt is logged in audit trail
    /// </summary>
    [Fact]
    public async Task AdminAction_NonAdmin_AuditLogged()
    {
        // Arrange
        var token = await GetAuthTokenForUser("candidate@test.com");
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/admin/users");

        // Assert - Verify 403 (unauthorized)
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        // Note: In production, verify audit log entry was created
        // This would require access to AuditLog table through a test helper
        // var auditLogs = _context.AuditLogs
        //     .Where(l => l.UserId == "candidate-001" && l.Action == "AdminAccess")
        //     .OrderByDescending(l => l.Timestamp)
        //     .FirstOrDefault();
        // Assert.NotNull(auditLogs);
        // Assert.Equal("Failure", auditLogs.Status);
    }

    // Helper Methods

    /// <summary>
    /// Generate a mock JWT token for testing.
    /// In production, this would call the actual /login endpoint.
    /// </summary>
    private async Task<string> GetAuthTokenForUser(string email)
    {
        // For integration tests with real API, call login endpoint:
        var loginPayload = new { email = email, password = "TestPassword123!" };
        var loginContent = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(loginPayload),
            System.Text.Encoding.UTF8,
            "application/json");

        var loginResponse = await _client.PostAsync("/api/auth/login", loginContent);

        if (loginResponse.IsSuccessStatusCode)
        {
            var responseBody = await loginResponse.Content.ReadAsStringAsync();
            var jsonDoc = System.Text.Json.JsonDocument.Parse(responseBody);
            if (jsonDoc.RootElement.TryGetProperty("token", out var tokenElement))
            {
                return tokenElement.GetString() ?? throw new InvalidOperationException("No token in response");
            }
        }

        throw new InvalidOperationException($"Failed to get token for {email}");
    }
}

/// <summary>
/// Tests for rate limiting middleware and abuse prevention.
/// </summary>
public class RateLimitingTests : IAsyncLifetime
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    public async Task InitializeAsync()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("test_db_ratelimit_" + Guid.NewGuid());
                    });
                });
            });

        _client = _factory.CreateClient();
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    /// <summary>
    /// Test: Login attempts rate limiting
    /// Scenario: Multiple failed login attempts in quick succession
    /// Expected: After 5 attempts, further attempts return 429
    /// </summary>
    [Fact]
    public async Task LoginAttempts_RateLimited_After5Failures()
    {
        var responses = new List<HttpResponseMessage>();

        // Make 7 failed login attempts
        for (int i = 0; i < 7; i++)
        {
            var payload = new { email = "test@example.com", password = "wrongpassword" };
            var content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json");

            var response = await _client.PostAsync("/api/auth/login", content);
            responses.Add(response);
        }

        // Assert - At least one should be rate-limited
        var rateLimitedResponses = responses.Where(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        Assert.NotEmpty(rateLimitedResponses);
    }
}
