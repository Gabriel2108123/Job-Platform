using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Billing.Entities;

/// <summary>
/// Tracks outreach credit balance for an organization
/// </summary>
public class OrganizationCredit : TenantEntity
{
    public new required Guid OrganizationId { get; set; }
    
    /// <summary>
    /// Current available credit balance
    /// </summary>
    public int Balance { get; set; } = 0;
    
    /// <summary>
    /// Total credits ever purchased/awarded
    /// </summary>
    public int TotalLifetimeCredits { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
