using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface ICandidateMapService
{
    Task<CandidateMapSettingsDto> GetSettingsAsync(Guid candidateId);
    Task<CandidateMapSettingsDto> UpdateSettingsAsync(Guid candidateId, UpdateCandidateMapSettingsDto dto);
}
