using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Entities;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Services;

public class CoworkerDiscoveryService : ICoworkerDiscoveryService
{
    private readonly ICandidatesDbContext _context;
    private readonly ICandidateIdentityService _identityService;
    private readonly ILogger<CoworkerDiscoveryService> _logger;

    public CoworkerDiscoveryService(
        ICandidatesDbContext context, 
        ICandidateIdentityService identityService,
        ILogger<CoworkerDiscoveryService> logger)
    {
        _context = context;
        _identityService = identityService;
        _logger = logger;
    }

    public async Task<List<PotentialCoworkerDto>> FindPotentialCoworkersAsync(Guid candidateId)
    {
        // 1. Check if candidate is opted-in
        var settings = await _context.CandidateMapSettings
            .FirstOrDefaultAsync(s => s.CandidateUserId == candidateId);

        if (settings == null || !settings.DiscoverableByWorkplaces)
        {
            return new List<PotentialCoworkerDto>();
        }

        // 2. Get candidate's work experiences with PlaceKeys
        var myWorks = await _context.WorkExperiences
            .Where(w => w.CandidateUserId == candidateId && w.PlaceKey != null)
            .ToListAsync();

        if (!myWorks.Any()) return new List<PotentialCoworkerDto>();

        var placeKeys = myWorks.Select(w => w.PlaceKey).Distinct().ToList();

        // 3. Find matches
        // Match conditions:
        // - Same PlaceKey
        // - Different User
        // - User is DiscoverableByWorkplaces
        
        var matches = await _context.WorkExperiences
            // Ideally retrieve settings efficiently. Here assuming Join is needed or query optimization.
            // But since we can't join easily across contexts if separated (though here it is same DB),
            // we will query WorkExperiences then Settings.
            .Where(w => placeKeys.Contains(w.PlaceKey) && w.CandidateUserId != candidateId)
            .ToListAsync();

        if (!matches.Any()) return new List<PotentialCoworkerDto>();

        var candidateIds = matches.Select(m => m.CandidateUserId).Distinct().ToList();
        
        var discoverableCandidates = await _context.CandidateMapSettings
            .Where(s => candidateIds.Contains(s.CandidateUserId) && s.DiscoverableByWorkplaces)
            .Select(s => s.CandidateUserId)
            .ToListAsync();
            
        var discoverableSet = new HashSet<Guid>(discoverableCandidates);

        // Filter matches
        var validMatches = matches.Where(m => discoverableSet.Contains(m.CandidateUserId)).ToList();
        
        if (!validMatches.Any()) return new List<PotentialCoworkerDto>();

        // 4. Get User Profiles
        var userProfiles = await _identityService.GetUserProfilesAsync(validMatches.Select(m => m.CandidateUserId).Distinct());

        var results = new List<PotentialCoworkerDto>();

        foreach (var myWork in myWorks)
        {
            foreach (var match in validMatches)
            {
                if (match.PlaceKey != myWork.PlaceKey) continue;
                
                // Calculate Overlap
                var start1 = myWork.StartDate ?? DateTime.MinValue;
                var end1 = myWork.EndDate ?? DateTime.Today;
                var start2 = match.StartDate ?? DateTime.MinValue;
                var end2 = match.EndDate ?? DateTime.Today;

                var overlapStart = start1 > start2 ? start1 : start2;
                var overlapEnd = end1 < end2 ? end1 : end2;

                if (overlapEnd > overlapStart)
                {
                     var days = (overlapEnd - overlapStart).Days;
                     if (days > 30) // Minimum overlap
                     {
                         if (userProfiles.TryGetValue(match.CandidateUserId, out var profile))
                         {
                             results.Add(new PotentialCoworkerDto
                             {
                                 CandidateUserId = match.CandidateUserId,
                                 FirstName = profile.FirstName,
                                 LastNameInitial = !string.IsNullOrEmpty(profile.LastName) ? profile.LastName.Substring(0, 1) : "",
                                 SharedWorkplace = match.EmployerName, // Or normalized
                                 PlaceKey = match.PlaceKey!,
                                 OverlapStart = overlapStart,
                                 OverlapEnd = overlapEnd,
                                 OverlapDays = days
                             });
                         }
                     }
                }
            }
        }

        return results.DistinctBy(r => new { r.CandidateUserId, r.PlaceKey }).ToList();
    }

    public async Task<int> GetPotentialCoworkerCountAsync(Guid candidateId)
    {
        var potential = await FindPotentialCoworkersAsync(candidateId);
        return potential.Select(p => p.CandidateUserId).Distinct().Count();
    }

    public async Task<int> GetAcceptedConnectionCountAsync(Guid candidateId)
    {
        return await _context.CoworkerConnections
            .CountAsync(c => (c.RequesterId == candidateId || c.ReceiverId == candidateId) && c.Status == "Accepted");
    }
}
