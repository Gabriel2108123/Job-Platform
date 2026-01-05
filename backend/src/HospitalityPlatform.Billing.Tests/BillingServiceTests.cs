using HospitalityPlatform.Billing.Services;
using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Entitlements.Enums;
using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Billing.Enums;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Billing.Tests;

public class BillingServiceTests
{
    private readonly Mock<IBillingDbContext> _mockDbContext;
    private readonly Mock<ILogger<BillingService>> _mockLogger;
    private readonly BillingService _service;

    public BillingServiceTests()
    {
        _mockDbContext = new Mock<IBillingDbContext>();
        _mockLogger = new Mock<ILogger<BillingService>>();
        _service = new BillingService(_mockDbContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetPlansAsync_ReturnsActivePlans()
    {
        // Arrange
        var plans = new List<Plan>
        {
            new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                Description = "Professional plan",
                Type = PlanType.Pro,
                PriceInCents = 2999,
                StripeProductId = "prod_123",
                StripePriceId = "price_456",
                IsActive = true
            }
        }.AsQueryable();

        _mockDbContext.Setup(x => x.Plans).Returns(
            new MockDbSet<Plan>(plans)
        );

        // Act
        var result = await _service.GetPlansAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("Pro", result[0].Name);
    }

    [Fact]
    public async Task ProcessWebhookEventAsync_ReturnsFalseForDuplicateEvent()
    {
        // Arrange
        var eventId = "evt_12345";
        var existingEvent = new WebhookEvent
        {
            Id = Guid.NewGuid(),
            StripeEventId = eventId,
            EventType = "customer.subscription.created",
            Payload = "{}",
            IsProcessed = true
        };

        var events = new List<WebhookEvent> { existingEvent }.AsQueryable();
        _mockDbContext.Setup(x => x.WebhookEvents).Returns(
            new MockDbSet<WebhookEvent>(events)
        );

        // Act
        var result = await _service.ProcessWebhookEventAsync(eventId, "customer.subscription.created", "{}");

        // Assert
        Assert.False(result);
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
