using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Entities;

namespace HospitalityPlatform.Billing.Services;

public interface IBillingService
{
    /// <summary>
    /// Create a new subscription for an organization
    /// </summary>
    Task<SubscriptionDto> CreateSubscriptionAsync(Guid organizationId, string planType, string stripePaymentMethodId);
    
    /// <summary>
    /// Get subscription for an organization
    /// </summary>
    Task<SubscriptionDto?> GetSubscriptionAsync(Guid organizationId);
    
    /// <summary>
    /// Cancel subscription
    /// </summary>
    Task<bool> CancelSubscriptionAsync(Guid organizationId);
    
    /// <summary>
    /// Get available plans
    /// </summary>
    Task<List<PlanDto>> GetPlansAsync();
    
    /// <summary>
    /// Process Stripe webhook event idempotently
    /// </summary>
    Task<bool> ProcessWebhookEventAsync(string stripeEventId, string eventType, string payload);
}
