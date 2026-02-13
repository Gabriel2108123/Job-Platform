using HospitalityPlatform.Identity.DTOs;
using HospitalityPlatform.Identity.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Identity.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly DbContext _context;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(
        UserManager<ApplicationUser> userManager,
        DbContext context,
        ILogger<ProfileService> logger)
    {
        _userManager = userManager;
        _context = context;
        _logger = logger;
    }

    public async Task<ProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        var profile = await _context.Set<CandidateProfile>()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var roles = await _userManager.GetRolesAsync(user);

        return new ProfileDto
        {
            Id = user.Id.ToString(),
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = profile?.Bio,
            ResumeJson = profile?.ResumeJson,
            Role = roles.FirstOrDefault(),
            PreferredJobRoleIds = profile?.PreferredJobRoleIds?.ToList()
        };
    }

    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new KeyNotFoundException($"User {userId} not found");
        }

        // Update User info
        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.ProfilePictureUrl != null) user.ProfilePictureUrl = dto.ProfilePictureUrl;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to update user: {errors}");
        }

        // Update Candidate Profile (if applicable)
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Candidate"))
        {
            var profile = await _context.Set<CandidateProfile>()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile != null)
            {
                if (dto.Bio != null) profile.Bio = dto.Bio;
                if (dto.ResumeJson != null) profile.ResumeJson = dto.ResumeJson;
                if (dto.PreferredJobRoleIds != null) profile.PreferredJobRoleIds = dto.PreferredJobRoleIds.ToArray();
                profile.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            else 
            {
                // Create profile if it doesn't exist but should
                profile = new CandidateProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    DateOfBirth = DateTime.UtcNow.AddYears(-20), // Fallback
                    Bio = dto.Bio,
                    ResumeJson = dto.ResumeJson,
                    PreferredJobRoleIds = dto.PreferredJobRoleIds?.ToArray(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Set<CandidateProfile>().Add(profile);
                await _context.SaveChangesAsync();
            }
        }

        return (await GetProfileAsync(userId))!;
    }
}
