using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/message-templates")]
[Authorize]
public class MessageTemplatesController : ControllerBase
{
    private readonly IMessageTemplateService _templateService;

    public MessageTemplatesController(IMessageTemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpPost]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<MessageTemplateDto>> CreateTemplate([FromBody] CreateMessageTemplateDto dto)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _templateService.CreateTemplateAsync(organizationId, dto, userId);
        return CreatedAtAction(nameof(GetTemplate), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MessageTemplateDto>> GetTemplate(Guid id)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var template = await _templateService.GetTemplateAsync(organizationId, id);
        if (template == null) return NotFound();

        return Ok(template);
    }

    [HttpGet]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<IEnumerable<MessageTemplateDto>>> GetOrganizationTemplates()
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var result = await _templateService.GetOrganizationTemplatesAsync(organizationId);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<MessageTemplateDto>> UpdateTemplate(Guid id, [FromBody] UpdateMessageTemplateDto dto)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        var result = await _templateService.UpdateTemplateAsync(organizationId, id, dto, userId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        var orgIdClaim = User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
        {
            return BadRequest(new { error = "Organization context required" });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "system";
        await _templateService.DeleteTemplateAsync(organizationId, id, userId);
        return NoContent();
    }
}
