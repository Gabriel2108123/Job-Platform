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
using Moq.EntityFrameworkCore;
using Xunit;

namespace HospitalityPlatform.Api.Tests;

/// <summary>
/// Unit tests for AdminService with mocked database context
/// </summary>
public class AdminServiceTests
{
    private readonly Mock<ApplicationDbContext> _mockDbContext;
    private readonly Mock<ILogger<AdminService>> _mockLogger;
    private readonly AdminService _adminService;

    public AdminServiceTests()
    {
        _mockDbContext = new Mock<ApplicationDbContext>(new DbContextOptions<ApplicationDbContext>());
        _mockLogger = new Mock<ILogger<AdminService>>();
        _adminService = new AdminService(_mockDbContext.Object, _mockLogger.Object);
    }

    // ==================== USER MANAGEMENT TESTS ====================

    [Fact]
    public async Task GetUsersAsync_ReturnsPagedUsers()
    {
        // Arrange
        var users = new List<ApplicationUser>
        {
            new() { Id = Guid.NewGuid(), Email = "user1@test.com", IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Email = "user2@test.com", IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(users);

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
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            FirstName = "John",
            LastName = "Doe"
        };

        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(new[] { user });

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
        // Arrange
        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(new List<ApplicationUser>());

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
        var user = new ApplicationUser { Id = userId, Email = "test@test.com", IsActive = true };

        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(new[] { user });
        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(new List<AuditLog>());
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _adminService.SuspendUserAsync(userId, new SuspendUserDto { Reason = "Violation" }, adminId, "Admin");

        // Assert
        Assert.False(user.IsActive);
        _mockDbContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeast(1));
    }

    [Fact]
    public async Task SuspendUserAsync_ThrowsException_WhenUserNotFound()
    {
        // Arrange
        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(new List<ApplicationUser>());

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => 
            _adminService.SuspendUserAsync(Guid.NewGuid(), new SuspendUserDto { Reason = "Test" }, Guid.NewGuid()));
    }

    [Fact]
    public async Task UnsuspendUserAsync_SetIsActiveTrue_AndLogsAudit()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var user = new ApplicationUser { Id = userId, Email = "test@test.com", IsActive = false };

        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(new[] { user });
        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(new List<AuditLog>());
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _adminService.UnsuspendUserAsync(userId, adminId, "Admin");

        // Assert
        Assert.True(user.IsActive);
        _mockDbContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeast(1));
    }

    // ==================== ORGANIZATION MANAGEMENT TESTS ====================

    [Fact]
    public async Task SuspendOrganizationAsync_SetIsActiveFalse_AndLogsAudit()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var org = new Organization { Id = orgId, Name = "Test Org", IsActive = true, Users = new List<ApplicationUser>() };

        _mockDbContext.Setup(x => x.Organizations).ReturnsDbSet(new[] { org });
        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(new List<AuditLog>());
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _adminService.SuspendOrganizationAsync(orgId, new SuspendOrganizationDto { Reason = "Test" }, adminId, "Admin");

        // Assert
        Assert.False(org.IsActive);
        _mockDbContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeast(1));
    }

    [Fact]
    public async Task UnsuspendOrganizationAsync_SetIsActiveTrue_AndLogsAudit()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var org = new Organization { Id = orgId, Name = "Test Org", IsActive = false, Users = new List<ApplicationUser>() };

        _mockDbContext.Setup(x => x.Organizations).ReturnsDbSet(new[] { org });
        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(new List<AuditLog>());
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _adminService.UnsuspendOrganizationAsync(orgId, adminId, "Admin");

        // Assert
        Assert.True(org.IsActive);
        _mockDbContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeast(1));
    }

    // ==================== SUBSCRIPTION MANAGEMENT TESTS ====================

    [Fact]
    public async Task GetSubscriptionsByStatusAsync_ReturnsSubscriptions_WithMatchingStatus()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var org = new Organization { Id = orgId, Name = "Test Org", IsActive = true, Users = new List<ApplicationUser>() };
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

        _mockDbContext.Setup(x => x.Subscriptions).ReturnsDbSet(subscriptions);
        _mockDbContext.Setup(x => x.Organizations).ReturnsDbSet(new[] { org });

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
        var users = new List<ApplicationUser>
        {
            new() { Id = Guid.NewGuid(), Email = "user1@test.com", IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Email = "user2@test.com", IsActive = false, CreatedAt = DateTime.UtcNow }
        };

        var orgs = new List<Organization>
        {
            new() { Id = Guid.NewGuid(), Name = "Org1", IsActive = true, Users = new List<ApplicationUser>() },
            new() { Id = Guid.NewGuid(), Name = "Org2", IsActive = false, Users = new List<ApplicationUser>() }
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

        _mockDbContext.Setup(x => x.Users).ReturnsDbSet(users);
        _mockDbContext.Setup(x => x.Organizations).ReturnsDbSet(orgs);
        _mockDbContext.Setup(x => x.Jobs).ReturnsDbSet(jobs);
        _mockDbContext.Setup(x => x.Applications).ReturnsDbSet(new List<Application>());
        _mockDbContext.Setup(x => x.Subscriptions).ReturnsDbSet(subscriptions);
        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(new List<AuditLog>());

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
            new() { Id = Guid.NewGuid(), Action = "UserCreated", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Action = "UserSuspended", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow }
        };

        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(auditLogs);

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
            new() { Id = Guid.NewGuid(), Action = "UserSuspended", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Action = "UserCreated", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow }
        };

        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(auditLogs);

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
            new() { Id = Guid.NewGuid(), Action = "UserSuspended", UserId = userId, Timestamp = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Action = "UserCreated", UserId = Guid.NewGuid(), Timestamp = DateTime.UtcNow }
        };

        _mockDbContext.Setup(x => x.AuditLogs).ReturnsDbSet(auditLogs);

        // Act
        var result = await _adminService.GetAuditLogsByUserAsync(userId, 1, 20);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal(userId, result.Items[0].UserId);    }
}