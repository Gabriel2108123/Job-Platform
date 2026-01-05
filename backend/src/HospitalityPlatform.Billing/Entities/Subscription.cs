using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Billing.Enums;

namespace HospitalityPlatform.Billing.Entities;

/// <summary>
/// Represents a Stripe subscription for an organization
/// </summary>
public class Subscription : TenantEntity
{
    /// <summary>
    /// Organization ID (shadows parent property to clarify intent)
    /// </summary>
    public new required Guid OrganizationId { get; set; }
    
    /// <summary>
    /// Stripe Subscription ID
    /// </summary>
    public required string StripeSubscriptionId { get; set; }
    
    /// <summary>
    /// Stripe Customer ID
    /// </summary>
    public required string StripeCustomerId { get; set; }
    
    /// <summary>
    /// Current subscription status
    /// </summary>
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    
    /// <summary>
    /// Plan type
    /// </summary>
    public PlanType PlanType { get; set; }
    
    /// <summary>
    /// Subscription start date
    /// </summary>
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Next billing date
    /// </summary>
    public DateTime? NextBillingDate { get; set; }
    
    /// <summary>
    /// Cancellation date
    /// </summary>
    public DateTime? CancelledAt { get; set; }
    
    /// <summary>
    /// Monthly price in cents
    /// </summary>
    public int PriceInCents { get; set; }
    
    /// <summary>
    /// Trial end date if applicable
    /// </summary>
    public DateTime? TrialEndsAt { get; set; }
}
