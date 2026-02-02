using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Services;
using HospitalityPlatform.Identity.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Api.Services;

public class CandidateIdentityService : ICandidateIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public CandidateIdentityService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Dictionary<Guid, PotentialCoworkerProfileDto>> GetUserProfilesAsync(IEnumerable<Guid> userIds)
    {
        var users = await _userManager.Users
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new 
            {
                u.Id,
                u.FirstName,
                u.LastName
            })
            .ToListAsync();

        return users.ToDictionary(u => u.Id, u => new PotentialCoworkerProfileDto
        {
            UserId = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName
        });
    }
}
