using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Entitlements.Enums;
using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Entitlements.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Entitlements.Tests;

public class EntitlementsServiceTests
{
    private readonly Mock<IEntitlementsDbContext> _mockDbContext;
    private readonly Mock<ILogger<EntitlementsService>> _mockLogger;
    private readonly EntitlementsService _service;

    public EntitlementsServiceTests()
    {
        _mockDbContext = new Mock<IEntitlementsDbContext>();
        _mockLogger = new Mock<ILogger<EntitlementsService>>();
        _service = new EntitlementsService(_mockDbContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task HasReachedLimitAsync_ReturnsTrueWhenLimitExceeded()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var limit = new EntitlementLimit
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            LimitType = LimitType.JobsPostingLimit,
            MaxLimit = 5,
            CurrentUsage = 5,
            PlanType = PlanType.Free
        };

        var limits = new List<EntitlementLimit> { limit }.AsQueryable();
        _mockDbContext.Setup(x => x.EntitlementLimits).Returns(
            new MockDbSet<EntitlementLimit>(limits)
        );

        // Act
        var result = await _service.HasReachedLimitAsync(organizationId, LimitType.JobsPostingLimit);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task GetRemainingLimitAsync_ReturnsCorrectValue()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var limit = new EntitlementLimit
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            LimitType = LimitType.CandidateSearchLimit,
            MaxLimit = 100,
            CurrentUsage = 30,
            PlanType = PlanType.Pro
        };

        var limits = new List<EntitlementLimit> { limit }.AsQueryable();
        _mockDbContext.Setup(x => x.EntitlementLimits).Returns(
            new MockDbSet<EntitlementLimit>(limits)
        );

        // Act
        var remaining = await _service.GetRemainingLimitAsync(organizationId, LimitType.CandidateSearchLimit);

        // Assert
        Assert.Equal(70, remaining);
    }

    [Fact]
    public async Task GetOrganizationEntitlementsAsync_ReturnsAllLimits()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var limits = new List<EntitlementLimit>
        {
            new EntitlementLimit
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                LimitType = LimitType.JobsPostingLimit,
                MaxLimit = 50,
                CurrentUsage = 10,
                PlanType = PlanType.Pro
            },
            new EntitlementLimit
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                LimitType = LimitType.CandidateSearchLimit,
                MaxLimit = 500,
                CurrentUsage = 100,
                PlanType = PlanType.Pro
            }
        }.AsQueryable();

        _mockDbContext.Setup(x => x.EntitlementLimits).Returns(
            new MockDbSet<EntitlementLimit>(limits)
        );

        // Act
        var result = await _service.GetOrganizationEntitlementsAsync(organizationId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
    }
}

public class MockDbSet<T> : DbSet<T> where T : class
{
    private readonly List<T> _data;
    private readonly IQueryable<T> _queryable;

    public MockDbSet(IQueryable<T> queryable)
    {
        _data = queryable.ToList();
        _queryable = queryable;
    }

    public override IQueryable<T> AsQueryable()
    {
        return _queryable;
    }

    public override void Add(T entity)
    {
        _data.Add(entity);
    }

    public override void Update(T entity)
    {
        var index = _data.FindIndex(e => e == entity);
        if (index >= 0)
        {
            _data[index] = entity;
        }
    }

    public override void Remove(T entity)
    {
        _data.Remove(entity);
    }
}
