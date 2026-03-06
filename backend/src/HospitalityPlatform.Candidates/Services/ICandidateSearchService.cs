using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface ICandidateSearchService
{
    Task<CandidatePagedSearchResultDto> SearchCandidatesAsync(CandidateSearchFilterDto filter);
    Task<List<CandidateSearchResultDto>> GetMatchesForJobAsync(Guid jobId, int limit = 5);
}
