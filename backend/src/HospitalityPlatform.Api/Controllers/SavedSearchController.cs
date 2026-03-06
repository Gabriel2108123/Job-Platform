using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Services;
using HospitalityPlatform.Auth.Policies;
using HospitalityPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/saved-searches")]
[Authorize(Policy = PolicyNames.RequireBusinessRole)]
public class SavedSearchController : ControllerBase
{
    private readonly ISavedSearchService _savedSearchService;
    private readonly IOrgAuthorizationService _orgAuth;

    public SavedSearchController(ISavedSearchService savedSearchService, IOrgAuthorizationService orgAuth)
    {
        _savedSearchService = savedSearchService;
        _orgAuth = orgAuth;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<SavedSearchDto>>> GetSavedSearches()
    {
        var userId = GetUserId();
        var organizationId = await _orgAuth.GetUserOrganizationIdAsync(userId);
        
        if (!organizationId.HasValue) return Forbid();

        var results = await _savedSearchService.GetSavedSearchesAsync(userId, organizationId.Value);
        return Ok(results);
    }

    [HttpPost]
    public async Task<ActionResult<SavedSearchDto>> Create(CreateSavedSearchDto dto)
    {
        var userId = GetUserId();
        var organizationId = await _orgAuth.GetUserOrganizationIdAsync(userId);
        
        if (!organizationId.HasValue) return Forbid();

        var result = await _savedSearchService.CreateSavedSearchAsync(userId, organizationId.Value, dto);
        return CreatedAtAction(nameof(GetSavedSearches), result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SavedSearchDto>> Update(Guid id, UpdateSavedSearchDto dto)
    {
        var userId = GetUserId();
        var result = await _savedSearchService.UpdateSavedSearchAsync(id, userId, dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        await _savedSearchService.DeleteSavedSearchAsync(id, userId);
        return NoContent();
    }
}
