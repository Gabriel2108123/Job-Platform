using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Billing.Entities;

/// <summary>
/// Records an outreach activity to a candidate
/// </summary>
public class OutreachActivity : TenantEntity
{
    public new required Guid OrganizationId { get; set; }
    
    /// <summary>
    /// ID of the user who performed the outreach
    /// </summary>
    public required string PerformedByUserId { get; set; }
    
    /// <summary>
    /// The candidate being contacted
    /// </summary>
    public required Guid CandidateUserId { get; set; }
    
    /// <summary>
    /// Optional reference to the job this outreach is for
    /// </summary>
    public Guid? JobId { get; set; }
    
    /// <summary>
    /// Number of credits deduct for this outreach (usually 1)
    /// </summary>
    public int CreditsDeducted { get; set; } = 1;
    
    /// <summary>
    /// External reference for the message (e.g., conversation ID)
    /// </summary>
    public string? ExternalReference { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
