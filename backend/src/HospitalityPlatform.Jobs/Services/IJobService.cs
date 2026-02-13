using HospitalityPlatform.Jobs.DTOs;

namespace HospitalityPlatform.Jobs.Services;

public interface IJobService
{
    Task<JobDto> CreateJobAsync(CreateJobDto dto, string userId, Guid organizationId);
    Task<JobDto> UpdateJobAsync(Guid jobId, UpdateJobDto dto, string userId);
    Task<JobDto> PublishJobAsync(Guid jobId, string userId);
    Task CloseJobAsync(Guid jobId, string userId);
    Task<JobDto?> GetJobByIdAsync(Guid jobId);
    Task<PagedResult<JobDto>> GetJobsByOrganizationAsync(Guid organizationId, int pageNumber = 1, int pageSize = 20);
    Task<PagedResult<JobDto>> SearchJobsAsync(SearchJobsDto searchDto);
    Task IncrementJobViewAsync(Guid jobId);
    Task<OrganizationAnalyticsDto> GetOrganizationAnalyticsAsync(Guid organizationId);
    
    /// <summary>
    /// Backfill coordinates for jobs that are missing lat/lng data.
    /// Returns count of jobs updated.
    /// </summary>
    Task<int> BackfillCoordinatesAsync();
}
