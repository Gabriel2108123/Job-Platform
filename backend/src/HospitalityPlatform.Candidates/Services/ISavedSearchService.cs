using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface ISavedSearchService
{
    Task<List<SavedSearchDto>> GetSavedSearchesAsync(Guid userId, Guid organizationId);
    Task<SavedSearchDto> CreateSavedSearchAsync(Guid userId, Guid organizationId, CreateSavedSearchDto dto);
    Task<SavedSearchDto> UpdateSavedSearchAsync(Guid id, Guid userId, UpdateSavedSearchDto dto);
    Task DeleteSavedSearchAsync(Guid id, Guid userId);
}
