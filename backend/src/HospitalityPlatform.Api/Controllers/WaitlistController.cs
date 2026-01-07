using HospitalityPlatform.Waitlist.DTOs;
using HospitalityPlatform.Waitlist.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/waitlist")]
public class WaitlistController : ControllerBase
{
    private readonly IWaitlistService _waitlistService;
    private readonly ILogger<WaitlistController> _logger;
    private readonly IConfiguration _config;
    
    // Rate limiting: max 5 submissions per IP per hour (simple in-memory implementation)
    private static readonly Dictionary<string, List<DateTime>> RateLimitCache = new();

    public WaitlistController(
        IWaitlistService waitlistService,
        ILogger<WaitlistController> logger,
        IConfiguration config)
    {
        _waitlistService = waitlistService;
        _logger = logger;
        _config = config;
    }

    /// <summary>
    /// Submit a waitlist entry (public endpoint with anti-spam measures)
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<WaitlistEntryDto>> CreateWaitlistEntry([FromBody] CreateWaitlistEntryDto dto)
    {
        try
        {
            // Honeypot check (should be empty)
            if (!string.IsNullOrEmpty(dto.Honeypot))
            {
                _logger.LogWarning("Honeypot field filled - likely spam");
                // Return success anyway to not reveal spam detection
                return Ok(new { message = "Thank you! You're on the waitlist." });
            }

            // Simple rate limiting by IP
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            if (!CheckRateLimit(clientIp))
            {
                _logger.LogWarning("Rate limit exceeded for IP: {IP}", clientIp);
                return StatusCode(429, new { error = "Too many requests. Please try again later." });
            }

            // Validate email format
            if (!IsValidEmail(dto.Email))
            {
                return BadRequest(new { error = "Invalid email address" });
            }

            // Create entry
            var result = await _waitlistService.CreateWaitlistEntryAsync(dto);

            // Record rate limit attempt
            RecordRateLimitAttempt(clientIp);

            _logger.LogInformation("Waitlist entry created: {Email} ({AccountType})", dto.Email, dto.AccountType);

            return Ok(new
            {
                message = "Thank you! You're on the waitlist.",
                incentive = result.IncentiveAwarded.ToString(),
                sequenceNumber = result.SequenceNumber
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validation error");
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating waitlist entry");
            return StatusCode(500, new { error = "An error occurred while processing your request" });
        }
    }

    /// <summary>
    /// Get paginated waitlist entries (admin only)
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<ActionResult<WaitlistPagedResult>> GetWaitlistEntries(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] int? accountType = null)
    {
        try
        {
            var result = await _waitlistService.GetWaitlistEntriesAsync(pageNumber, pageSize, accountType);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving waitlist entries");
            return StatusCode(500, new { error = "An error occurred while retrieving waitlist entries" });
        }
    }

    /// <summary>
    /// Export waitlist as CSV (admin only)
    /// </summary>
    [HttpGet("admin/export")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> ExportWaitlist([FromQuery] int? accountType = null)
    {
        try
        {
            var csv = await _waitlistService.ExportWaitlistAsCsvAsync(accountType);

            var fileName = $"waitlist_export_{DateTime.UtcNow:yyyy-MM-dd_HHmmss}.csv";
            return File(
                System.Text.Encoding.UTF8.GetBytes(csv),
                "text/csv",
                fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting waitlist");
            return StatusCode(500, new { error = "An error occurred while exporting waitlist" });
        }
    }

    /// <summary>
    /// Delete a waitlist entry (admin only)
    /// </summary>
    [HttpDelete("admin/{id}")]
    [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> DeleteWaitlistEntry(Guid id)
    {
        try
        {
            await _waitlistService.DeleteWaitlistEntryAsync(id);
            return Ok(new { message = "Waitlist entry deleted" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Waitlist entry not found");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting waitlist entry");
            return StatusCode(500, new { error = "An error occurred while deleting the entry" });
        }
    }

    // ===== Private Helpers =====

    /// <summary>
    /// Check rate limit for IP address (max 5 per hour)
    /// </summary>
    private bool CheckRateLimit(string clientIp)
    {
        const int maxAttempts = 5;
        const int windowMinutes = 60;

        if (!RateLimitCache.TryGetValue(clientIp, out var attempts))
        {
            return true; // First attempt
        }

        // Remove old attempts outside the window
        var cutoffTime = DateTime.UtcNow.AddMinutes(-windowMinutes);
        attempts.RemoveAll(t => t < cutoffTime);

        return attempts.Count < maxAttempts;
    }

    /// <summary>
    /// Record rate limit attempt for IP
    /// </summary>
    private void RecordRateLimitAttempt(string clientIp)
    {
        if (!RateLimitCache.TryGetValue(clientIp, out var attempts))
        {
            attempts = new List<DateTime>();
            RateLimitCache[clientIp] = attempts;
        }

        attempts.Add(DateTime.UtcNow);

        // Cleanup old entries to prevent memory leak
        if (RateLimitCache.Count > 10000)
        {
            var oldestKey = RateLimitCache
                .OrderBy(x => x.Value.Min())
                .First().Key;
            RateLimitCache.Remove(oldestKey);
        }
    }

    /// <summary>
    /// Basic email validation
    /// </summary>
    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
