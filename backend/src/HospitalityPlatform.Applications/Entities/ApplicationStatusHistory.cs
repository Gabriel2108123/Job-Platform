using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Applications.Enums;

namespace HospitalityPlatform.Applications.Entities;

/// <summary>
/// Audit trail for application status transitions
/// </summary>
public class ApplicationStatusHistory : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public ApplicationStatus? FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    
    public string ChangedByUserId { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string? Notes { get; set; }
    
    // Pre-hire checks specific fields
    public bool? PreHireCheckConfirmation { get; set; }
    public string? PreHireCheckConfirmationText { get; set; }
}
