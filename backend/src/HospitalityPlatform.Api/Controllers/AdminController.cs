using HospitalityPlatform.Api.DTOs;
using HospitalityPlatform.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

/// <summary>
/// Admin API endpoints for platform management.
/// All endpoints require Admin role and audit-log all actions.
/// All operations use soft suspension (no hard deletes).
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Policy = "RequireAdmin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger)
    {
        _adminService = adminService ?? throw new ArgumentNullException(nameof(adminService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    private Guid GetAdminId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userId, out var id) ? id : Guid.Empty;
    }

    private string? GetAdminName()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value ?? User.Identity?.Name;
    }

    // ==================== USERS ====================

    /// <summary>
    /// Get paginated list of all users in the platform.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(AdminUsersPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetUsersAsync(pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetUsers");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get details of a specific user.
    /// </summary>
    [HttpGet("users/{userId}")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(Guid userId)
    {
        try
        {
            var user = await _adminService.GetUserAsync(userId);
            if (user == null)
                return NotFound("User not found");
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetUser");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Suspend a user (soft suspension).
    /// </summary>
    [HttpPost("users/{userId}/suspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SuspendUser(Guid userId, [FromBody] SuspendUserDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest("Reason is required");

            var adminId = GetAdminId();
            var adminName = GetAdminName();

            await _adminService.SuspendUserAsync(userId, dto, adminId, adminName);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SuspendUser");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Unsuspend a user (soft suspension reversal).
    /// </summary>
    [HttpPost("users/{userId}/unsuspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnsuspendUser(Guid userId)
    {
        try
        {
            var adminId = GetAdminId();
            var adminName = GetAdminName();

            await _adminService.UnsuspendUserAsync(userId, adminId, adminName);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UnsuspendUser");
            return StatusCode(500, "Internal server error");
        }
    }

    // ==================== ORGANIZATIONS ====================

    /// <summary>
    /// Get paginated list of all organizations in the platform.
    /// </summary>
    [HttpGet("organizations")]
    [ProducesResponseType(typeof(AdminOrganizationsPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrganizations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetOrganizationsAsync(pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetOrganizations");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get details of a specific organization.
    /// </summary>
    [HttpGet("organizations/{organizationId}")]
    [ProducesResponseType(typeof(AdminOrganizationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrganization(Guid organizationId)
    {
        try
        {
            var org = await _adminService.GetOrganizationAsync(organizationId);
            if (org == null)
                return NotFound("Organization not found");
            return Ok(org);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetOrganization");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Suspend an organization (soft suspension).
    /// </summary>
    [HttpPost("organizations/{organizationId}/suspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SuspendOrganization(Guid organizationId, [FromBody] SuspendOrganizationDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest("Reason is required");

            var adminId = GetAdminId();
            var adminName = GetAdminName();

            await _adminService.SuspendOrganizationAsync(organizationId, dto, adminId, adminName);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SuspendOrganization");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Unsuspend an organization (soft suspension reversal).
    /// </summary>
    [HttpPost("organizations/{organizationId}/unsuspend")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnsuspendOrganization(Guid organizationId)
    {
        try
        {
            var adminId = GetAdminId();
            var adminName = GetAdminName();

            await _adminService.UnsuspendOrganizationAsync(organizationId, adminId, adminName);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UnsuspendOrganization");
            return StatusCode(500, "Internal server error");
        }
    }

    // ==================== SUBSCRIPTIONS (Read-Only) ====================

    /// <summary>
    /// Get paginated list of all subscriptions (read-only).
    /// </summary>
    [HttpGet("subscriptions")]
    [ProducesResponseType(typeof(AdminSubscriptionsPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubscriptions([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetSubscriptionsAsync(pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetSubscriptions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get details of a specific subscription.
    /// </summary>
    [HttpGet("subscriptions/{subscriptionId}")]
    [ProducesResponseType(typeof(AdminSubscriptionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubscription(Guid subscriptionId)
    {
        try
        {
            var sub = await _adminService.GetSubscriptionAsync(subscriptionId);
            if (sub == null)
                return NotFound("Subscription not found");
            return Ok(sub);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetSubscription");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get subscriptions by status (active, past_due, cancelled).
    /// </summary>
    [HttpGet("subscriptions/by-status/{status}")]
    [ProducesResponseType(typeof(List<AdminSubscriptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubscriptionsByStatus(string status)
    {
        try
        {
            if (!new[] { "active", "past_due", "cancelled" }.Contains(status.ToLower()))
                return BadRequest("Invalid status. Must be: active, past_due, or cancelled");

            var result = await _adminService.GetSubscriptionsByStatusAsync(status);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetSubscriptionsByStatus");
            return StatusCode(500, "Internal server error");
        }
    }

    // ==================== METRICS ====================

    /// <summary>
    /// Get platform-wide metrics.
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(PlatformMetricsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMetrics()
    {
        try
        {
            var metrics = await _adminService.GetPlatformMetricsAsync();
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetMetrics");
            return StatusCode(500, "Internal server error");
        }
    }

    // ==================== AUDIT LOGS ====================

    /// <summary>
    /// Get paginated list of all audit logs.
    /// </summary>
    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(AdminAuditLogsPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetAuditLogsAsync(pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAuditLogs");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get audit logs by action type.
    /// </summary>
    [HttpGet("audit-logs/by-action/{action}")]
    [ProducesResponseType(typeof(AdminAuditLogsPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogsByAction(string action, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetAuditLogsByActionAsync(action, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAuditLogsByAction");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get audit logs for a specific user.
    /// </summary>
    [HttpGet("audit-logs/by-user/{userId}")]
    [ProducesResponseType(typeof(AdminAuditLogsPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogsByUser(Guid userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetAuditLogsByUserAsync(userId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAuditLogsByUser");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get audit logs for a specific organization.
    /// </summary>
    [HttpGet("audit-logs/by-organization/{organizationId}")]
    [ProducesResponseType(typeof(AdminAuditLogsPagedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogsByOrganization(Guid organizationId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _adminService.GetAuditLogsByOrganizationAsync(organizationId, pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAuditLogsByOrganization");
            return StatusCode(500, "Internal server error");
        }
    }
}
