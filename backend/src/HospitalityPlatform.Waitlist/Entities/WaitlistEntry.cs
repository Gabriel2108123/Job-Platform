using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Waitlist.Enums;

namespace HospitalityPlatform.Waitlist.Entities;

/// <summary>
/// Represents a candidate or business on the waitlist
/// </summary>
public class WaitlistEntry : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Normalized email (lowercase, trimmed) for case-insensitive uniqueness
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    public AccountType AccountType { get; set; }
    
    /// <summary>
    /// Business name or profession for the applicant
    /// </summary>
    public string BusinessOrProfession { get; set; } = string.Empty;
    
    public string Location { get; set; } = string.Empty;
    
    /// <summary>
    /// Sequence number assigned per account type (Business sequence separate from Candidate)
    /// Used to determine if eligible for early-joiner incentive
    /// </summary>
    public int SequenceNumber { get; set; }
    
    /// <summary>
    /// Incentive awarded based on sequence number and account type
    /// </summary>
    public IncentiveType IncentiveAwarded { get; set; } = IncentiveType.None;
    
    /// <summary>
    /// Optional referral code (for future referral program)
    /// </summary>
    public string? ReferralCode { get; set; }
    
    /// <summary>
    /// Source of signup (e.g. "landing_page")
    /// </summary>
    public string? Source { get; set; }
}
