using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface IBusinessDiscoveryService
{
    Task<List<NearbyCandidateDto>> GetNearbyCandidatesAsync(Guid jobId, double radiusKm = 10);
}
