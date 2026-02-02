using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface ICoworkerDiscoveryService
{
    Task<List<PotentialCoworkerDto>> FindPotentialCoworkersAsync(Guid candidateId);
    Task<int> GetPotentialCoworkerCountAsync(Guid candidateId);
    Task<int> GetAcceptedConnectionCountAsync(Guid candidateId);
}
