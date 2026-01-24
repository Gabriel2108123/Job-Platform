using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Billing.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Billing.Services;

public class BillingService : IBillingService
{
    private readonly IBillingDbContext _dbContext;
    private readonly ILogger<BillingService> _logger;
    
    // In production, use actual Stripe API keys
    private const string StripeApiKey = "sk_test_placeholder";

    public BillingService(IBillingDbContext dbContext, ILogger<BillingService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<SubscriptionDto> CreateSubscriptionAsync(Guid organizationId, string planType, string stripePaymentMethodId)
    {
        // Validate plan type
        if (!Enum.TryParse<PlanType>(planType, out var parsedPlanType))
        {
            throw new ArgumentException($"Invalid plan type: {planType}");
        }

        // Get plan details (in production, fetch from Stripe)
        var plan = await _dbContext.Plans
            .FirstOrDefaultAsync(p => p.Type == parsedPlanType && p.IsActive)
            ?? throw new InvalidOperationException($"Plan {planType} not found or inactive");

        // Create subscription record
        var subscription = new Subscription
        {
            OrganizationId = organizationId,
            StripeSubscriptionId = $"sub_test_{Guid.NewGuid():N}",
            StripeCustomerId = $"cus_test_{Guid.NewGuid():N}",
            Status = SubscriptionStatus.Active,
            PlanType = parsedPlanType,
            StartDate = DateTime.UtcNow,
            NextBillingDate = DateTime.UtcNow.AddMonths(1),
            PriceInCents = plan.PriceInCents
        };

        _dbContext.Subscriptions.Add(subscription);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created subscription {SubscriptionId} for organization {OrganizationId}", 
            subscription.Id, organizationId);

        return MapToDto(subscription);
    }

    public async Task<SubscriptionDto?> GetSubscriptionAsync(Guid organizationId)
    {
        var subscription = await _dbContext.Subscriptions
            .FirstOrDefaultAsync(s => s.OrganizationId == organizationId);

        return subscription == null ? null : MapToDto(subscription);
    }

    public async Task<bool> CancelSubscriptionAsync(Guid organizationId)
    {
        var subscription = await _dbContext.Subscriptions
            .FirstOrDefaultAsync(s => s.OrganizationId == organizationId)
            ?? throw new InvalidOperationException("Subscription not found");

        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.CancelledAt = DateTime.UtcNow;

        _dbContext.Subscriptions.Update(subscription);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Cancelled subscription {SubscriptionId} for organization {OrganizationId}", 
            subscription.Id, organizationId);

        return true;
    }

    public async Task<List<PlanDto>> GetPlansAsync()
    {
        var plans = await _dbContext.Plans
            .Where(p => p.IsActive)
            .Select(p => new PlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                PlanType = p.Type.ToString(),
                PriceInCents = p.PriceInCents,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return plans;
    }

    public async Task<bool> ProcessWebhookEventAsync(string stripeEventId, string eventType, string payload)
    {
        // Check for duplicate event (idempotency)
        var existingEvent = await _dbContext.WebhookEvents
            .FirstOrDefaultAsync(e => e.StripeEventId == stripeEventId);

        if (existingEvent != null)
        {
            _logger.LogWarning("Webhook event {EventId} already processed", stripeEventId);
            return false; // Already processed
        }

        var webhookEvent = new WebhookEvent
        {
            StripeEventId = stripeEventId,
            EventType = eventType,
            Payload = payload,
            IsProcessed = false,
            ReceivedAt = DateTime.UtcNow
        };

        _dbContext.WebhookEvents.Add(webhookEvent);
        await _dbContext.SaveChangesAsync();

        // Process specific event types
        try
        {
            var json = System.Text.Json.JsonDocument.Parse(payload);
            var dataObject = json.RootElement.GetProperty("data").GetProperty("object");
            var stripeSubscriptionId = dataObject.GetProperty("id").GetString();
            
            if (string.IsNullOrEmpty(stripeSubscriptionId)) 
                throw new Exception("Stripe Subscription ID missing from payload");

            var subscription = await _dbContext.Subscriptions
                .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscriptionId);

            switch (eventType)
            {
                case "customer.subscription.created":
                case "customer.subscription.updated":
                    // Status mapping
                    var statusStr = dataObject.GetProperty("status").GetString();
                    var currentPeriodEnd = DateTimeOffset.FromUnixTimeSeconds(dataObject.GetProperty("current_period_end").GetInt64()).UtcDateTime;
                    
                    if (subscription == null)
                    {
                        // Identify Organization by metadata if available, or Stripe Customer ID mapping
                        // For MVP, we might assume subscription calls CreateSubscriptionAsync first usually.
                        // But if created via Portal, we need to map customer.
                        // Assuming payload has metadata with organizationId
                        if (dataObject.TryGetProperty("metadata", out var metadata) && 
                            metadata.TryGetProperty("organizationId", out var orgIdElem) &&
                            Guid.TryParse(orgIdElem.GetString(), out var orgId))
                        {
                            subscription = new Subscription
                            {
                                OrganizationId = orgId,
                                StripeSubscriptionId = stripeSubscriptionId,
                                StripeCustomerId = dataObject.GetProperty("customer").GetString() ?? "",
                                CreatedAt = DateTime.UtcNow
                            };
                            _dbContext.Subscriptions.Add(subscription);
                        }
                        else
                        {
                            _logger.LogWarning("Could not link new subscription {SubId} to organization", stripeSubscriptionId);
                            break;
                        }
                    }

                    subscription.Status = ParseStripeStatus(statusStr);
                    subscription.NextBillingDate = currentPeriodEnd;
                    subscription.UpdatedAt = DateTime.UtcNow;
                    break;

                case "customer.subscription.deleted":
                    if (subscription != null)
                    {
                        subscription.Status = SubscriptionStatus.Cancelled;
                        subscription.CancelledAt = DateTime.UtcNow;
                        subscription.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("Subscription {SubId} cancelled via webhook", stripeSubscriptionId);
                    }
                    else
                    {
                        _logger.LogWarning("Subscription {SubId} not found for deletion", stripeSubscriptionId);
                    }
                    break;
            }

            webhookEvent.IsProcessed = true;
            webhookEvent.ProcessedAt = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook event {EventId}", stripeEventId);
            webhookEvent.ErrorMessage = ex.Message;
        }

        _dbContext.WebhookEvents.Update(webhookEvent);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    private static SubscriptionDto MapToDto(Subscription subscription) => new()
    {
        Id = subscription.Id,
        OrganizationId = subscription.OrganizationId,
        StripeSubscriptionId = subscription.StripeSubscriptionId,
        Status = subscription.Status.ToString(),
        PlanType = subscription.PlanType.ToString(),
        StartDate = subscription.StartDate,
        NextBillingDate = subscription.NextBillingDate,
        CancelledAt = subscription.CancelledAt,
        PriceInCents = subscription.PriceInCents,
        TrialEndsAt = subscription.TrialEndsAt
    };

    private static SubscriptionStatus ParseStripeStatus(string? status)
    {
        return status switch
        {
            "active" => SubscriptionStatus.Active,
            "trialing" => SubscriptionStatus.Trialing,
            "past_due" => SubscriptionStatus.PastDue,
            "canceled" => SubscriptionStatus.Cancelled,
            "incomplete" => SubscriptionStatus.Incomplete,
            _ => SubscriptionStatus.Incomplete
        };
    }
}
