using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Applications.Enums;
using HospitalityPlatform.Audit.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Applications.Services;

public class ApplicationService : IApplicationService
{
    private readonly IApplicationsDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<ApplicationService> _logger;

    public ApplicationService(
        IApplicationsDbContext context,
        IAuditService auditService,
        ILogger<ApplicationService> logger)
    {
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<ApplicationDto> ApplyToJobAsync(Guid jobId, CreateApplicationDto dto, string candidateUserId)
    {
        // Verify job exists
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null)
        {
            throw new KeyNotFoundException($"Job {jobId} not found");
        }

        if (job.Status != HospitalityPlatform.Jobs.Enums.JobStatus.Published)
        {
            throw new InvalidOperationException("Job is not published or is closed");
        }

        // Check if candidate already applied
        var existingApplication = await _context.Applications
            .FirstOrDefaultAsync(a => a.JobId == jobId && a.CandidateUserId == candidateUserId);
        
        if (existingApplication != null)
        {
            throw new InvalidOperationException("Candidate has already applied to this job");
        }

        var application = new Application
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            CandidateUserId = candidateUserId,
            CoverLetter = dto.CoverLetter,
            CvFileUrl = dto.CvFileUrl,
            CurrentStatus = ApplicationStatus.Applied,
            AppliedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Applications.Add(application);

        // Create status history entry
        var statusHistory = new ApplicationStatusHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = application.Id,
            FromStatus = null,
            ToStatus = ApplicationStatus.Applied,
            ChangedByUserId = candidateUserId,
            ChangedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ApplicationStatusHistories.Add(statusHistory);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "ApplicationCreated",
            "Application",
            application.Id.ToString(),
            new { applicationId = application.Id, jobId, candidateUserId },
            candidateUserId,
            job.OrganizationId
        );

        _logger.LogInformation("Candidate {CandidateId} applied to job {JobId}", candidateUserId, jobId);

        return MapToDto(application, null);
    }

    public async Task<ApplicationDto?> GetApplicationByIdAsync(Guid applicationId, string? userId = null)
    {
        var application = await _context.Applications.FindAsync(applicationId);
        if (application == null)
        {
            return null;
        }

        // Load job for organization context
        var job = await _context.Jobs.FindAsync(application.JobId);
        
        return MapToDto(application, job);
    }

    public async Task<List<ApplicationDto>> GetApplicationsForJobAsync(Guid jobId, string userId, Guid organizationId)
    {
        var applications = await _context.Applications
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        var job = await _context.Jobs.FindAsync(jobId);
        
        return applications.Select(a => MapToDto(a, job)).ToList();
    }

    public async Task<List<ApplicationDto>> GetCandidateApplicationsAsync(string candidateUserId)
    {
        var applications = await _context.Applications
            .Where(a => a.CandidateUserId == candidateUserId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        return applications.Select(a => MapToDto(a, null)).ToList();
    }

    public async Task WithdrawApplicationAsync(Guid applicationId, string candidateUserId)
    {
        var application = await _context.Applications.FindAsync(applicationId);
        if (application == null)
        {
            throw new KeyNotFoundException($"Application {applicationId} not found");
        }

        if (application.CandidateUserId != candidateUserId)
        {
            throw new UnauthorizedAccessException("Only the candidate can withdraw their application");
        }

        if (application.CurrentStatus == ApplicationStatus.Hired)
        {
            throw new InvalidOperationException("Cannot withdraw a hired application");
        }

        if (application.CurrentStatus == ApplicationStatus.Withdrawn)
        {
            throw new InvalidOperationException("Application is already withdrawn");
        }

        var previousStatus = application.CurrentStatus;
        application.CurrentStatus = ApplicationStatus.Withdrawn;
        application.UpdatedAt = DateTime.UtcNow;

        var statusHistory = new ApplicationStatusHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = application.Id,
            FromStatus = previousStatus,
            ToStatus = ApplicationStatus.Withdrawn,
            ChangedByUserId = candidateUserId,
            ChangedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ApplicationStatusHistories.Add(statusHistory);
        await _context.SaveChangesAsync();

        var job = await _context.Jobs.FindAsync(application.JobId);

        await _auditService.LogAsync(
            "ApplicationWithdrawn",
            "Application",
            application.Id.ToString(),
            new { applicationId = application.Id, jobId = application.JobId },
            candidateUserId,
            job?.OrganizationId ?? Guid.Empty
        );

        _logger.LogInformation("Candidate {CandidateId} withdrew application {AppId}", candidateUserId, applicationId);
    }

    public async Task<List<ApplicationStatusHistoryDto>> GetApplicationHistoryAsync(Guid applicationId)
    {
        var history = await _context.ApplicationStatusHistories
            .Where(h => h.ApplicationId == applicationId)
            .OrderBy(h => h.ChangedAt)
            .ToListAsync();

        return history.Select(MapHistoryToDto).ToList();
    }

    private static ApplicationDto MapToDto(Application application, object? job = null)
    {
        return new ApplicationDto
        {
            Id = application.Id,
            JobId = application.JobId,
            CandidateUserId = application.CandidateUserId,
            CurrentStatus = application.CurrentStatus,
            CurrentStatusName = application.CurrentStatus.ToString(),
            CoverLetter = application.CoverLetter,
            CvFileUrl = application.CvFileUrl,
            AppliedAt = application.AppliedAt,
            UpdatedAt = application.UpdatedAt ?? DateTime.UtcNow
        };
    }

    private static ApplicationStatusHistoryDto MapHistoryToDto(ApplicationStatusHistory history)
    {
        return new ApplicationStatusHistoryDto
        {
            Id = history.Id,
            ApplicationId = history.ApplicationId,
            FromStatus = history.FromStatus,
            FromStatusName = history.FromStatus?.ToString(),
            ToStatus = history.ToStatus,
            ToStatusName = history.ToStatus.ToString(),
            ChangedByUserId = history.ChangedByUserId,
            ChangedAt = history.ChangedAt,
            Notes = history.Notes,
            PreHireCheckConfirmation = history.PreHireCheckConfirmation,
            PreHireCheckConfirmationText = history.PreHireCheckConfirmationText
        };
    }
}
