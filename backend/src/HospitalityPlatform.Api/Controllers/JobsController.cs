using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

/// <summary>
/// Controller for managing job postings, search, and recruitment analytics.
/// Provides endpoints for both public job search and authenticated business operations.
/// </summary>
[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;
    private readonly ILogger<JobsController> _logger;

    /// <summary>
    /// Initializes a new instance of the JobsController.
    /// </summary>
    /// <param name="jobService">The service handling job business logic.</param>
    /// <param name="logger">The logger for capturing diagnostic information.</param>
    public JobsController(IJobService jobService, ILogger<JobsController> logger)
    {
        _jobService = jobService;
        _logger = logger;
    }

    /// <summary>
    /// Search published jobs (public endpoint)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<JobDto>>> SearchJobs([FromQuery] SearchJobsDto searchDto)
    {
        var result = await _jobService.SearchJobsAsync(searchDto);
        return Ok(result);
    }

    /// <summary>
    /// Get job by ID (public if published)
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<JobDto>> GetJob(Guid id)
    {
        var job = await _jobService.GetJobByIdAsync(id);
        if (job == null)
        {
            return NotFound(new { error = "Job not found" });
        }

        // If job is not published, only organization members can see it
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (job.Status != Jobs.Enums.JobStatus.Published && userId == null)
        {
            return NotFound(new { error = "Job not found" });
        }

        return Ok(job);
    }

    /// <summary>
    /// Get jobs for current user's organization
    /// </summary>
    [HttpGet("organization")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetMyOrganizationJobs()
    {
        var orgIdClaim = User.FindFirstValue("org_id");
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var result = await _jobService.GetJobsByOrganizationAsync(organizationId, 1, 1000);
        return Ok(result);
    }

    /// <summary>
    /// Get jobs for an organization
    /// </summary>
    [HttpGet("organization/{organizationId}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<PagedResult<JobDto>>> GetOrganizationJobs(
        Guid organizationId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        // TODO: Verify user belongs to organization
        var result = await _jobService.GetJobsByOrganizationAsync(organizationId, pageNumber, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Create a new job
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<JobDto>> CreateJob([FromBody] CreateJobDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // TODO: Get organizationId from user's current context or claims
        // For now, we'll expect it in the request or from a claim
        var orgIdClaim = User.FindFirstValue("org_id");
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var job = await _jobService.CreateJobAsync(dto, userId, organizationId);
        return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
    }

    /// <summary>
    /// Update an existing job
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<JobDto>> UpdateJob(Guid id, [FromBody] UpdateJobDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // TODO: Verify user has access to this job's organization
        var result = await _jobService.UpdateJobAsync(id, dto, userId);
        return Ok(result);
    }

    /// <summary>
    /// Increment job view count (anonymous)
    /// </summary>
    [HttpPost("{id}/view")]
    [AllowAnonymous]
    public async Task<IActionResult> IncrementView(Guid id)
    {
        await _jobService.IncrementJobViewAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Get analytics for current organization
    /// </summary>
    [HttpGet("analytics")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<OrganizationAnalyticsDto>> GetAnalytics()
    {
        var orgIdClaim = User.FindFirstValue("org_id");
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var analytics = await _jobService.GetOrganizationAnalyticsAsync(organizationId);
        return Ok(analytics);
    }

    /// <summary>
    /// Publish a draft job
    /// </summary>
    [HttpPost("{id}/publish")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<JobDto>> PublishJob(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // TODO: Verify user has access to this job's organization
        var job = await _jobService.PublishJobAsync(id, userId);
        return Ok(job);
    }

    /// <summary>
    /// Close a job
    /// </summary>
    [HttpPost("{id}/close")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<IActionResult> CloseJob(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // TODO: Verify user has access to this job's organization
        await _jobService.CloseJobAsync(id, userId);
        return NoContent();
    }

    /// <summary>
    /// Backfill coordinates for jobs missing lat/lng (admin use)
    /// </summary>
    [HttpPost("admin/backfill-coordinates")]
    [AllowAnonymous] // Temporary - remove in production
    public async Task<ActionResult<object>> BackfillCoordinates()
    {
        var updatedCount = await _jobService.BackfillCoordinatesAsync();
        return Ok(new { message = "Backfill complete", jobsUpdated = updatedCount });
    }
}
