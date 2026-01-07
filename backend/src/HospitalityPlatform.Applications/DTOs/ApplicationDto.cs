using HospitalityPlatform.Applications.Enums;

namespace HospitalityPlatform.Applications.DTOs;

public class ApplicationDto
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string CandidateUserId { get; set; } = string.Empty;
    public string? CandidateName { get; set; }
    
    public ApplicationStatus CurrentStatus { get; set; }
    public string CurrentStatusName { get; set; } = string.Empty;
    
    public string? CoverLetter { get; set; }
    public string? CvFileUrl { get; set; }
    
    public DateTime AppliedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
