using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Applications.Enums;
using HospitalityPlatform.Audit.Services;
using HospitalityPlatform.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace HospitalityPlatform.Applications.Tests;

public class PipelineServiceTests
{
    private readonly Mock<IApplicationsDbContext> _mockContext;
    private readonly Mock<IAuditService> _mockAudit;
    private readonly Mock<ILogger<PipelineService>> _mockLogger;
    private readonly PipelineService _service;

    public PipelineServiceTests()
    {
        _mockContext = new Mock<IApplicationsDbContext>();
        _mockAudit = new Mock<IAuditService>();
        _mockLogger = new Mock<ILogger<PipelineService>>();
        _service = new PipelineService(_mockContext.Object, _mockAudit.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task MoveToHired_Fails_WithoutConfirmation()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var userId = "test-user";

        var application = new Application { 
            Id = appId, 
            JobId = jobId, 
            CurrentStatus = ApplicationStatus.PreHireChecks 
        };
        var job = new Job { Id = jobId, OrganizationId = orgId };

        _mockContext.Setup(c => c.Applications.FindAsync(appId)).ReturnsAsync(application);
        _mockContext.Setup(c => c.Jobs.FindAsync(jobId)).ReturnsAsync(job);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _service.MoveApplicationAsync(appId, ApplicationStatus.Hired, userId, orgId, null, false, null));
        
        Assert.Contains("confirmation is required", ex.Message);
    }

    [Fact]
    public async Task MoveToHired_Fails_WithoutConfirmationText()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var userId = "test-user";

        var application = new Application { 
            Id = appId, 
            JobId = jobId, 
            CurrentStatus = ApplicationStatus.PreHireChecks 
        };
        var job = new Job { Id = jobId, OrganizationId = orgId };

        _mockContext.Setup(c => c.Applications.FindAsync(appId)).ReturnsAsync(application);
        _mockContext.Setup(c => c.Jobs.FindAsync(jobId)).ReturnsAsync(job);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _service.MoveApplicationAsync(appId, ApplicationStatus.Hired, userId, orgId, null, true, ""));
        
        Assert.Contains("confirmation text must be provided", ex.Message);
    }

    [Fact]
    public async Task MoveToHired_Succeeds_WithValidCheck()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var userId = "test-user";
        var confText = "Right to work verified via passport check.";

        var application = new Application { 
            Id = appId, 
            JobId = jobId, 
            CurrentStatus = ApplicationStatus.PreHireChecks 
        };
        var job = new Job { Id = jobId, OrganizationId = orgId };

        _mockContext.Setup(c => c.Applications.FindAsync(appId)).ReturnsAsync(application);
        _mockContext.Setup(c => c.Jobs.FindAsync(jobId)).ReturnsAsync(job);
        
        // Setup for DbSets might be needed if SaveChanges is called, 
        // but for unit test we mostly want to verify the logic gate.
        var mockHistories = new Mock<DbSet<ApplicationStatusHistory>>();
        _mockContext.Setup(c => c.ApplicationStatusHistories).Returns(mockHistories.Object);

        // Act
        var result = await _service.MoveApplicationAsync(appId, ApplicationStatus.Hired, userId, orgId, "Notes", true, confText);

        // Assert
        Assert.Equal(ApplicationStatus.Hired, result.CurrentStatus);
        _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
        _mockAudit.Verify(a => a.LogAsync(
            "ApplicationStatusChanged", 
            "Application", 
            appId.ToString(), 
            It.IsAny<object>(), 
            userId, 
            orgId,
            default), Times.Once);
    }
}
