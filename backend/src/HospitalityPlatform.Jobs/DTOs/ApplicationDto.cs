using HospitalityPlatform.Jobs.Enums;

namespace HospitalityPlatform.Jobs.DTOs;

public class ApplicationDto
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateId { get; set; }
    public Guid OrganizationId { get; set; }
    
    public ApplicationStatus Status { get; set; }
    public string? CoverLetter { get; set; }
    public DateTime AppliedAt { get; set; }
    
    // Pipeline tracking
    public DateTime? ScreenedAt { get; set; }
    public DateTime? InterviewedAt { get; set; }
    public DateTime? OfferedAt { get; set; }
    public DateTime? PreHireChecksStartedAt { get; set; }
    public DateTime? HiredAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }
    
    public string? RejectionReason { get; set; }
    
    // Related job info
    public JobDto? Job { get; set; }
    
    // Pre-hire check status
    public bool PreHireCheckConfirmed { get; set; } = false;
}

public class CreateApplicationDto
{
    public Guid JobId { get; set; }
    public string? CoverLetter { get; set; }
}

public class UpdateApplicationStatusDto
{
    public ApplicationStatus Status { get; set; }
    public string? RejectionReason { get; set; }
}

public class PreHireConfirmationDto
{
    public Guid ApplicationId { get; set; }
    public bool RightToWorkConfirmed { get; set; }
    public string? ConfirmationText { get; set; }
}
