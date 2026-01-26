using HospitalityPlatform.Identity.DTOs;

namespace HospitalityPlatform.Identity.Services;

public interface IProfileService
{
    Task<ProfileDto?> GetProfileAsync(Guid userId);
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
}
