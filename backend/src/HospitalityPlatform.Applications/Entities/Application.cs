using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Applications.Enums;

namespace HospitalityPlatform.Applications.Entities;

/// <summary>
/// Represents a candidate's application to a job posting
/// </summary>
public class Application : BaseEntity
{
    public Guid JobId { get; set; }
    public string CandidateUserId { get; set; } = string.Empty;
    public ApplicationStatus CurrentStatus { get; set; }
    
    public string? CoverLetter { get; set; }
    public string? CvFileUrl { get; set; }
    
    public DateTime AppliedAt { get; set; }
}
