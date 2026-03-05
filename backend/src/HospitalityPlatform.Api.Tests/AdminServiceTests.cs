using HospitalityPlatform.Api.DTOs;
using HospitalityPlatform.Api.Services;
using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Billing.Enums;
using HospitalityPlatform.Database;
using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Applications.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalityPlatform.Api.Tests;

/// <summary>
/// Unit tests for AdminService using InMemory database
/// </summary>
public class AdminServiceTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly Mock<ILogger<AdminService>> _mockLogger;
    private readonly AdminService _adminService;
    private readonly string _databaseName;

    public AdminServiceTests()
    {
        _databaseName = Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: _databaseName)
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _mockLogger = new Mock<ILogger<AdminService>>();
        _adminService = new AdminService(_dbContext, _mockLogger.Object);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    // ==================== USER MANAGEMENT TESTS ====================

    [Fact]
    public async Task GetUsersAsync_ReturnsPagedUsers()
    {
        // Arrange
        _dbContext.Users.AddRange(new List<ApplicationUser>
        {
            new() { Id = Guid.NewGuid(), Email = "user1@test.com", UserName = "user1@test.com", IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Email = "user2@test.com", UserName = "user2@test.com", IsActive = true, CreatedAt = DateTime.UtcNow }
        });
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetUsersAsync(1, 20);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.TotalCount);
    }

    [Fact]
    public async Task GetUserAsync_ReturnsUser_WhenFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new ApplicationUser
        {
            Id = userId,
            Email = "test@test.com",
            UserName = "test@test.com",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            FirstName = "John",
            LastName = "Doe"
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetUserAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
        Assert.Equal("test@test.com", result.Email);
    }

    [Fact]
    public async Task GetUserAsync_ReturnsNull_WhenNotFound()
    {
        // Act
        var result = await _adminService.GetUserAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task SuspendUserAsync_SetIsActiveFalse_AndLogsAudit()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var user = new ApplicationUser { Id = userId, Email = "test@test.com", UserName = "test@test.com", IsActive = true };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        // Act
        await _adminService.SuspendUserAsync(userId, new SuspendUserDto { Reason = "Violation" }, adminId, "Admin");

        // Assert
        var updatedUser = await _dbContext.Users.FindAsync(userId);
        Assert.False(updatedUser.IsActive);
        Assert.True(_dbContext.AuditLogs.Any(l => l.Action == "UserSuspended" && l.EntityId == userId.ToString()));
    }

    [Fact]
    public async Task SuspendUserAsync_ThrowsException_WhenUserNotFound()
    {
        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _adminService.SuspendUserAsync(Guid.NewGuid(), new SuspendUserDto { Reason = "Test" }, Guid.NewGuid()));
        Assert.Equal("User not found", ex.Message);
    }

    [Fact]
    public async Task UnsuspendUserAsync_SetIsActiveTrue_AndLogsAudit()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var user = new ApplicationUser { Id = userId, Email = "test@test.com", UserName = "test@test.com", IsActive = false };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        // Act
        await _adminService.UnsuspendUserAsync(userId, adminId, "Admin");

        // Assert
        var updatedUser = await _dbContext.Users.FindAsync(userId);
        Assert.True(updatedUser.IsActive);
        Assert.True(_dbContext.AuditLogs.Any(l => l.Action == "UserUnsuspended" && l.EntityId == userId.ToString()));
    }

    // ==================== ORGANIZATION MANAGEMENT TESTS ====================

    [Fact]
    public async Task SuspendOrganizationAsync_SetIsActiveFalse_AndLogsAudit()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var org = new Organization { Id = orgId, Name = "Test Org", IsActive = true };

        _dbContext.Organizations.Add(org);
        await _dbContext.SaveChangesAsync();

        // Act
        await _adminService.SuspendOrganizationAsync(orgId, new SuspendOrganizationDto { Reason = "Test" }, adminId, "Admin");

        // Assert
        var updatedOrg = await _dbContext.Organizations.FindAsync(orgId);
        Assert.False(updatedOrg.IsActive);
        Assert.True(_dbContext.AuditLogs.Any(l => l.Action == "OrganizationSuspended"));
    }

    [Fact]
    public async Task UnsuspendOrganizationAsync_SetIsActiveTrue_AndLogsAudit()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var org = new Organization { Id = orgId, Name = "Test Org", IsActive = false };

        _dbContext.Organizations.Add(org);
        await _dbContext.SaveChangesAsync();

        // Act
        await _adminService.UnsuspendOrganizationAsync(orgId, adminId, "Admin");

        // Assert
        var updatedOrg = await _dbContext.Organizations.FindAsync(orgId);
        Assert.True(updatedOrg.IsActive);
        Assert.True(_dbContext.AuditLogs.Any(l => l.Action == "OrganizationUnsuspended"));
    }

    // ==================== SUBSCRIPTION MANAGEMENT TESTS ====================

    [Fact]
    public async Task GetSubscriptionsByStatusAsync_ReturnsSubscriptions_WithMatchingStatus()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var org = new Organization { Id = orgId, Name = "Test Org", IsActive = true };
        var subscriptions = new List<Subscription>
        {
            new()
            {
                Id = Guid.NewGuid(),
                OrganizationId = orgId,
                StripeSubscriptionId = "sub_1",
                StripeCustomerId = "cus_1",
                Status = SubscriptionStatus.Active,
                PriceInCents = 999,
                CreatedAt = DateTime.UtcNow,
                StartDate = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                OrganizationId = orgId,
                StripeSubscriptionId = "sub_2",
                StripeCustomerId = "cus_2",
                Status = SubscriptionStatus.Cancelled,
                PriceInCents = 999,
                CreatedAt = DateTime.UtcNow,
                StartDate = DateTime.UtcNow
            }
        };

        _dbContext.Organizations.Add(org);
        _dbContext.Subscriptions.AddRange(subscriptions);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetSubscriptionsByStatusAsync("Active");

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("Active", result.First().Status);
    }

    // ==================== METRICS TESTS ====================

    [Fact]
    public async Task GetPlatformMetricsAsync_ReturnsValidMetrics()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        
        var users = new List<ApplicationUser>
        {
            new() { Id = userId, Email = "user1@test.com", UserName = "user1@test.com", IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Email = "user2@test.com", UserName = "user2@test.com", IsActive = false, CreatedAt = DateTime.UtcNow }
        };

        var orgs = new List<Organization>
        {
            new() { Id = orgId, Name = "Org1", IsActive = true },
            new() { Id = Guid.NewGuid(), Name = "Org2", IsActive = false }
        };

        var jobs = new List<Job>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Job1",
                Description = "Desc",
                Location = "NYC",
                OrganizationId = orgs[0].Id,
                CreatedByUserId = users[0].Id.ToString()
            }
        };

        var subscriptions = new List<Subscription>
        {
            new()
            {
                Id = Guid.NewGuid(),
                OrganizationId = orgs[0].Id,
                StripeSubscriptionId = "sub_1",
                StripeCustomerId = "cus_1",
                Status = SubscriptionStatus.Active,
                PriceInCents = 9999,
                CreatedAt = DateTime.UtcNow,
                StartDate = DateTime.UtcNow
            }
        };

        _dbContext.Users.AddRange(users);
        _dbContext.Organizations.AddRange(orgs);
        _dbContext.Jobs.AddRange(jobs);
        _dbContext.Subscriptions.AddRange(subscriptions);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetPlatformMetricsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalUsers);
        Assert.Equal(1, result.ActiveUsers);
        Assert.Equal(1, result.SuspendedUsers);
        Assert.Equal(2, result.TotalOrganizations);
        Assert.Equal(1, result.ActiveOrganizations);
        Assert.Equal(1, result.SuspendedOrganizations);
        Assert.Equal(1, result.TotalJobs);
        Assert.Equal(1, result.TotalSubscriptions);
        Assert.Equal(1, result.ActiveSubscriptions);
        Assert.Equal(99.99m, result.MrrActive);
    }

    // ==================== AUDIT LOG TESTS ====================

    [Fact]
    public async Task GetAuditLogsAsync_ReturnsPagedAuditLogs()
    {
        // Arrange
        var auditLogs = new List<AuditLog>
        {
            new() { Id = Guid.NewGuid(), Action = "UserCreated", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow, Details = "{}" },
            new() { Id = Guid.NewGuid(), Action = "UserSuspended", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow, Details = "{}" }
        };

        _dbContext.AuditLogs.AddRange(auditLogs);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetAuditLogsAsync(1, 20);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.TotalCount);
    }

    [Fact]
    public async Task GetAuditLogsByActionAsync_ReturnsLogsMatchingAction()
    {
        // Arrange
        var auditLogs = new List<AuditLog>
        {
            new() { Id = Guid.NewGuid(), Action = "UserSuspended", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow, Details = "{}" },
            new() { Id = Guid.NewGuid(), Action = "UserCreated", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow, Details = "{}" }
        };

        _dbContext.AuditLogs.AddRange(auditLogs);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetAuditLogsByActionAsync("UserSuspended", 1, 20);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal("UserSuspended", result.Items[0].Action);
    }

    [Fact]
    public async Task GetAuditLogsByUserAsync_ReturnsLogsMatchingUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var auditLogs = new List<AuditLog>
        {
            new() { Id = Guid.NewGuid(), Action = "UserSuspended", UserId = userId, Timestamp = DateTime.UtcNow, Details = "{}" },
            new() { Id = Guid.NewGuid(), Action = "UserCreated", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow, Details = "{}" }
        };

        _dbContext.AuditLogs.AddRange(auditLogs);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _adminService.GetAuditLogsByUserAsync(userId, 1, 20);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal(userId, result.Items[0].UserId);
    }
}