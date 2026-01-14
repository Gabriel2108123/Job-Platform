using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Services;
using System.Security.Claims;

namespace HospitalityPlatform.Messaging.Controllers;

/// <summary>
/// Controller for messaging operations.
/// All endpoints require authentication and enforce organization isolation.
/// </summary>
[ApiController]
[Route("api/messaging")]
[Authorize]
public class MessagingController : ControllerBase
{
    private readonly IMessagingService _messagingService;
    private readonly ILogger<MessagingController> _logger;

    public MessagingController(IMessagingService messagingService, ILogger<MessagingController> logger)
    {
        _messagingService = messagingService;
        _logger = logger;
    }

    /// <summary>Create a new conversation.</summary>
    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var conversation = await _messagingService.CreateConversationAsync(organizationId, dto, userId);
            return CreatedAtAction(nameof(GetConversation), new { conversationId = conversation.Id }, conversation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating conversation");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get a conversation by ID.</summary>
    [HttpGet("conversations/{conversationId}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(Guid conversationId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var conversation = await _messagingService.GetConversationAsync(organizationId, conversationId);

            if (conversation == null)
                return NotFound();

            return Ok(conversation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversation");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get all conversations for the organization (paginated).</summary>
    [HttpGet("conversations")]
    public async Task<ActionResult<PagedResult<ConversationDto>>> GetConversations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var result = await _messagingService.GetConversationsAsync(organizationId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversations");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Send a message in a conversation.</summary>
    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(Guid conversationId, [FromBody] SendMessageDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var message = await _messagingService.SendMessageAsync(organizationId, conversationId, dto, userId);
            return CreatedAtAction(nameof(GetMessage), new { conversationId, messageId = message.Id }, message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Rate limit or permission error");
            return StatusCode(429, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Edit a message.</summary>
    [HttpPut("conversations/{conversationId}/messages/{messageId}")]
    public async Task<ActionResult<MessageDto>> EditMessage(Guid conversationId, Guid messageId, [FromBody] EditMessageDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var message = await _messagingService.EditMessageAsync(organizationId, messageId, dto, userId);
            return Ok(message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Permission denied for edit");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error editing message");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Delete a message (soft delete).</summary>
    [HttpDelete("conversations/{conversationId}/messages/{messageId}")]
    public async Task<IActionResult> DeleteMessage(Guid conversationId, Guid messageId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            await _messagingService.DeleteMessageAsync(organizationId, messageId, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Permission denied for delete");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting message");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get messages in a conversation (paginated).</summary>
    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<ActionResult<PagedResult<MessageDto>>> GetMessages(Guid conversationId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var result = await _messagingService.GetMessagesAsync(organizationId, conversationId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving messages");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get a specific message.</summary>
    [HttpGet("conversations/{conversationId}/messages/{messageId}")]
    public async Task<ActionResult<MessageDto>> GetMessage(Guid conversationId, Guid messageId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var messages = await _messagingService.GetMessagesAsync(organizationId, conversationId, 1, 100);
            var message = messages.Items.FirstOrDefault(m => m.Id == messageId);

            if (message == null)
                return NotFound();

            return Ok(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving message");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Add participants to a conversation.</summary>
    [HttpPost("conversations/{conversationId}/participants")]
    public async Task<IActionResult> AddParticipants(Guid conversationId, [FromBody] AddParticipantsDto dto)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            await _messagingService.AddParticipantsAsync(organizationId, conversationId, dto, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding participants");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get participants in a conversation.</summary>
    [HttpGet("conversations/{conversationId}/participants")]
    public async Task<ActionResult<List<ConversationParticipantDto>>> GetParticipants(Guid conversationId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var participants = await _messagingService.GetParticipantsAsync(organizationId, conversationId);
            return Ok(participants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving participants");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Archive a conversation.</summary>
    [HttpPost("conversations/{conversationId}/archive")]
    public async Task<IActionResult> ArchiveConversation(Guid conversationId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            await _messagingService.ArchiveConversationAsync(organizationId, conversationId, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving conversation");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Mark all messages in a conversation as read.</summary>
    [HttpPut("conversations/{conversationId}/mark-read")]
    public async Task<IActionResult> MarkConversationRead(Guid conversationId)
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            await _messagingService.MarkConversationAsReadAsync(organizationId, conversationId, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking conversation as read");
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get unread message count for the current user.</summary>
    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        try
        {
            var organizationId = GetOrganizationId();
            var userId = GetUserId();

            var count = await _messagingService.GetUnreadCountAsync(organizationId, userId);
            return Ok(new { unreadCount = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
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
