using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface ICandidateIdentityService
{
    Task<Dictionary<Guid, PotentialCoworkerProfileDto>> GetUserProfilesAsync(IEnumerable<Guid> userIds);
}

public class PotentialCoworkerProfileDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    // Minimal info for privacy
}
