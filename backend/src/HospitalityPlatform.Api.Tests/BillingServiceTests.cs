using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Billing.Enums;
using HospitalityPlatform.Billing.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace HospitalityPlatform.Api.Tests;

public class BillingServiceTests
{
    private readonly Mock<IBillingDbContext> _mockContext;
    private readonly Mock<ILogger<BillingService>> _mockLogger;
    private readonly BillingService _service;

    public BillingServiceTests()
    {
        _mockContext = new Mock<IBillingDbContext>();
        _mockLogger = new Mock<ILogger<BillingService>>();
        _service = new BillingService(_mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task ProcessWebhook_SubscriptionUpdated_UpdatesStatus()
    {
        // Arrange
        var subId = "sub_test_123";
        var subscription = new Subscription 
        { 
            OrganizationId = Guid.NewGuid(),
            StripeSubscriptionId = subId, 
            StripeCustomerId = "cus_test_123",
            Status = SubscriptionStatus.Incomplete 
        };

        _mockContext.Setup(c => c.WebhookEvents).ReturnsDbSet(new List<WebhookEvent>());
        _mockContext.Setup(c => c.Subscriptions).ReturnsDbSet(new List<Subscription> { subscription });
        
        // Mock payload for 'customer.subscription.updated' with 'active' status
        var payload = $@"
        {{
            ""data"": {{
                ""object"": {{
                    ""id"": ""{subId}"",
                    ""status"": ""active"",
                    ""current_period_end"": 1735689600
                }}
            }}
        }}";

        // Act
        var result = await _service.ProcessWebhookEventAsync("evt_1", "customer.subscription.updated", payload);

        // Assert
        Assert.True(result);
        Assert.Equal(SubscriptionStatus.Active, subscription.Status);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task ProcessWebhook_SubscriptionDeleted_CancelsSubscription()
    {
        // Arrange
        var subId = "sub_del_123";
        var subscription = new Subscription 
        { 
            OrganizationId = Guid.NewGuid(),
            StripeSubscriptionId = subId, 
            StripeCustomerId = "cus_test_123",
            Status = SubscriptionStatus.Active 
        };

        _mockContext.Setup(c => c.WebhookEvents).ReturnsDbSet(new List<WebhookEvent>());
        _mockContext.Setup(c => c.Subscriptions).ReturnsDbSet(new List<Subscription> { subscription });

        var payload = $@"
        {{
            ""data"": {{
                ""object"": {{
                    ""id"": ""{subId}""
                }}
            }}
        }}";

        // Act
        var result = await _service.ProcessWebhookEventAsync("evt_2", "customer.subscription.deleted", payload);

        // Assert
        Assert.True(result);
        Assert.Equal(SubscriptionStatus.Cancelled, subscription.Status);
        Assert.NotNull(subscription.CancelledAt);
    }

    [Fact]
    public async Task ProcessWebhook_DuplicateEvent_ReturnsFalse()
    {
        // Arrange
        var existingEvent = new WebhookEvent 
        { 
            StripeEventId = "evt_dup",
            EventType = "type",
            Payload = "{}"
        };
        _mockContext.Setup(c => c.WebhookEvents).ReturnsDbSet(new List<WebhookEvent> { existingEvent });

        // Act
        var result = await _service.ProcessWebhookEventAsync("evt_dup", "type", "{}");

        // Assert
        Assert.False(result);
        _mockContext.Verify(c => c.WebhookEvents.Add(It.IsAny<WebhookEvent>()), Times.Never);
    }
}
