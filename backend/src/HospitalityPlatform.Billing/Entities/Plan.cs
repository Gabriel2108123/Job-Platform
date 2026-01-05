using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Billing.Enums;

namespace HospitalityPlatform.Billing.Entities;

/// <summary>
/// Billing plan definition
/// </summary>
public class Plan : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public PlanType Type { get; set; }
    
    /// <summary>
    /// Monthly price in cents
    /// </summary>
    public int PriceInCents { get; set; }
    
    /// <summary>
    /// Stripe product ID
    /// </summary>
    public required string StripeProductId { get; set; }
    
    /// <summary>
    /// Stripe price ID
    /// </summary>
    public required string StripePriceId { get; set; }
    
    public bool IsActive { get; set; } = true;
}
