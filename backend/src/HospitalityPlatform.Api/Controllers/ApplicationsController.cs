using HospitalityPlatform.Auth.Policies;
using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/applications")]
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
    [HttpPost("jobs/{jobId}/apply")]
    [Authorize(Policy = PolicyNames.RequireCandidate)]
    public async Task<ActionResult<ApplicationDto>> ApplyToJob(Guid jobId, [FromBody] CreateApplicationDto dto)
    {
        try
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException();

            var result = await _applicationService.ApplyToJobAsync(jobId, dto, candidateId);
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
    [HttpGet("my")]
    [Authorize(Policy = PolicyNames.RequireCandidate)]
    public async Task<ActionResult<List<ApplicationDto>>> GetMyApplications()
    {
        try
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException();
            var result = await _applicationService.GetCandidateApplicationsAsync(candidateId);
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
    public async Task<ActionResult<List<ApplicationDto>>> GetJobApplications(Guid jobId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException();
            var organizationId = Guid.Parse(User.FindFirst("org_id")?.Value ?? Guid.Empty.ToString());
            var result = await _applicationService.GetApplicationsForJobAsync(jobId, userId, organizationId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving job applications");
            return StatusCode(500, new { error = "An error occurred while retrieving applications" });
        }
    }

    /// <summary>
    /// Get application status history
    /// </summary>
    [HttpGet("{id}/history")]
    [Authorize]
    public async Task<ActionResult<List<ApplicationStatusHistoryDto>>> GetApplicationHistory(Guid id)
    {
        try
        {
            var result = await _applicationService.GetApplicationHistoryAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Application not found");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application history");
            return StatusCode(500, new { error = "An error occurred while retrieving history" });
        }
    }

    /// <summary>
    /// Withdraw application (candidates only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = PolicyNames.RequireCandidate)]
    public async Task<IActionResult> WithdrawApplication(Guid id)
    {
        try
        {
            var candidateId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException();
            await _applicationService.WithdrawApplicationAsync(id, candidateId);
            return Ok(new { message = "Application withdrawn successfully" });
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
            _logger.LogError(ex, "Error withdrawing application");
            return StatusCode(500, new { error = "An error occurred while withdrawing the application" });
        }
    }
}

