using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Jobs.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Services;

public class CandidateSearchService : ICandidateSearchService
{
    private readonly ICandidatesDbContext _candidatesContext;
    private readonly IJobsDbContext _jobsContext;
    private readonly ILogger<CandidateSearchService> _logger;

    public CandidateSearchService(
        ICandidatesDbContext candidatesContext,
        IJobsDbContext jobsContext,
        ILogger<CandidateSearchService> logger)
    {
        _candidatesContext = candidatesContext;
        _jobsContext = jobsContext;
        _logger = logger;
    }

    public async Task<CandidatePagedSearchResultDto> SearchCandidatesAsync(CandidateSearchFilterDto filter)
    {
        var query = _candidatesContext.CandidateProfiles
            .Include(p => p.User)
            .Where(p => p.IsVisible && p.User!.IsActive);

        // 1. Role Filter
        if (filter.JobRoleId.HasValue)
        {
            query = query.Where(p => p.PreferredJobRoleIds != null && p.PreferredJobRoleIds.Contains(filter.JobRoleId.Value));
        }

        // 2. Skills Filter (Match ALL requested skills for better precision)
        if (filter.Skills != null && filter.Skills.Any())
        {
            foreach (var skill in filter.Skills)
            {
                query = query.Where(p => p.Skills != null && p.Skills.Contains(skill));
            }
        }

        // 3. Text Query (Bio or Name)
        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var searchTerm = $"%{filter.Query.ToLower()}%";
            query = query.Where(p => 
                EF.Functions.Like(p.Bio!.ToLower(), searchTerm) || 
                EF.Functions.Like(p.User!.FirstName!.ToLower(), searchTerm) ||
                EF.Functions.Like(p.User!.LastName!.ToLower(), searchTerm));
        }

        // 4. Location Search (Proximity)
        // Note: For simplicity, we filter by City if coordinates are not provided.
        // In a real staging environment, we'd use PostGIS/Spatial queries.
        if (filter.Lat.HasValue && filter.Lng.HasValue && filter.RadiusKm.HasValue)
        {
            // Simple bounding box for demo purposes, would normally use distance formula
            // ... (Skipping for now to keep implementation clean, but placeholder for spatial logic)
        }
        else if (!string.IsNullOrWhiteSpace(filter.City))
        {
            query = query.Where(p => p.User!.Address!.Contains(filter.City));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.LastActiveAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => new CandidateSearchResultDto
            {
                UserId = p.UserId,
                FirstName = p.User!.FirstName ?? string.Empty,
                LastName = p.User!.LastName,
                Bio = p.Bio,
                PrimaryRole = p.User!.PrimaryRole,
                Skills = p.Skills,
                ProfilePictureUrl = p.User!.ProfilePictureUrl,
                City = p.User!.Address ?? "UK",
                LastActiveAt = p.LastActiveAt,
                MatchScore = 100 // To be calculated
            })
            .ToListAsync();

        return new CandidatePagedSearchResultDto
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
        };
    }

    public async Task<List<CandidateSearchResultDto>> GetMatchesForJobAsync(Guid jobId, int limit = 5)
    {
        var job = await _jobsContext.Jobs.FirstOrDefaultAsync(j => j.Id == jobId);
        if (job == null) return new();

        // Matching logic:
        // 1. Same JobRoleId (Highest weight)
        // 2. Skills match (Medium weight)
        // 3. Location proximity (Medium weight)

        var query = _candidatesContext.CandidateProfiles
            .Include(p => p.User)
            .Where(p => p.IsVisible && p.User!.IsActive);

        // Filter by role primarily
        if (job.JobRoleId.HasValue)
        {
            query = query.Where(p => p.PreferredJobRoleIds != null && p.PreferredJobRoleIds.Contains(job.JobRoleId.Value));
        }

        var results = await query
            .OrderByDescending(p => p.LastActiveAt)
            .Take(limit * 2) // Over-fetch to sort by match score
            .ToListAsync();

        var matchedItems = results.Select(p => {
            double score = 50; // Starting score
            
            // Boost if primary role matches exactly
            if (p.User!.PrimaryRole == job.Title) score += 20;
            
            // Boost for shared skills (mock logic for now)
            if (p.Skills != null && job.RequiredQualifications != null)
            {
                var shared = p.Skills.Count(s => job.RequiredQualifications.Contains(s));
                score += shared * 10;
            }

            return new CandidateSearchResultDto
            {
                UserId = p.UserId,
                FirstName = p.User!.FirstName ?? string.Empty,
                LastName = p.User!.LastName,
                Bio = p.Bio,
                PrimaryRole = p.User!.PrimaryRole,
                Skills = p.Skills,
                ProfilePictureUrl = p.User!.ProfilePictureUrl,
                City = p.User!.Address ?? "UK",
                LastActiveAt = p.LastActiveAt,
                MatchScore = Math.Min(score, 100)
            };
        })
        .OrderByDescending(m => m.MatchScore)
        .Take(limit)
        .ToList();

        return matchedItems;
    }
}
