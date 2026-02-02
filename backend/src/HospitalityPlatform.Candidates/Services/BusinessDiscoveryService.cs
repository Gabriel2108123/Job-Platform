using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Jobs.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Services;

public class BusinessDiscoveryService : IBusinessDiscoveryService
{
    private readonly ICandidatesDbContext _context;
    private readonly IJobsDbContext _jobsContext;
    private readonly ICoworkerDiscoveryService _coworkerDiscoveryService;
    private readonly ICandidateIdentityService _identityService;
    private readonly ILogger<BusinessDiscoveryService> _logger;

    public BusinessDiscoveryService(
        ICandidatesDbContext context,
        IJobsDbContext jobsContext,
        ICoworkerDiscoveryService coworkerDiscoveryService,
        ICandidateIdentityService identityService,
        ILogger<BusinessDiscoveryService> logger)
    {
        _context = context;
        _jobsContext = jobsContext;
        _coworkerDiscoveryService = coworkerDiscoveryService;
        _identityService = identityService;
        _logger = logger;
    }

    public async Task<List<NearbyCandidateDto>> GetNearbyCandidatesAsync(Guid jobId, double radiusKm = 10)
    {
        // 1. Get Job Location
        var job = await _jobsContext.Jobs.FirstOrDefaultAsync(j => j.Id == jobId);
        if (job == null || (job.LatApprox == null && job.LatExact == null))
        {
            return new List<NearbyCandidateDto>();
        }

        double jobLat = (double)(job.LatExact ?? job.LatApprox ?? 0);
        double jobLng = (double)(job.LngExact ?? job.LngApprox ?? 0);

        // 2. Find Candidates with at least one work experience enabled on map
        // and discoverable by workplaces
        var optInCandidates = await _context.CandidateMapSettings
            .Where(s => s.DiscoverableByWorkplaces)
            .Select(s => s.CandidateUserId)
            .ToListAsync();

        if (!optInCandidates.Any()) return new List<NearbyCandidateDto>();

        var candidateWorkExperiences = await _context.WorkExperiences
            .Where(w => optInCandidates.Contains(w.CandidateUserId) && w.IsMapEnabled && w.LatApprox != null)
            .ToListAsync();

        var nearbyCandidates = new List<NearbyCandidateDto>();
        var processedCandidates = new HashSet<Guid>();

        foreach (var work in candidateWorkExperiences)
        {
            if (processedCandidates.Contains(work.CandidateUserId)) continue;

            double candLat = (double)work.LatApprox!.Value;
            double candLng = (double)work.LngApprox!.Value;

            double distance = CalculateDistance(jobLat, jobLng, candLat, candLng);

            if (distance <= radiusKm)
            {
                var connectionCount = await _coworkerDiscoveryService.GetAcceptedConnectionCountAsync(work.CandidateUserId);
                var profiles = await _identityService.GetUserProfilesAsync(new[] { work.CandidateUserId });
                string candidateName = "Anonymous Worker";
                
                if (profiles.TryGetValue(work.CandidateUserId, out var profile))
                {
                    candidateName = $"{profile.FirstName} {profile.LastName}";
                }

                nearbyCandidates.Add(new NearbyCandidateDto
                {
                    CandidateUserId = work.CandidateUserId,
                    Name = candidateName,
                    DistanceKm = Math.Round(distance, 1),
                    VerifiedConnectionCount = connectionCount,
                    CurrentRole = work.RoleTitle,
                    CurrentEmployer = work.EmployerName,
                    LatApprox = candLat,
                    LngApprox = candLng
                });

                processedCandidates.Add(work.CandidateUserId);
            }
        }

        return nearbyCandidates.OrderBy(c => c.DistanceKm).ToList();
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371; // Radius of the Earth in km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private double ToRadians(double deg) => deg * (Math.PI / 180);
}
