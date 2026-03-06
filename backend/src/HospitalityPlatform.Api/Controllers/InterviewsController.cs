using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize]
public class InterviewsController : ControllerBase
{
    private readonly IInterviewService _interviewService;
    private readonly IOrgAuthorizationService _orgAuthService;

    public InterviewsController(
        IInterviewService interviewService,
        IOrgAuthorizationService orgAuthService)
    {
        _interviewService = interviewService;
        _orgAuthService = orgAuthService;
    }

    [HttpPost]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<InterviewDto>> ScheduleInterview([FromBody] CreateInterviewDto dto)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _interviewService.ScheduleInterviewAsync(organizationId, dto, userId);
        return CreatedAtAction(nameof(GetInterview), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewDto>> GetInterview(Guid id)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var interview = await _interviewService.GetInterviewAsync(organizationId, id);
        if (interview == null) return NotFound();

        return Ok(interview);
    }

    [HttpGet("application/{applicationId}")]
    public async Task<ActionResult<IEnumerable<InterviewDto>>> GetApplicationInterviews(Guid applicationId)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var result = await _interviewService.GetApplicationInterviewsAsync(organizationId, applicationId);
        return Ok(result);
    }

    [HttpPut("{id}/feedback")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<InterviewDto>> UpdateFeedback(Guid id, [FromBody] UpdateInterviewFeedbackDto dto)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _interviewService.UpdateFeedbackAsync(organizationId, id, dto, userId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<IActionResult> DeleteInterview(Guid id)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        await _interviewService.DeleteInterviewAsync(organizationId, id, userId);
        return NoContent();
    }
}
