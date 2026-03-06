using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Database;
using HospitalityPlatform.Core.Enums;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Support")]
public class ModerationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ModerationController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Endpoint to get all pending reports
    [HttpGet("reports/pending")]
    public async Task<IActionResult> GetPendingReports()
    {
        var reports = await _context.Reports
            .Where(r => r.Status == "Open" || r.Status == "Investigating")
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
            
        return Ok(reports);
    }
    
    // Endpoint to update moderation status of a Job
    [HttpPut("jobs/{jobId}/status")]
    public async Task<IActionResult> UpdateJobModerationStatus(Guid jobId, [FromBody] UpdateModerationStatusDto dto)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null) return NotFound("Job not found");
        
        job.ModerationStatus = dto.Status;
        await _context.SaveChangesAsync();
        
        return Ok(new { success = true, newStatus = job.ModerationStatus.ToString() });
    }
    
    // Endpoint to update moderation status of an Organization
    [HttpPut("organizations/{orgId}/status")]
    public async Task<IActionResult> UpdateOrgModerationStatus(Guid orgId, [FromBody] UpdateModerationStatusDto dto)
    {
        var org = await _context.Organizations.FindAsync(orgId);
        if (org == null) return NotFound("Organization not found");
        
        org.ModerationStatus = dto.Status;
        await _context.SaveChangesAsync();
        
        return Ok(new { success = true, newStatus = org.ModerationStatus.ToString() });
    }

    // Endpoint to update moderation status of a User
    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> UpdateUserModerationStatus(Guid userId, [FromBody] UpdateModerationStatusDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("User not found");
        
        user.ModerationStatus = dto.Status;
        await _context.SaveChangesAsync();
        
        return Ok(new { success = true, newStatus = user.ModerationStatus.ToString() });
    }
    
    // Endpoint to resolve a report
    [HttpPut("reports/{reportId}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid reportId, [FromBody] ResolveReportDto dto)
    {
        var report = await _context.Reports.FindAsync(reportId);
        if (report == null) return NotFound("Report not found");
        
        report.Status = dto.Status; // "Resolved" or "Dismissed"
        report.ResolutionNotes = dto.ResolutionNotes;
        report.ResolvedAt = DateTime.UtcNow;
        
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out var adminUser))
        {
            report.ResolvedByUserId = adminUser;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true, report });
    }
}

public class UpdateModerationStatusDto
{
    public ModerationStatus Status { get; set; }
}

public class ResolveReportDto
{
    public string Status { get; set; } = "Resolved";
    public string? ResolutionNotes { get; set; }
}
