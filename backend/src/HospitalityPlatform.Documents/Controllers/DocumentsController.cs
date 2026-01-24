using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Documents.DTOs;
using HospitalityPlatform.Documents.Services;
using System.Security.Claims;

namespace HospitalityPlatform.Documents.Controllers;

/// <summary>
/// Controller for document management operations.
/// All endpoints require authentication and enforce organization isolation with per-application sharing rules.
/// </summary>
[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _documentsService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(IDocumentsService documentsService, ILogger<DocumentsController> logger)
    {
        _documentsService = documentsService;
        _logger = logger;
    }

    /// <summary>Create document upload request and get presigned URL.</summary>
    [HttpPost("create-upload")]
    public async Task<ActionResult<PresignedUrlDto>> CreateUpload([FromBody] CreateDocumentUploadDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var result = await _documentsService.CreateUploadAsync(organizationId, dto, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating upload");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Complete document upload (call after S3 upload succeeds).</summary>
    [HttpPost("{documentId}/complete-upload")]
    public async Task<ActionResult<DocumentDto>> CompleteUpload(Guid documentId, [FromBody] CompleteUploadDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();

            var result = await _documentsService.CompleteUploadAsync(organizationId, documentId, dto.S3Key, dto.FileSizeBytes);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing upload");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get a document by ID.</summary>
    [HttpGet("{documentId}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(Guid documentId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var document = await _documentsService.GetDocumentAsync(organizationId, documentId);

            if (document == null)
                return NotFound();

            return Ok(document);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving document");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get all documents uploaded by the current user.</summary>
    [HttpGet("my-documents")]
    public async Task<ActionResult<PagedResult<DocumentDto>>> GetMyDocuments([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var result = await _documentsService.GetUserDocumentsAsync(organizationId, userId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user documents");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get documents shared with an application.</summary>
    [HttpGet("application/{applicationId}")]
    public async Task<ActionResult<PagedResult<DocumentDto>>> GetApplicationDocuments(Guid applicationId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var result = await _documentsService.GetApplicationDocumentsAsync(organizationId, applicationId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application documents");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Share a document with an application.</summary>
    [HttpPost("{documentId}/share")]
    public async Task<ActionResult<DocumentAccessDto>> ShareDocument(Guid documentId, [FromBody] ShareDocumentDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var result = await _documentsService.ShareDocumentAsync(organizationId, documentId, dto, userId);
            return CreatedAtAction(nameof(GetAccessRules), new { documentId }, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Permission denied for share");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing document");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Revoke document access from an application.</summary>
    [HttpDelete("access/{accessId}")]
    public async Task<IActionResult> RevokeAccess(Guid accessId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            await _documentsService.RevokeAccessAsync(organizationId, accessId, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Permission denied for revoke");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking access");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get access rules for a document.</summary>
    [HttpGet("{documentId}/access")]
    public async Task<ActionResult<List<DocumentAccessDto>>> GetAccessRules(Guid documentId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var result = await _documentsService.GetAccessRulesAsync(organizationId, documentId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving access rules");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get presigned download URL for a document.</summary>
    [HttpGet("{documentId}/download-url")]
    public async Task<ActionResult<DownloadUrlDto>> GetDownloadUrl(Guid documentId, [FromQuery] Guid? applicationId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            // Check if user is Support
            var isSupport = User.IsInRole("Support");

            var result = await _documentsService.GetDownloadUrlAsync(organizationId, documentId, applicationId, userId, inline: isSupport);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Access denied for download");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating download URL");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Delete a document (soft delete).</summary>
    [HttpDelete("{documentId}")]
    public async Task<IActionResult> DeleteDocument(Guid documentId)
    {
        try
        {
            // Block Support form deleting
            if (User.IsInRole("Support"))
            {
                return Forbid();
            }

            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            await _documentsService.DeleteDocumentAsync(organizationId, documentId, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Permission denied for delete");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document");
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid GetOrganizationId()
    {
        var orgIdClaim = User.FindFirst("organizationId")?.Value 
            ?? User.FindFirst("organization_id")?.Value 
            ?? User.FindFirst(ClaimTypes.GroupSid)?.Value;

        if (!Guid.TryParse(orgIdClaim, out var organizationId))
        {
            throw new InvalidOperationException("Organization ID not found in claims");
        }

        return organizationId;
    }

    private string GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value 
            ?? throw new InvalidOperationException("User ID not found in claims");
    }
}

/// <summary>DTO for completing document upload.</summary>
public class CompleteUploadDto
{
    public required string S3Key { get; set; }
    public long FileSizeBytes { get; set; }
}
