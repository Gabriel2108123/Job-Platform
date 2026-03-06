using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/offers")]
[Authorize]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offerService;
    private readonly IOrgAuthorizationService _orgAuthService;

    public OffersController(
        IOfferService offerService,
        IOrgAuthorizationService orgAuthService)
    {
        _offerService = offerService;
        _orgAuthService = orgAuthService;
    }

    [HttpPost]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<OfferDto>> CreateOffer([FromBody] CreateOfferDto dto)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _offerService.CreateOfferAsync(organizationId, dto, userId);
        return CreatedAtAction(nameof(GetOffer), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OfferDto>> GetOffer(Guid id)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var offer = await _offerService.GetOfferAsync(organizationId, id);
        if (offer == null) return NotFound();

        return Ok(offer);
    }

    [HttpGet("application/{applicationId}")]
    public async Task<ActionResult<IEnumerable<OfferDto>>> GetApplicationOffers(Guid applicationId)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var result = await _offerService.GetApplicationOffersAsync(organizationId, applicationId);
        return Ok(result);
    }

    [HttpPost("{id}/decide")]
    public async Task<ActionResult<OfferDto>> DecideOffer(Guid id, [FromBody] DecideOfferDto dto)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _offerService.DecideOfferAsync(organizationId, id, dto, userId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<IActionResult> DeleteOffer(Guid id)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        await _offerService.DeleteOfferAsync(organizationId, id, userId);
        return NoContent();
    }
}
