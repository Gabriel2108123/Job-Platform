using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Entitlements.Enums;

namespace HospitalityPlatform.Entitlements.Entities;

/// <summary>
/// Represents plan limits for an organization
/// Limits are based on subscription plan type
/// </summary>
public class EntitlementLimit : TenantEntity
{
    /// <summary>
    /// Organization ID (shadows parent property to clarify intent)
    /// </summary>
    public new required Guid OrganizationId { get; set; }
    
    /// <summary>
    /// Type of limit (e.g., JobsPostingLimit)
    /// </summary>
    public LimitType LimitType { get; set; }
    
    /// <summary>
    /// Maximum allowed value
    /// </summary>
    public int MaxLimit { get; set; }
    
    /// <summary>
    /// Current usage
    /// </summary>
    public int CurrentUsage { get; set; }
    
    /// <summary>
    /// Plan type this limit applies to
    /// </summary>
    public PlanType PlanType { get; set; }
    
    /// <summary>
    /// Reset date for usage tracking (monthly)
    /// </summary>
    public DateTime? ResetDate { get; set; }
}
