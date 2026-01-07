using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Enums;

namespace HospitalityPlatform.Applications.Services;

public interface IPipelineService
{
    Task<ApplicationDto> MoveApplicationAsync(
        Guid applicationId,
        ApplicationStatus toStatus,
        string userId,
        Guid organizationId,
        string? notes = null,
        bool? preHireConfirmation = null,
        string? preHireConfirmationText = null);
    
    Task<PipelineViewDto> GetPipelineViewAsync(Guid jobId, Guid organizationId);
}

public class PipelineViewDto
{
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public Dictionary<ApplicationStatus, List<ApplicationCardDto>> Stages { get; set; } = new();
}

public class ApplicationCardDto
{
    public Guid Id { get; set; }
    public string CandidateUserId { get; set; } = string.Empty;
    public string? CandidateName { get; set; }
    public ApplicationStatus CurrentStatus { get; set; }
    public DateTime AppliedAt { get; set; }
    public string? CoverLetterPreview { get; set; }
}
