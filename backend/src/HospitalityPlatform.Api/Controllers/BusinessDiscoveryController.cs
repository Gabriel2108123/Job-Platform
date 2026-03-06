using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Services;
using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using HospitalityPlatform.Entitlements.Guards;
using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Entitlements.Enums;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/business/discovery")]
[Authorize(Policy = "RequireBusinessRole")]
public class BusinessDiscoveryController : ControllerBase
{
    private readonly IBusinessDiscoveryService _discoveryService;
    private readonly IOutreachService _outreachService;
    private readonly IEntitlementGuard _entitlementGuard;
    private readonly IEntitlementsService _entitlementsService;
    private readonly ILogger<BusinessDiscoveryController> _logger;

    public BusinessDiscoveryController(
        IBusinessDiscoveryService discoveryService,
        IOutreachService outreachService,
        IEntitlementGuard entitlementGuard,
        IEntitlementsService entitlementsService,
        ILogger<BusinessDiscoveryController> logger)
    {
        _discoveryService = discoveryService;
        _outreachService = outreachService;
        _entitlementGuard = entitlementGuard;
        _entitlementsService = entitlementsService;
        _logger = logger;
    }

    /// <summary>
    /// Find discoverable candidates near a specific job location
    /// </summary>
    [HttpGet("nearby/{jobId}")]
    public async Task<ActionResult<List<NearbyCandidateDto>>> GetNearbyCandidates(Guid jobId, [FromQuery] double radiusKm = 10)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        // Check entitlements
        await _entitlementGuard.MustHaveAvailableLimitAsync(organizationId, LimitType.CandidateSearchLimit);

        var candidates = await _discoveryService.GetNearbyCandidatesAsync(jobId, radiusKm);

        // Increment usage
        await _entitlementsService.IncrementUsageAsync(organizationId, LimitType.CandidateSearchLimit);

        return Ok(candidates);
    }

    /// <summary>
    /// Get current organization's outreach credit balance
    /// </summary>
    [HttpGet("credits")]
    public async Task<ActionResult<int>> GetCreditBalance()
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var balance = await _outreachService.GetCreditBalanceAsync(organizationId);
        return Ok(balance);
    }

    /// <summary>
    /// Contact a candidate (deducts 1 credit)
    /// </summary>
    [HttpPost("outreach")]
    public async Task<ActionResult<OutreachResultDto>> SendOutreach([FromBody] OutreachRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var orgIdClaim = User.FindFirst("org_id")?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return Unauthorized();
        }

        var result = await _outreachService.SendOutreachAsync(organizationId, userId, request);
        
        if (!result.Success)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(result);
    }
}
