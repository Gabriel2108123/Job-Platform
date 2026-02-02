using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface IWorkExperienceService
{
    Task<List<WorkExperienceDto>> GetWorkExperiencesAsync(Guid candidateId);
    Task<WorkExperienceDto?> GetWorkExperienceByIdAsync(Guid id, Guid candidateId);
    Task<WorkExperienceDto> CreateWorkExperienceAsync(Guid candidateId, CreateWorkExperienceDto dto);
    Task<WorkExperienceDto?> UpdateWorkExperienceAsync(Guid id, Guid candidateId, UpdateWorkExperienceDto dto);
    Task<bool> DeleteWorkExperienceAsync(Guid id, Guid candidateId);
    
    // Business view support
    Task<List<WorkExperienceDto>> GetVisibleWorkExperiencesForApplicationAsync(Guid applicationId, Guid candidateId);
    Task<List<WorkExperienceDto>> GetPublicWorkExperiencesAsync(Guid candidateId, bool isShortlisted);
}
