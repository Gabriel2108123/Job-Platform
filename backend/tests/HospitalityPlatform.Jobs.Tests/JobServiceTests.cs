using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Enums;
using HospitalityPlatform.Jobs.Services;
using HospitalityPlatform.Core.Services;
using HospitalityPlatform.Audit.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace HospitalityPlatform.Jobs.Tests;

public class JobServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IAuditService> _mockAudit;
    private readonly Mock<ILogger<JobService>> _mockLogger;
    private readonly Mock<ILocationService> _mockLocationService;
    private readonly JobService _service;

    public JobServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _mockAudit = new Mock<IAuditService>();
        _mockLogger = new Mock<ILogger<JobService>>();
        _mockLocationService = new Mock<ILocationService>();
        _mockLocationService.Setup(x => x.GetApproxCoordsAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((51.5074m, -0.1278m)); // Mock London coords

        _service = new JobService(_context, _mockAudit.Object, _mockLogger.Object, _mockLocationService.Object);
    }

    [Fact]
    public async Task CreateJobAsync_ShouldCreateJobInDraftStatus()
    {
        // Arrange
        var dto = new CreateJobDto
        {
            Title = "Test Job",
            Description = "Test Description",
            Location = "London",
            LocationVisibility = LocationVisibility.PrivateApprox,
            EmploymentType = EmploymentType.FullTime
        };
        var userId = "user-123";
        var orgId = Guid.NewGuid();

        // Act
        var result = await _service.CreateJobAsync(dto, userId, orgId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Title, result.Title);
        Assert.Equal(JobStatus.Draft, result.Status);
        
        var jobInDb = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == result.Id);
        Assert.NotNull(jobInDb);
        _mockAudit.Verify(a => a.LogAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<object>(), userId, orgId, It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task GetJobByIdAsync_ShouldReturnNull_WhenJobDoesNotExist()
    {
        // Arrange
        var jobId = Guid.NewGuid();

        // Act
        var result = await _service.GetJobByIdAsync(jobId);

        // Assert
        Assert.Null(result);
    }
}
