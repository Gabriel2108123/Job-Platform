using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Services;
using HospitalityPlatform.Auth.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HospitalityPlatform.Entitlements.Guards;
using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Entitlements.Enums;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/search/candidates")]
[Authorize(Policy = PolicyNames.RequireBusinessRole)]
public class CandidateSearchController : ControllerBase
{
    private readonly ICandidateSearchService _searchService;
    private readonly IEntitlementGuard _entitlementGuard;
    private readonly IEntitlementsService _entitlementsService;

    public CandidateSearchController(
        ICandidateSearchService searchService,
        IEntitlementGuard entitlementGuard,
        IEntitlementsService entitlementsService)
    {
        _searchService = searchService;
        _entitlementGuard = entitlementGuard;
        _entitlementsService = entitlementsService;
    }

    [HttpGet]
    public async Task<ActionResult<CandidatePagedSearchResultDto>> Search([FromQuery] CandidateSearchFilterDto filter)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        // Check entitlements
        await _entitlementGuard.MustHaveAvailableLimitAsync(organizationId, LimitType.CandidateSearchLimit);

        var results = await _searchService.SearchCandidatesAsync(filter);

        // Increment usage
        await _entitlementsService.IncrementUsageAsync(organizationId, LimitType.CandidateSearchLimit);

        return Ok(results);
    }

    [HttpGet("matches/job/{jobId}")]
    public async Task<ActionResult<List<CandidateSearchResultDto>>> GetMatchesForJob(Guid jobId, [FromQuery] int limit = 5)
    {
        var matches = await _searchService.GetMatchesForJobAsync(jobId, limit);
        return Ok(matches);
    }
}
