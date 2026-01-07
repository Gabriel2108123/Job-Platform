using HospitalityPlatform.Applications.DTOs;

namespace HospitalityPlatform.Applications.Services;

public interface IApplicationService
{
    Task<ApplicationDto> ApplyToJobAsync(Guid jobId, CreateApplicationDto dto, string candidateUserId);
    Task<ApplicationDto?> GetApplicationByIdAsync(Guid applicationId, string? userId = null);
    Task<List<ApplicationDto>> GetApplicationsForJobAsync(Guid jobId, string userId, Guid organizationId);
    Task<List<ApplicationDto>> GetCandidateApplicationsAsync(string candidateUserId);
    Task WithdrawApplicationAsync(Guid applicationId, string candidateUserId);
    Task<List<ApplicationStatusHistoryDto>> GetApplicationHistoryAsync(Guid applicationId);
}
