using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Applications.Enums;
using HospitalityPlatform.Audit.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Applications.Services;

public class PipelineService : IPipelineService
{
    private readonly IApplicationsDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<PipelineService> _logger;

    private static readonly string[] ValidTransitions = new[]
    {
        "Applied->Screening",
        "Applied->Rejected",
        "Applied->Withdrawn",
        "Screening->Interview",
        "Screening->Rejected",
        "Interview->PreHireChecks",
        "Interview->Rejected",
        "PreHireChecks->Hired",
        "PreHireChecks->Rejected",
        "PreHireChecks->Screening",
        "Hired->Rejected", // Can reject even after hiring if needed
    };

    public PipelineService(
        IApplicationsDbContext context,
        IAuditService auditService,
        ILogger<PipelineService> logger)
    {
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<ApplicationDto> MoveApplicationAsync(
        Guid applicationId,
        ApplicationStatus toStatus,
        string userId,
        Guid organizationId,
        string? notes = null,
        bool? preHireConfirmation = null,
        string? preHireConfirmationText = null)
    {
        var application = await _context.Applications.FindAsync(applicationId);
        if (application == null)
        {
            throw new KeyNotFoundException($"Application {applicationId} not found");
        }

        var job = await _context.Jobs.FindAsync(application.JobId);
        if (job == null || job.OrganizationId != organizationId)
        {
            throw new UnauthorizedAccessException("User does not have access to this application");
        }

        // Validate transition
        var transition = $"{application.CurrentStatus}->{toStatus}";
        if (!ValidTransitions.Contains(transition))
        {
            throw new InvalidOperationException($"Invalid transition: {transition}");
        }

        // Pre-hire check requirement
        if (toStatus == ApplicationStatus.Hired)
        {
            if (application.CurrentStatus != ApplicationStatus.PreHireChecks)
            {
                throw new InvalidOperationException("Application must be in PreHireChecks status before hiring");
            }

            if (preHireConfirmation != true)
            {
                throw new InvalidOperationException("Pre-hire checks confirmation is required before marking as Hired");
            }

            if (string.IsNullOrEmpty(preHireConfirmationText))
            {
                throw new InvalidOperationException("Pre-hire check confirmation text must be provided");
            }
        }

        // For rejections, notes are recommended
        if (toStatus == ApplicationStatus.Rejected && string.IsNullOrEmpty(notes))
        {
            _logger.LogWarning("Rejection without notes for application {AppId}", applicationId);
        }

        var previousStatus = application.CurrentStatus;
        application.CurrentStatus = toStatus;
        application.UpdatedAt = DateTime.UtcNow;

        // Create status history entry
        var statusHistory = new ApplicationStatusHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = application.Id,
            FromStatus = previousStatus,
            ToStatus = toStatus,
            ChangedByUserId = userId,
            ChangedAt = DateTime.UtcNow,
            Notes = notes,
            PreHireCheckConfirmation = toStatus == ApplicationStatus.Hired ? preHireConfirmation : null,
            PreHireCheckConfirmationText = toStatus == ApplicationStatus.Hired ? preHireConfirmationText : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ApplicationStatusHistories.Add(statusHistory);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "ApplicationStatusChanged",
            "Application",
            application.Id.ToString(),
            new
            {
                applicationId = application.Id,
                jobId = application.JobId,
                fromStatus = previousStatus.ToString(),
                toStatus = toStatus.ToString(),
                notes,
                preHireConfirmation = toStatus == ApplicationStatus.Hired ? preHireConfirmation : null
            },
            userId,
            organizationId
        );

        _logger.LogInformation(
            "Application {AppId} moved from {From} to {To} by user {UserId}",
            applicationId, previousStatus, toStatus, userId);

        return MapToDto(application, null);
    }

    public async Task<PipelineViewDto> GetPipelineViewAsync(Guid jobId, Guid organizationId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null || job.OrganizationId != organizationId)
        {
            throw new UnauthorizedAccessException("User does not have access to this job");
        }

        var applications = await _context.Applications
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        var pipelineView = new PipelineViewDto
        {
            JobId = jobId,
            JobTitle = job.Title
        };

        // Initialize stages
        foreach (ApplicationStatus status in Enum.GetValues(typeof(ApplicationStatus)))
        {
            pipelineView.Stages[status] = new List<ApplicationCardDto>();
        }

        // Group applications by status
        foreach (var app in applications)
        {
            var card = new ApplicationCardDto
            {
                Id = app.Id,
                CandidateUserId = app.CandidateUserId,
                CurrentStatus = app.CurrentStatus,
                AppliedAt = app.AppliedAt,
                CoverLetterPreview = app.CoverLetter?.Substring(0, Math.Min(100, app.CoverLetter.Length)) + "..."
            };

            pipelineView.Stages[app.CurrentStatus].Add(card);
        }

        return pipelineView;
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
}
