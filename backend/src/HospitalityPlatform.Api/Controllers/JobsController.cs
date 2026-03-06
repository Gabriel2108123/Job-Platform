using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using HospitalityPlatform.Entitlements.Guards;
using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Entitlements.Enums;

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
    private readonly HospitalityPlatform.Core.Interfaces.IOrgAuthorizationService _orgAuthService;
    private readonly IEntitlementGuard _entitlementGuard;
    private readonly IEntitlementsService _entitlementsService;
    private readonly ILogger<JobsController> _logger;

    /// <summary>
    /// Initializes a new instance of the JobsController.
    /// </summary>
    /// <param name="jobService">The service handling job business logic.</param>
    /// <param name="orgAuthService">The service handling organizational authorization.</param>
    /// <param name="logger">The logger for capturing diagnostic information.</param>
    public JobsController(
        IJobService jobService, 
        HospitalityPlatform.Core.Interfaces.IOrgAuthorizationService orgAuthService, 
        IEntitlementGuard entitlementGuard,
        IEntitlementsService entitlementsService,
        ILogger<JobsController> logger)
    {
        _jobService = jobService;
        _orgAuthService = orgAuthService;
        _entitlementGuard = entitlementGuard;
        _entitlementsService = entitlementsService;
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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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
        var orgIdClaim = User.FindFirst("org_id")?.Value;
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
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || orgIdClaim != organizationId.ToString())
        {
            return Forbid();
        }

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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Get organizationId from user's current context claims
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        await _orgAuthService.EnsurePermissionAsync(Guid.Parse(userId), organizationId, "jobs.create");

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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var job = await _jobService.GetJobByIdAsync(id);
        if (job == null) return NotFound(new { error = "Job not found" });

        await _orgAuthService.EnsurePermissionAsync(Guid.Parse(userId), job.OrganizationId, "jobs.create");

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
        var orgIdClaim = User.FindFirst("org_id")?.Value;
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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var jobDetails = await _jobService.GetJobByIdAsync(id);
        if (jobDetails == null) return NotFound(new { error = "Job not found" });

        await _orgAuthService.EnsurePermissionAsync(Guid.Parse(userId), jobDetails.OrganizationId, "jobs.publish");

        // Check entitlements before publishing
        await _entitlementGuard.MustHaveAvailableLimitAsync(jobDetails.OrganizationId, LimitType.JobsPostingLimit);

        var job = await _jobService.PublishJobAsync(id, userId);

        // Increment usage after successful publish
        await _entitlementsService.IncrementUsageAsync(jobDetails.OrganizationId, LimitType.JobsPostingLimit);

        return Ok(job);
    }

    /// <summary>
    /// Close a job
    /// </summary>
    [HttpPost("{id}/close")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<IActionResult> CloseJob(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var jobDetails = await _jobService.GetJobByIdAsync(id);
        if (jobDetails == null) return NotFound(new { error = "Job not found" });

        await _orgAuthService.EnsurePermissionAsync(Guid.Parse(userId), jobDetails.OrganizationId, "jobs.close");

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
