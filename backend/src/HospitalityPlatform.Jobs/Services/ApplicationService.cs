using HospitalityPlatform.Audit.Services;
using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Jobs.Services;

public class ApplicationService : IApplicationService
{
    private readonly IJobsDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<ApplicationService> _logger;

    public ApplicationService(
        IJobsDbContext context,
        IAuditService auditService,
        ILogger<ApplicationService> logger)
    {
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<ApplicationDto> ApplyToJobAsync(Guid jobId, CreateApplicationDto dto, Guid candidateId, Guid organizationId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null)
        {
            throw new KeyNotFoundException($"Job {jobId} not found");
        }

        if (job.Status != JobStatus.Published)
        {
            throw new InvalidOperationException("Cannot apply to unpublished jobs");
        }

        // Check if already applied
        var existing = await _context.Applications
            .FirstOrDefaultAsync(a => a.JobId == jobId && a.CandidateId == candidateId);
        if (existing != null)
        {
            throw new InvalidOperationException("You have already applied to this job");
        }

        var application = new Application
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            CandidateId = candidateId,
            OrganizationId = job.OrganizationId,
            Status = ApplicationStatus.Applied,
            CoverLetter = dto.CoverLetter,
            AppliedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "ApplicationCreated",
            "Application",
            application.Id.ToString(),
            new { applicationId = application.Id, jobId, candidateId },
            candidateId.ToString(),
            job.OrganizationId
        );

        _logger.LogInformation("Application {ApplicationId} created by candidate {CandidateId} for job {JobId}", application.Id, candidateId, jobId);

        return MapToDto(application, job);
    }

    public async Task<ApplicationDto?> GetApplicationByIdAsync(Guid applicationId)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
        {
            return null;
        }

        var preHireCheck = await _context.PreHireConfirmations
            .FirstOrDefaultAsync(p => p.ApplicationId == applicationId && p.RightToWorkConfirmed);

        return MapToDto(application, application.Job, preHireCheck != null);
    }

    public async Task<PagedResult<ApplicationDto>> GetCandidateApplicationsAsync(Guid candidateId, int pageNumber = 1, int pageSize = 20)
    {
        var query = _context.Applications
            .Where(a => a.CandidateId == candidateId)
            .Include(a => a.Job)
            .OrderByDescending(a => a.AppliedAt);

        var total = await query.CountAsync();
        var applications = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<ApplicationDto>();
        foreach (var app in applications)
        {
            var preHireCheck = await _context.PreHireConfirmations
                .FirstOrDefaultAsync(p => p.ApplicationId == app.Id && p.RightToWorkConfirmed);
            dtos.Add(MapToDto(app, app.Job, preHireCheck != null));
        }

        return new PagedResult<ApplicationDto>
        {
            Items = dtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = total
        };
    }

    public async Task<PagedResult<ApplicationDto>> GetJobApplicationsAsync(Guid jobId, int pageNumber = 1, int pageSize = 20)
    {
        var query = _context.Applications
            .Where(a => a.JobId == jobId)
            .Include(a => a.Job)
            .OrderByDescending(a => a.AppliedAt);

        var total = await query.CountAsync();
        var applications = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<ApplicationDto>();
        foreach (var app in applications)
        {
            var preHireCheck = await _context.PreHireConfirmations
                .FirstOrDefaultAsync(p => p.ApplicationId == app.Id && p.RightToWorkConfirmed);
            dtos.Add(MapToDto(app, app.Job, preHireCheck != null));
        }

        return new PagedResult<ApplicationDto>
        {
            Items = dtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = total
        };
    }

    public async Task<ApplicationDto> UpdateApplicationStatusAsync(Guid applicationId, UpdateApplicationStatusDto dto, Guid movedByUserId)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException($"Application {applicationId} not found");
        }

        // Enforce: cannot move to Hired without pre-hire confirmation
        if (dto.Status == ApplicationStatus.Hired)
        {
            var preHireCheck = await _context.PreHireConfirmations
                .FirstOrDefaultAsync(p => p.ApplicationId == applicationId && p.RightToWorkConfirmed);
            if (preHireCheck == null)
            {
                throw new InvalidOperationException("Pre-hire confirmation required before marking as Hired");
            }
        }

        var oldStatus = application.Status;
        application.Status = dto.Status;
        application.UpdatedAt = DateTime.UtcNow;

        // Update stage timestamps
        switch (dto.Status)
        {
            case ApplicationStatus.Screening:
                application.ScreenedAt = DateTime.UtcNow;
                break;
            case ApplicationStatus.Interviewed:
                application.InterviewedAt = DateTime.UtcNow;
                break;
            case ApplicationStatus.Offered:
                application.OfferedAt = DateTime.UtcNow;
                break;
            case ApplicationStatus.PreHireChecks:
                application.PreHireChecksStartedAt = DateTime.UtcNow;
                break;
            case ApplicationStatus.Hired:
                application.HiredAt = DateTime.UtcNow;
                break;
            case ApplicationStatus.Rejected:
                application.RejectedAt = DateTime.UtcNow;
                application.RejectionReason = dto.RejectionReason;
                break;
            case ApplicationStatus.Withdrawn:
                application.WithdrawnAt = DateTime.UtcNow;
                break;
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "ApplicationStatusChanged",
            "Application",
            application.Id.ToString(),
            new { applicationId, oldStatus, newStatus = dto.Status, rejectionReason = dto.RejectionReason },
            movedByUserId.ToString(),
            application.OrganizationId
        );

        _logger.LogInformation("Application {ApplicationId} status changed from {OldStatus} to {NewStatus}", applicationId, oldStatus, dto.Status);

        var preHireConfirmed = await _context.PreHireConfirmations
            .FirstOrDefaultAsync(p => p.ApplicationId == applicationId && p.RightToWorkConfirmed);

        return MapToDto(application, application.Job, preHireConfirmed != null);
    }

    public async Task<PipelineKanbanDto> GetPipelineKanbanAsync(Guid jobId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null)
        {
            throw new KeyNotFoundException($"Job {jobId} not found");
        }

        var applications = await _context.Applications
            .Where(a => a.JobId == jobId)
            .ToListAsync();

        var stages = Enum.GetValues(typeof(PipelineStage))
            .Cast<PipelineStage>()
            .Select(stage => new PipelineStageDto
            {
                Stage = stage,
                StageName = stage.ToString(),
                Count = applications.Count(a => (PipelineStage)(int)a.Status == stage),
                Applications = new List<ApplicationDto>()
            })
            .ToList();

        // Load applications for each stage
        foreach (var stageDto in stages)
        {
            var stageApps = applications
                .Where(a => (PipelineStage)(int)a.Status == stageDto.Stage)
                .ToList();

            foreach (var app in stageApps)
            {
                var preHireCheck = await _context.PreHireConfirmations
                    .FirstOrDefaultAsync(p => p.ApplicationId == app.Id && p.RightToWorkConfirmed);
                stageDto.Applications.Add(MapToDto(app, job, preHireCheck != null));
            }
        }

        return new PipelineKanbanDto
        {
            JobId = jobId,
            JobTitle = job.Title,
            Stages = stages,
            TotalApplications = applications.Count
        };
    }

    public async Task<ApplicationDto> ConfirmPreHireChecksAsync(Guid applicationId, PreHireConfirmationDto dto, Guid confirmedByUserId)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException($"Application {applicationId} not found");
        }

        // Create pre-hire confirmation record
        var confirmation = new PreHireConfirmation
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            ConfirmedByUserId = confirmedByUserId,
            OrganizationId = application.OrganizationId,
            RightToWorkConfirmed = dto.RightToWorkConfirmed,
            ConfirmationText = dto.ConfirmationText,
            ConfirmedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PreHireConfirmations.Add(confirmation);

        // Move application to PreHireChecks status if not already
        if (application.Status != ApplicationStatus.PreHireChecks && application.Status != ApplicationStatus.Hired)
        {
            application.Status = ApplicationStatus.PreHireChecks;
            application.PreHireChecksStartedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PreHireCheckConfirmed",
            "PreHireConfirmation",
            confirmation.Id.ToString(),
            new { applicationId, confirmedByUserId, rightToWorkConfirmed = dto.RightToWorkConfirmed },
            confirmedByUserId.ToString(),
            application.OrganizationId
        );

        _logger.LogInformation("Pre-hire checks confirmed for application {ApplicationId}", applicationId);

        return MapToDto(application, application.Job, true);
    }

    public async Task<bool> CanHireAsync(Guid applicationId)
    {
        var preHireCheck = await _context.PreHireConfirmations
            .FirstOrDefaultAsync(p => p.ApplicationId == applicationId && p.RightToWorkConfirmed);

        return preHireCheck != null;
    }

    private ApplicationDto MapToDto(Application application, Job? job = null, bool preHireCheckConfirmed = false)
    {
        return new ApplicationDto
        {
            Id = application.Id,
            JobId = application.JobId,
            CandidateId = application.CandidateId,
            OrganizationId = application.OrganizationId,
            Status = application.Status,
            CoverLetter = application.CoverLetter,
            AppliedAt = application.AppliedAt,
            ScreenedAt = application.ScreenedAt,
            InterviewedAt = application.InterviewedAt,
            OfferedAt = application.OfferedAt,
            PreHireChecksStartedAt = application.PreHireChecksStartedAt,
            HiredAt = application.HiredAt,
            RejectedAt = application.RejectedAt,
            WithdrawnAt = application.WithdrawnAt,
            RejectionReason = application.RejectionReason,
            PreHireCheckConfirmed = preHireCheckConfirmed,
            Job = job != null ? new JobDto
            {
                Id = job.Id,
                OrganizationId = job.OrganizationId,
                Title = job.Title,
                Description = job.Description,
                RoleType = job.RoleType,
                EmploymentType = job.EmploymentType,
                ShiftPattern = job.ShiftPattern,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                SalaryCurrency = job.SalaryCurrency,
                SalaryPeriod = job.SalaryPeriod,
                Location = job.Location,
                PostalCode = job.PostalCode,
                Status = job.Status,
                PublishedAt = job.PublishedAt,
                ExpiresAt = job.ExpiresAt,
                CreatedAt = job.CreatedAt
            } : null
        };
    }
}
