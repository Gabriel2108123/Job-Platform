using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Enums;

namespace HospitalityPlatform.Jobs.Services;

public interface IApplicationService
{
    // Apply to a job
    Task<ApplicationDto> ApplyToJobAsync(Guid jobId, CreateApplicationDto dto, Guid candidateId, Guid organizationId);
    
    // Get application by ID
    Task<ApplicationDto?> GetApplicationByIdAsync(Guid applicationId);
    
    // Get applications for a candidate
    Task<PagedResult<ApplicationDto>> GetCandidateApplicationsAsync(Guid candidateId, int pageNumber = 1, int pageSize = 20);
    
    // Get applications for a job (employer view)
    Task<PagedResult<ApplicationDto>> GetJobApplicationsAsync(Guid jobId, int pageNumber = 1, int pageSize = 20);
    
    // Update application status (move through pipeline)
    Task<ApplicationDto> UpdateApplicationStatusAsync(Guid applicationId, UpdateApplicationStatusDto dto, Guid movedByUserId);
    
    // Get Kanban pipeline view for a job
    Task<PipelineKanbanDto> GetPipelineKanbanAsync(Guid jobId);
    
    // Confirm pre-hire checks (mandatory before hiring)
    Task<ApplicationDto> ConfirmPreHireChecksAsync(Guid applicationId, PreHireConfirmationDto dto, Guid confirmedByUserId);
    
    // Check if application can be hired (pre-hire check confirmed)
    Task<bool> CanHireAsync(Guid applicationId);
}
