using HospitalityPlatform.Auth.Policies;
using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly ILogger<ApplicationsController> _logger;

    public ApplicationsController(IApplicationService applicationService, ILogger<ApplicationsController> logger)
    {
        _applicationService = applicationService;
        _logger = logger;
    }

    /// <summary>
    /// Apply to a job (candidates only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = PolicyNames.RequireCandidate)]
    public async Task<ActionResult<ApplicationDto>> ApplyToJob([FromBody] CreateApplicationDto dto)
    {
        try
        {
            var candidateId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var organizationId = Guid.Parse(User.FindFirst("org_id")?.Value ?? Guid.Empty.ToString());

            var result = await _applicationService.ApplyToJobAsync(dto.JobId, dto, candidateId, organizationId);
            return CreatedAtAction(nameof(GetApplication), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Job not found");
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying to job");
            return StatusCode(500, new { error = "An error occurred while applying to the job" });
        }
    }

    /// <summary>
    /// Get application by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApplicationDto>> GetApplication(Guid id)
    {
        try
        {
            var application = await _applicationService.GetApplicationByIdAsync(id);
            if (application == null)
            {
                return NotFound(new { error = "Application not found" });
            }

            return Ok(application);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application");
            return StatusCode(500, new { error = "An error occurred while retrieving the application" });
        }
    }

    /// <summary>
    /// Get candidate's applications
    /// </summary>
    [HttpGet("candidate/my-applications")]
    [Authorize(Policy = PolicyNames.RequireCandidate)]
    public async Task<ActionResult<PagedResult<ApplicationDto>>> GetMyApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var candidateId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var result = await _applicationService.GetCandidateApplicationsAsync(candidateId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving candidate applications");
            return StatusCode(500, new { error = "An error occurred while retrieving applications" });
        }
    }

    /// <summary>
    /// Get applications for a job (business staff only)
    /// </summary>
    [HttpGet("job/{jobId}")]
    [Authorize(Policy = PolicyNames.RequireBusinessRole)]
    public async Task<ActionResult<PagedResult<ApplicationDto>>> GetJobApplications(Guid jobId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await _applicationService.GetJobApplicationsAsync(jobId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving job applications");
            return StatusCode(500, new { error = "An error occurred while retrieving applications" });
        }
    }

    /// <summary>
    /// Update application status (move through pipeline)
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Policy = PolicyNames.RequireBusinessRole)]
    public async Task<ActionResult<ApplicationDto>> UpdateApplicationStatus(Guid id, [FromBody] UpdateApplicationStatusDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var result = await _applicationService.UpdateApplicationStatusAsync(id, dto, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Application not found");
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating application status");
            return StatusCode(500, new { error = "An error occurred while updating the application" });
        }
    }

    /// <summary>
    /// Get Kanban pipeline view for a job
    /// </summary>
    [HttpGet("job/{jobId}/pipeline")]
    [Authorize(Policy = PolicyNames.RequireBusinessRole)]
    public async Task<ActionResult<PipelineKanbanDto>> GetPipelineKanban(Guid jobId)
    {
        try
        {
            var result = await _applicationService.GetPipelineKanbanAsync(jobId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Job not found");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pipeline");
            return StatusCode(500, new { error = "An error occurred while retrieving the pipeline" });
        }
    }

    /// <summary>
    /// Confirm pre-hire checks (right-to-work verification)
    /// </summary>
    [HttpPost("{id}/pre-hire-confirmation")]
    [Authorize(Policy = PolicyNames.RequireBusinessRole)]
    public async Task<ActionResult<ApplicationDto>> ConfirmPreHireChecks(Guid id, [FromBody] PreHireConfirmationDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var result = await _applicationService.ConfirmPreHireChecksAsync(id, dto, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Application not found");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming pre-hire checks");
            return StatusCode(500, new { error = "An error occurred while confirming pre-hire checks" });
        }
    }
}
