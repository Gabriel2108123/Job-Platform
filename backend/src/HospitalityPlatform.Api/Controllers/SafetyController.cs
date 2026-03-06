using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Entities;
using HospitalityPlatform.Messaging.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using HospitalityPlatform.Database;
using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("outreach")]
public class SafetyController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<SafetyController> _logger;

    public SafetyController(ApplicationDbContext dbContext, ILogger<SafetyController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpPost("block")]
    public async Task<IActionResult> BlockUser([FromBody] BlockUserDto dto)
    {
        var userId = GetUserId();
        if (userId == dto.BlockedUserId.ToString()) return BadRequest("You cannot block yourself.");

        var existing = await _dbContext.UserBlocks
            .AnyAsync(b => b.BlockerUserId == userId && b.BlockedUserId == dto.BlockedUserId.ToString());

        if (existing) return Ok(new { success = true, message = "User already blocked" });

        var block = new UserBlock
        {
            Id = Guid.NewGuid(),
            BlockerUserId = userId,
            BlockedUserId = dto.BlockedUserId.ToString()
        };

        _dbContext.UserBlocks.Add(block);
        await _dbContext.SaveAuditLogAsync(new HospitalityPlatform.Audit.Entities.AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "UserBlocked",
            EntityType = "User",
            EntityId = dto.BlockedUserId.ToString(),
            UserId = Guid.Parse(userId),
            Details = "User blocked by current user",
            Timestamp = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("User {Blocker} blocked {Blocked}", userId, dto.BlockedUserId);

        return Ok(new { success = true });
    }

    [HttpPost("unblock")]
    public async Task<IActionResult> UnblockUser([FromBody] BlockUserDto dto)
    {
        var userId = GetUserId();
        var block = await _dbContext.UserBlocks
            .FirstOrDefaultAsync(b => b.BlockerUserId == userId && b.BlockedUserId == dto.BlockedUserId.ToString());

        if (block == null) return NotFound();

        _dbContext.UserBlocks.Remove(block);
        await _dbContext.SaveAuditLogAsync(new HospitalityPlatform.Audit.Entities.AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "UserUnblocked",
            EntityType = "User",
            EntityId = dto.BlockedUserId.ToString(),
            UserId = Guid.Parse(userId),
            Details = "User unblocked by current user",
            Timestamp = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpPost("report")]
    public async Task<IActionResult> ReportUser([FromBody] ReportUserDto dto)
    {
        var userId = GetUserId();
        var report = new UserReport
        {
            Id = Guid.NewGuid(),
            ReporterUserId = userId,
            ReportedUserId = dto.ReportedUserId.ToString(),
            Reason = dto.Reason,
            Description = dto.Description,
            Status = "Pending"
        };

        _dbContext.UserReports.Add(report);
        await _dbContext.SaveAuditLogAsync(new HospitalityPlatform.Audit.Entities.AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "UserReported",
            EntityType = "User",
            EntityId = dto.ReportedUserId.ToString(),
            UserId = Guid.Parse(userId),
            Details = $"User reported for: {dto.Reason}",
            Timestamp = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
        _logger.LogWarning("User {Reporter} reported {Reported} for {Reason}", userId, dto.ReportedUserId, dto.Reason);

        return Ok(new { success = true });
    }

    [HttpPost("reports")]
    public async Task<IActionResult> SubmitGenericReport([FromBody] SubmitReportDto dto)
    {
        var userId = GetUserId();
        if (!Guid.TryParse(userId, out var reporterId)) return Unauthorized();

        var report = new Report
        {
            Id = Guid.NewGuid(),
            ReporterUserId = reporterId,
            TargetType = dto.TargetType,
            TargetId = dto.TargetId,
            Reason = dto.Reason,
            Details = dto.Details,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Reports.Add(report);

        // Auto-flagging logic for Jobs
        if (dto.TargetType.Equals("Job", StringComparison.OrdinalIgnoreCase))
        {
             var job = await _dbContext.Jobs.FindAsync(dto.TargetId);
             if (job != null && job.ModerationStatus == HospitalityPlatform.Core.Enums.ModerationStatus.Approved)
             {
                 job.ModerationStatus = HospitalityPlatform.Core.Enums.ModerationStatus.Flagged;
             }
        }

        await _dbContext.SaveChangesAsync();
        return Ok(new { success = true });
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
}

public class SubmitReportDto
{
    public string TargetType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
}
