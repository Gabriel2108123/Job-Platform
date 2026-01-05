using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Jobs.Enums;

namespace HospitalityPlatform.Jobs.Entities;

/// <summary>
/// Represents a candidate's application to a job
/// </summary>
public class Application : BaseEntity
{
    public Guid JobId { get; set; }
    public Guid CandidateId { get; set; } // User ID of the candidate
    public Guid OrganizationId { get; set; } // Organization that posted the job
    
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public string? CoverLetter { get; set; }
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    
    // Pipeline tracking
    public DateTime? ScreenedAt { get; set; }
    public DateTime? InterviewedAt { get; set; }
    public DateTime? OfferedAt { get; set; }
    public DateTime? PreHireChecksStartedAt { get; set; }
    public DateTime? HiredAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }
    
    // Rejection reason
    public string? RejectionReason { get; set; }
    
    // Navigation properties
    public Job? Job { get; set; }
}
