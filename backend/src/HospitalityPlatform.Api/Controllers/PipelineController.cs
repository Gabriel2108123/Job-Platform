using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Enums;
using HospitalityPlatform.Applications.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/pipeline")]
public class PipelineController : ControllerBase
{
    private readonly IPipelineService _pipelineService;
    private readonly IApplicationService _applicationService;
    private readonly HospitalityPlatform.Core.Interfaces.IOrgAuthorizationService _orgAuthService;
    private readonly ILogger<PipelineController> _logger;

    public PipelineController(
        IPipelineService pipelineService,
        IApplicationService applicationService,
        HospitalityPlatform.Core.Interfaces.IOrgAuthorizationService orgAuthService,
        ILogger<PipelineController> logger)
    {
        _pipelineService = pipelineService;
        _applicationService = applicationService;
        _orgAuthService = orgAuthService;
        _logger = logger;
    }

    /// <summary>
    /// Get pipeline view for a job (kanban data)
    /// </summary>
    [HttpGet("jobs/{jobId}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<PipelineViewDto>> GetPipelineView(Guid jobId)
    {
        try
        {
            // TODO: Verify user belongs to job's organization
            var orgIdClaim = User.FindFirst("org_id")?.Value;
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            var pipeline = await _pipelineService.GetPipelineViewAsync(jobId, organizationId);
            return Ok(pipeline);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pipeline for job {JobId}", jobId);
            return StatusCode(500, new { error = "An error occurred while retrieving pipeline" });
        }
    }

    /// <summary>
    /// Move application to a new status (accepts applicationId in body)
    /// </summary>
    [HttpPost("move-application")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<ApplicationDto>> MoveApplicationWithBody([FromBody] MoveApplicationRequestDto request)
    {
        return await MoveApplication(request.ApplicationId, request);
    }

    /// <summary>
    /// Move application to a new status in the pipeline
    /// </summary>
    [HttpPost("applications/{applicationId}/move")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<ApplicationDto>> MoveApplication(Guid applicationId, [FromBody] MoveApplicationDto dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // TODO: Verify user belongs to job's organization
            var orgIdClaim = User.FindFirst("org_id")?.Value;
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            await _orgAuthService.EnsurePermissionAsync(Guid.Parse(userId), organizationId, "applications.move");

            var application = await _pipelineService.MoveApplicationAsync(
                applicationId,
                dto.ToStatus,
                userId,
                organizationId,
                dto.Notes,
                dto.PreHireCheckConfirmation,
                dto.PreHireCheckConfirmationText
            );

            return Ok(application);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error moving application {AppId}", applicationId);
            return StatusCode(500, new { error = "An error occurred while moving the application" });
        }
    }

    /// <summary>
    /// Move multiple applications in bulk
    /// </summary>
    [HttpPost("move-bulk")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<IEnumerable<ApplicationDto>>> MoveApplicationsBulk([FromBody] BulkMoveRequest dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orgIdClaim = User.FindFirst("org_id")?.Value;
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            await _orgAuthService.EnsurePermissionAsync(Guid.Parse(userId), organizationId, "applications.move");

            var result = await _pipelineService.MoveApplicationsBulkAsync(dto.ApplicationIds, dto.ToStatus, userId, organizationId, dto.Notes);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk moving applications");
            return StatusCode(500, new { error = "An error occurred during bulk move" });
        }
    }
}

public class BulkMoveRequest
{
    public List<Guid> ApplicationIds { get; set; } = new();
    public ApplicationStatus ToStatus { get; set; }
    public string? Notes { get; set; }
}
