using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Services;
using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/business/discovery")]
[Authorize(Policy = "RequireBusinessRole")]
public class BusinessDiscoveryController : ControllerBase
{
    private readonly IBusinessDiscoveryService _discoveryService;
    private readonly IOutreachService _outreachService;
    private readonly ILogger<BusinessDiscoveryController> _logger;

    public BusinessDiscoveryController(
        IBusinessDiscoveryService discoveryService,
        IOutreachService outreachService,
        ILogger<BusinessDiscoveryController> logger)
    {
        _discoveryService = discoveryService;
        _outreachService = outreachService;
        _logger = logger;
    }

    /// <summary>
    /// Find discoverable candidates near a specific job location
    /// </summary>
    [HttpGet("nearby/{jobId}")]
    public async Task<ActionResult<List<NearbyCandidateDto>>> GetNearbyCandidates(Guid jobId, [FromQuery] double radiusKm = 10)
    {
        var candidates = await _discoveryService.GetNearbyCandidatesAsync(jobId, radiusKm);
        return Ok(candidates);
    }

    /// <summary>
    /// Get current organization's outreach credit balance
    /// </summary>
    [HttpGet("credits")]
    public async Task<ActionResult<int>> GetCreditBalance()
    {
        var orgIdClaim = User.FindFirstValue("org_id");
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var orgIdClaim = User.FindFirstValue("org_id");

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
