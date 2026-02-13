using System.Security.Claims;
using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalityPlatform.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/candidate")]
public class CandidatesController : ControllerBase
{
    private readonly IWorkExperienceService _workExperienceService;
    private readonly ICandidateMapService _mapService;
    private readonly ICoworkerDiscoveryService _discoveryService;
    private readonly IConnectionService _connectionService;
    private readonly ILogger<CandidatesController> _logger;

    public CandidatesController(
        IWorkExperienceService workExperienceService,
        ICandidateMapService mapService,
        ICoworkerDiscoveryService discoveryService,
        IConnectionService connectionService,
        ILogger<CandidatesController> logger)
    {
        _workExperienceService = workExperienceService;
        _mapService = mapService;
        _discoveryService = discoveryService;
        _connectionService = connectionService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    #region Work Experience

    [HttpGet("work-experiences")]
    public async Task<ActionResult<List<WorkExperienceDto>>> GetWorkExperiences()
    {
        var userId = GetUserId();
        var result = await _workExperienceService.GetWorkExperiencesAsync(userId);
        return Ok(result);
    }

    [HttpGet("work-experiences/{id}")]
    public async Task<ActionResult<WorkExperienceDto>> GetWorkExperience(Guid id)
    {
        var userId = GetUserId();
        var result = await _workExperienceService.GetWorkExperienceByIdAsync(id, userId);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("work-experiences")]
    public async Task<ActionResult<WorkExperienceDto>> CreateWorkExperience([FromBody] CreateWorkExperienceDto dto)
    {
        var userId = GetUserId();
        var result = await _workExperienceService.CreateWorkExperienceAsync(userId, dto);
        return CreatedAtAction(nameof(GetWorkExperience), new { id = result.Id }, result);
    }

    [HttpPut("work-experiences/{id}")]
    public async Task<ActionResult<WorkExperienceDto>> UpdateWorkExperience(Guid id, [FromBody] UpdateWorkExperienceDto dto)
    {
        var userId = GetUserId();
        var result = await _workExperienceService.UpdateWorkExperienceAsync(id, userId, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("work-experiences/{id}")]
    public async Task<IActionResult> DeleteWorkExperience(Guid id)
    {
        var userId = GetUserId();
        var success = await _workExperienceService.DeleteWorkExperienceAsync(id, userId);
        if (!success) return NotFound();
        return NoContent();
    }

    #endregion

    #region Map Settings

    [HttpGet("map-settings")]
    public async Task<ActionResult<CandidateMapSettingsDto>> GetMapSettings()
    {
        var userId = GetUserId();
        var result = await _mapService.GetSettingsAsync(userId);
        return Ok(result);
    }

    [HttpPut("map-settings")]
    public async Task<ActionResult<CandidateMapSettingsDto>> UpdateMapSettings([FromBody] UpdateCandidateMapSettingsDto dto)
    {
        var userId = GetUserId();
        var result = await _mapService.UpdateSettingsAsync(userId, dto);
        return Ok(result);
    }

    #endregion

    #region Coworker Discovery

    [HttpGet("coworkers/potential")]
    public async Task<ActionResult<List<PotentialCoworkerDto>>> GetPotentialCoworkers()
    {
        var userId = GetUserId();
        var result = await _discoveryService.FindPotentialCoworkersAsync(userId);
        return Ok(result);
    }

    [HttpGet("coworkers/count")]
    public async Task<ActionResult<int>> GetPotentialCoworkersCount()
    {
        var userId = GetUserId();
        var result = await _discoveryService.GetPotentialCoworkerCountAsync(userId);
        return Ok(result);
    }

    #endregion

    #region Connections

    [HttpPost("connections/requests")]
    public async Task<ActionResult<ConnectionResultDto>> SendConnectionRequest([FromBody] SendConnectionRequestDto dto)
    {
        var userId = GetUserId();
        var result = await _connectionService.SendRequestAsync(userId, dto);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("connections/pending")]
    public async Task<ActionResult<List<ConnectionDto>>> GetPendingRequests()
    {
        var userId = GetUserId();
        var result = await _connectionService.GetPendingRequestsAsync(userId);
        return Ok(result);
    }

    [HttpGet("connections")]
    public async Task<ActionResult<List<ConnectionDto>>> GetConnections()
    {
        var userId = GetUserId();
        var result = await _connectionService.GetConnectionsAsync(userId);
        return Ok(result);
    }

    [HttpPost("connections/{id}/accept")]
    public async Task<IActionResult> AcceptConnection(Guid id)
    {
        var userId = GetUserId();
        var success = await _connectionService.AcceptRequestAsync(id, userId);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("connections/{id}/decline")]
    public async Task<IActionResult> DeclineConnection(Guid id)
    {
        var userId = GetUserId();
        var success = await _connectionService.DeclineRequestAsync(id, userId);
        if (!success) return NotFound();
        return NoContent();
    }

    #endregion

    /// <summary>
    /// Backfill coordinates for candidate work experience (admin use)
    /// </summary>
    [HttpPost("admin/backfill-coordinates")]
    [AllowAnonymous] // Temporary - remove in production
    public async Task<ActionResult<object>> BackfillCoordinates()
    {
        var updatedCount = await _workExperienceService.BackfillCoordinatesAsync();
        return Ok(new { message = "Candidate backfill complete", candidatesUpdated = updatedCount });
    }
}
