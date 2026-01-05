using HospitalityPlatform.Entitlements.DTOs;
using HospitalityPlatform.Entitlements.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/entitlements")]
[Authorize]
public class EntitlementsController : ControllerBase
{
    private readonly IEntitlementsService _entitlementsService;
    private readonly ILogger<EntitlementsController> _logger;

    public EntitlementsController(IEntitlementsService entitlementsService, ILogger<EntitlementsController> logger)
    {
        _entitlementsService = entitlementsService;
        _logger = logger;
    }

    [HttpGet("{organizationId}")]
    [Authorize(Policy = "RequireOrganizationAccess")]
    public async Task<ActionResult<List<EntitlementLimitDto>>> GetEntitlements(Guid organizationId)
    {
        try
        {
            var entitlements = await _entitlementsService.GetOrganizationEntitlementsAsync(organizationId);
            return Ok(entitlements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching entitlements for organization {OrganizationId}", organizationId);
            return StatusCode(500, new { error = "Failed to fetch entitlements" });
        }
    }

    [HttpGet("{organizationId}/check/{limitType}")]
    [Authorize(Policy = "RequireOrganizationAccess")]
    public async Task<ActionResult<object>> CheckLimit(Guid organizationId, string limitType)
    {
        try
        {
            if (!Enum.TryParse<HospitalityPlatform.Entitlements.Enums.LimitType>(limitType, out var parsedLimitType))
            {
                return BadRequest(new { error = $"Invalid limit type: {limitType}" });
            }

            var hasReached = await _entitlementsService.HasReachedLimitAsync(organizationId, parsedLimitType);
            var remaining = await _entitlementsService.GetRemainingLimitAsync(organizationId, parsedLimitType);

            return Ok(new
            {
                limitType,
                hasReachedLimit = hasReached,
                remainingLimit = remaining
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking limit {LimitType} for organization {OrganizationId}", 
                limitType, organizationId);
            return StatusCode(500, new { error = "Failed to check limit" });
        }
    }
}
